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
  requestCoverUploadUrl,
  setMaterialCover,
  removeMaterialCover,
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
  const [type, setType] = useState<"video" | "pdf" | "image" | "summary_image">(
    "video"
  );
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Cover-only modal for existing materials
  const [coverModal, setCoverModal] = useState<AdminMaterialRow | null>(null);
  const [coverOnlyFile, setCoverOnlyFile] = useState<File | null>(null);
  const [coverOnlyPreview, setCoverOnlyPreview] = useState<string | null>(null);
  const [coverBusy, setCoverBusy] = useState(false);

  function resetCoverPick() {
    setCoverFile(null);
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverPreview(null);
  }

  function openCreate() {
    setEditing(null);
    setType("video");
    setTitle("");
    setSource("");
    setFile(null);
    resetCoverPick();
    setProgress(0);
    setModal(true);
  }

  function openEdit(m: AdminMaterialRow) {
    setEditing(m);
    setType(m.type);
    setTitle(m.title);
    setSource(m.source || "");
    setFile(null);
    resetCoverPick();
    setModal(true);
  }

  function onPickCover(f: File | null) {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    if (!f) {
      setCoverFile(null);
      setCoverPreview(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      showToast("Cover must be JPEG, PNG, or WebP", "error");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      showToast("Cover must be ≤ 5 MB", "error");
      return;
    }
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  }

  async function uploadCoverFor(materialId: string, cover: File) {
    const urlRes = await requestCoverUploadUrl({
      materialId,
      fileName: cover.name,
      contentType: cover.type || "image/jpeg",
      size: cover.size,
    });
    if ("error" in urlRes) throw new Error(urlRes.error);
    await uploadWithProgress(urlRes.signedUrl, cover, () => {});
    const setRes = await setMaterialCover({
      materialId,
      topicId,
      path: urlRes.path,
    });
    if (!setRes.success) throw new Error(setRes.error || "Cover save failed");
  }

  async function save() {
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    if (editing) {
      const fd = new FormData();
      fd.set("id", editing.id);
      fd.set("topic_id", topicId);
      fd.set("type", type);
      fd.set("title", title);
      fd.set("source", source);
      startTransition(async () => {
        const res = await updateMaterial(fd);
        if (!res.success) {
          showToast(res.error || "Failed", "error");
          return;
        }
        if (coverFile) {
          try {
            setUploading(true);
            await uploadCoverFor(editing.id, coverFile);
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Cover failed", "error");
            setUploading(false);
            return;
          }
          setUploading(false);
        }
        showToast("Saved", "success");
        setModal(false);
        router.refresh();
      });
      return;
    }

    if (file && (type === "video" || type === "pdf" || type === "image" || type === "summary_image")) {
      const maxMb = type === "summary_image" || type === "image" ? 5 : MAX_MB;
      if (file.size > maxMb * 1024 * 1024) {
        showToast(`File must be ≤ ${maxMb} MB`, "error");
        return;
      }
      setUploading(true);
      setProgress(0);
      try {
        const defaultMime =
          type === "pdf"
            ? "application/pdf"
            : type === "video"
              ? "video/mp4"
              : "image/jpeg";
        const urlRes = await requestUploadUrl({
          topicId,
          fileName:
            type === "summary_image" ? `summary-${file.name}` : file.name,
          contentType: file.type || defaultMime,
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
          mimeType: file.type || defaultMime,
          size: file.size,
          materialType: type === "summary_image" ? "summary_image" : undefined,
        });
        if (!fin.success) {
          showToast(fin.error || "Finalize failed", "error");
          return;
        }
        if (coverFile && "id" in fin) {
          await uploadCoverFor(fin.id, coverFile);
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

  async function saveCoverOnly() {
    if (!coverModal) return;
    setCoverBusy(true);
    try {
      if (coverOnlyFile) {
        await uploadCoverFor(coverModal.id, coverOnlyFile);
        showToast("Cover saved", "success");
      }
      setCoverModal(null);
      setCoverOnlyFile(null);
      if (coverOnlyPreview) URL.revokeObjectURL(coverOnlyPreview);
      setCoverOnlyPreview(null);
      router.refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Cover failed", "error");
    } finally {
      setCoverBusy(false);
    }
  }

  async function clearCoverOnly() {
    if (!coverModal) return;
    setCoverBusy(true);
    try {
      const res = await removeMaterialCover({
        materialId: coverModal.id,
        topicId,
      });
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast("Cover removed", "success");
        setCoverModal(null);
        router.refresh();
      }
    } finally {
      setCoverBusy(false);
    }
  }

  const busy = pending || uploading;

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>Add material</Button>
      </div>

      <div className="space-y-3">
        {initial.length === 0 && (
          <Card className="p-6 text-center text-sm text-text-muted">
            No materials yet.
          </Card>
        )}
        {initial.map((m) => (
          <Card key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary-light to-accent-light flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                {m.type === "video" ? "VID" : m.type === "pdf" ? "PDF" : "IMG"}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-text-primary truncate">{m.title}</p>
                <p className="text-xs uppercase text-text-muted">
                  {m.type}
                  {m.cover_url ? " · has cover" : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCoverModal(m);
                  setCoverOnlyFile(null);
                  setCoverOnlyPreview(null);
                }}
              >
                {m.cover_url ? "Edit cover" : "Add cover"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-error"
                onClick={() => setDeleteId(m.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modal}
        onClose={() => !busy && setModal(false)}
        title={editing ? "Edit material" : "Add material"}
        fullScreenOnMobile={false}
        size="md"
      >
        <div className="space-y-4 p-1">
          <label className="block text-sm font-medium text-text-primary">
            Type
            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as "video" | "pdf" | "image" | "summary_image"
                )
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface"
              disabled={busy || !!editing}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="summary_image">Topic Summary Image</option>
            </select>
          </label>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
          />
          {!editing &&
            (type === "video" ||
              type === "pdf" ||
              type === "image" ||
              type === "summary_image") && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  File
                </label>
                <input
                  type="file"
                  accept={
                    type === "video"
                      ? "video/*"
                      : type === "pdf"
                        ? "application/pdf"
                        : "image/jpeg,image/png,image/webp"
                  }
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={busy}
                  className="block w-full text-sm"
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

          {(type === "video" || type === "pdf") && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Cover image (optional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onPickCover(e.target.files?.[0] || null)}
                disabled={busy}
                className="block w-full text-sm"
              />
              {coverPreview && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-20 h-14 object-cover rounded-lg border border-border"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onPickCover(null)}
                    disabled={busy}
                  >
                    Remove cover
                  </Button>
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
            placeholder="Optional if uploading a file"
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
            <Button
              loading={busy}
              onClick={() => void save()}
              className="w-full sm:w-auto"
            >
              {uploading ? `Uploading ${progress}%` : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!coverModal}
        onClose={() => !coverBusy && setCoverModal(null)}
        title={coverModal?.cover_url ? "Edit cover" : "Add cover"}
        fullScreenOnMobile={false}
        size="sm"
      >
        <div className="space-y-3 p-1">
          <p className="text-sm text-text-secondary truncate">
            {coverModal?.title}
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              if (coverOnlyPreview) URL.revokeObjectURL(coverOnlyPreview);
              if (!f) {
                setCoverOnlyFile(null);
                setCoverOnlyPreview(null);
                return;
              }
              if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
                showToast("Cover must be JPEG, PNG, or WebP", "error");
                return;
              }
              if (f.size > 5 * 1024 * 1024) {
                showToast("Cover must be ≤ 5 MB", "error");
                return;
              }
              setCoverOnlyFile(f);
              setCoverOnlyPreview(URL.createObjectURL(f));
            }}
            disabled={coverBusy}
            className="block w-full text-sm"
          />
          {coverOnlyPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverOnlyPreview}
              alt="Preview"
              className="w-full max-h-40 object-cover rounded-xl border border-border"
            />
          )}
          <div className="flex flex-col gap-2">
            <Button
              loading={coverBusy}
              onClick={() => void saveCoverOnly()}
              disabled={!coverOnlyFile}
            >
              Save cover
            </Button>
            {coverModal?.cover_url && (
              <Button
                variant="outline"
                className="text-error border-error/40"
                disabled={coverBusy}
                onClick={() => void clearCoverOnly()}
              >
                Remove cover
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setCoverModal(null)}
              disabled={coverBusy}
            >
              Cancel
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
