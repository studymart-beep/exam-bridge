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
} from "@/lib/actions/admin/materials";
import type { AdminMaterialRow } from "@/lib/data/admin/materials";

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
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setType("video");
    setTitle("");
    setSource("");
    setModal(true);
  }

  function openEdit(m: AdminMaterialRow) {
    setEditing(m);
    setType(m.type);
    setTitle(m.title);
    setSource(m.source || "");
    setModal(true);
  }

  function save() {
    const fd = new FormData();
    fd.set("topic_id", topicId);
    fd.set("type", type);
    fd.set("title", title);
    fd.set("source", source);
    if (editing) fd.set("id", editing.id);
    startTransition(async () => {
      const res = editing ? await updateMaterial(fd) : await createMaterial(fd);
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast("Saved", "success");
        setModal(false);
        router.refresh();
      }
    });
  }

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
          <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(m.id)}>
            Delete
          </Button>
        </Card>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit material" : "Add material"}>
        <div className="space-y-4">
          <label className="block text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "video" | "pdf" | "image")}
            className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm"
          >
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="image">Image</option>
          </select>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input
            label={type === "video" ? "Cloudflare video ID" : "File name / URL"}
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
          {type !== "video" && (
            <p className="text-xs text-text-muted">File upload available after full storage wiring. Paste a URL for now.</p>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button loading={pending} onClick={save}>
              Save
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
