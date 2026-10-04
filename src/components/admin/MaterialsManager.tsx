"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
  requestUploadUrl,
  finalizeMaterial,
} from "@/lib/actions/admin/materials";
import type { AdminMaterialRow } from "@/lib/data/admin/materials";

const MAX_MB = 500;

function uploadWithProgress(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function MaterialsManager({
  topicId,
  initial,
}: {
  topicId: string;
  initial: AdminMaterialRow[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminMaterialRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [type, setType] = useState<"video" | "pdf" | "image">("video");
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function openCreate() {
    setEditing(null);
    setType("video");
    setTitle("");
    setSource("");
    setFile(null);
    setProgress(0);
    setModal(true);
  }

  function openEdit(m: AdminMaterialRow) {
    setEditing(m);
    setType(m.type);
    setTitle(m.title);
    setSource(m.source || "");
    setFile(null);
    setModal(true);
  }

  async function save() {
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    // Edit metadata only
    if (editing) {
      const fd = new FormData();
      fd.set("id", editing.id);
      fd.set("topic_id", topicId);
      fd.set("type", type);
      fd.set("title", title);
      fd.set("source", source);
      startTransition(async () => {
        const res = await updateMaterial(fd);
        if (!res.success) showToast(res.error || "Failed", "error");
        else {
          showToast("Saved", "success");
          setModal(false);
          router.refresh();
        }
      });
      return;
    }

    // New material with file → direct-to-Supabase
    if (file && (type === "video" || type === "pdf")) {
      if (file.size > MAX_MB * 1024 * 1024) {
        showToast(`File must be ≤ ${MAX_MB} MB`, "error");
        return;
      }
      setUploading(true);
      setProgress(0);
      try {
        const urlRes = await requestUploadUrl({
          topicId,
          fileName: file.name,
          contentType: file.type || (type === "pdf" ? "application/pdf" : "video/mp4"),
          size: file.size,
        });
        if ("error" in urlRes) {
          showToast(urlRes.error, "error");
          return;
        }
        await uploadWithProgress(urlRes.signedUrl, file, setProgress);
        const fin = await finalizeMaterial({
          topicId,
          title: title.trim(),
          path: urlRes.path,
          sourceType: "supabase",
          mimeType: file.type || (type === "pdf" ? "application/pdf" : "video/mp4"),
          size: file.size,
        });
        if (!fin.success) {
          showToast(fin.error || "Finalize failed", "error");
          return;
        }
        showToast("Uploaded", "success");
        setModal(false);
        router.refresh();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Upload failed", "error");
      } finally {
        setUploading(false);
      }
      return;
    }

    // Source-only (Cloudflare / URL / image)
    if (!source.trim()) {
      showToast("Upload a file or provide a source", "error");
      return;
    }
    const fd = new FormData();
    fd.set("topic_id", topicId);
    fd.set("type", type);
    fd.set("title", title);
    fd.set("source", source);
    startTransition(async () => {
      const res = await createMaterial(fd);
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast("Saved", "success");
        setModal(false);
        router.refresh();
      }
    });
  }

  const busy = pending || uploading;

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          Add material
        </Button>
      </div>
      {initial.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-sm text-text-muted">Nothing here yet.</p>
        </Card>
      )}
      {initial.map((m) => (
        <Card key={m.id} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase text-text-muted">{m.type}</p>
            <p className="font-medium">{m.title}</p>
            <p className="text-xs text-text-muted truncate">{m.source}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-error"
            onClick={() => setDeleteId(m.id)}
          >
            Delete
          </Button>
        </Card>
      ))}

      <Modal
        open={modal}
        onClose={() => !busy && setModal(false)}
        title={editing ? "Edit material" : "Add material"}
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium text-text-primary">Type</label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as "video" | "pdf" | "image");
              setFile(null);
            }}
            className="w-full min-h-11 h-11 px-3 rounded-lg border border-border text-base sm:text-sm bg-surface"
            disabled={!!editing || busy}
          >
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
          </select>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
          />
          {!editing && (type === "video" || type === "pdf") && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Upload file (max {MAX_MB} MB) — goes direct to storage
              </label>
              <input
                type="file"
                accept={type === "video" ? "video/*" : "application/pdf"}
                className="block w-full text-sm text-text-secondary"
                disabled={busy}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && (
                <p className="text-xs text-text-muted mt-1">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
              {uploading && (
                <div className="mt-3 space-y-1">
                  <div className="h-2 rounded-full bg-primary-light overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-text-secondary text-center">
                    Uploading… {progress}%
                  </p>
                </div>
              )}
            </div>
          )}
          <Input
            label={
              type === "video"
                ? "Or Cloudflare Stream ID / URL"
                : type === "pdf"
                  ? "Or PDF URL"
                  : "Image URL / path"
            }
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={busy}
            placeholder={
              type === "video"
                ? "Optional if uploading a file"
                : "Optional if uploading"
            }
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setModal(false)}
              disabled={busy}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button loading={busy} onClick={() => void save()} className="w-full sm:w-auto">
              {uploading ? `Uploading ${progress}%` : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          startTransition(async () => {
            const res = await deleteMaterial(deleteId, topicId);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast("Deleted", "success");
              setDeleteId(null);
              router.refresh();
            }
          });
        }}
        title="Delete material?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
