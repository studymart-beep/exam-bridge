"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  createTopic,
  updateTopic,
  deleteTopic,
  toggleTopicPublished,
  reorderTopic,
} from "@/lib/actions/admin/topics";
import type { AdminTopicRow } from "@/lib/data/admin/topics";
import { useRouter } from "next/navigation";

export default function TopicsManager({
  subjectId,
  initial,
}: {
  subjectId: string;
  initial: AdminTopicRow[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminTopicRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30 min");
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDuration("30 min");
    setModal(true);
  }

  function openEdit(t: AdminTopicRow) {
    setEditing(t);
    setTitle(t.title);
    setDescription(t.description || "");
    setDuration(t.duration || "30 min");
    setModal(true);
  }

  function save() {
    const fd = new FormData();
    fd.set("subject_id", subjectId);
    fd.set("title", title);
    fd.set("description", description);
    fd.set("duration", duration);
    if (editing) fd.set("id", editing.id);
    startTransition(async () => {
      const res = editing ? await updateTopic(fd) : await createTopic(fd);
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
          Add topic
        </Button>
      </div>
      {initial.length === 0 && (
        <Card className="text-center py-10">
          <p className="text-sm text-text-muted">Nothing here yet.</p>
        </Card>
      )}
      {initial.map((t) => (
        <Card key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-text-muted">#{t.order_index}</span>
              <h3 className="font-heading font-semibold">{t.title}</h3>
              <Badge variant={t.is_published ? "success" : "default"} size="sm">
                {t.is_published ? "Live" : "Draft"}
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{t.duration}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/admin/topics/${t.id}/materials`}>
              <Button size="sm" variant="outline">
                Content
              </Button>
            </Link>
            <Link href={`/admin/topics/${t.id}/cbt`}>
              <Button size="sm" variant="ghost">
                CBT
              </Button>
            </Link>
            <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                startTransition(async () => {
                  await toggleTopicPublished(t.id, subjectId, !t.is_published);
                  router.refresh();
                })
              }
            >
              {t.is_published ? "Unpublish" : "Publish"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                startTransition(async () => {
                  await reorderTopic(t.id, subjectId, "up");
                  router.refresh();
                })
              }
            >
              ↑
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                startTransition(async () => {
                  await reorderTopic(t.id, subjectId, "down");
                  router.refresh();
                })
              }
            >
              ↓
            </Button>
            <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(t.id)}>
              Delete
            </Button>
          </div>
        </Card>
      ))}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit topic" : "Add topic"}>
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input label="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
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
            const res = await deleteTopic(deleteId, subjectId);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast("Deleted", "success");
              setDeleteId(null);
              router.refresh();
            }
          });
        }}
        title="Delete topic?"
        message="Materials under this topic will also be removed."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
