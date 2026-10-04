"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "@/components/admin/AdminMenuContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  createSubject,
  updateSubject,
  deleteSubject,
  reorderSubject,
} from "@/lib/actions/admin/subjects";

type SubjectRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  topic_count?: number;
};

export default function AdminSubjectsPage() {
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const [rows, setRows] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SubjectRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subjects", { cache: "no-store" });
      if (res.ok) {
        setRows(await res.json());
      } else {
        // fallback: empty
        setRows([]);
      }
    } catch {
      setRows([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setModal(true);
  }

  function openEdit(s: SubjectRow) {
    setEditing(s);
    setName(s.name);
    setDescription(s.description || "");
    setModal(true);
  }

  function handleSave() {
    const fd = new FormData();
    fd.set("name", name);
    fd.set("description", description);
    if (editing) fd.set("id", editing.id);

    startTransition(async () => {
      const res = editing ? await updateSubject(fd) : await createSubject(fd);
      if (!res.success) {
        showToast(res.error || "Failed", "error");
        return;
      }
      showToast(editing ? "Subject updated" : "Subject created", "success");
      setModal(false);
      await load();
    });
  }

  return (
    <div>
      <AdminHeader
        title="Subjects"
        subtitle={`${rows.length} subjects`}
        onMenuClick={openMenu}
        actions={
          <Button size="sm" onClick={openCreate}>
            Add subject
          </Button>
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-4xl mx-auto space-y-3">
        {loading && <p className="text-sm text-text-muted text-center py-8">Loading…</p>}
        {!loading && rows.length === 0 && (
          <Card className="text-center py-10">
            <p className="text-text-muted text-sm">Nothing here yet. Add your first subject.</p>
            <Button className="mt-4" size="sm" onClick={openCreate}>
              Add subject
            </Button>
          </Card>
        )}
        {rows.map((s) => (
          <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-text-primary">{s.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">
                /{s.slug} · {s.topic_count ?? 0} topics · order #{s.order_index}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href={`/admin/subjects/${s.id}/topics`}>
                <Button size="sm" variant="outline">
                  Topics
                </Button>
              </Link>
              <Link href={`/admin/subjects/${s.id}/cbt`}>
                <Button size="sm" variant="ghost">
                  General CBT
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={() => openEdit(s)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  startTransition(async () => {
                    await reorderSubject(s.id, "up");
                    await load();
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
                    await reorderSubject(s.id, "down");
                    await load();
                  })
                }
              >
                ↓
              </Button>
              <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(s.id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Edit subject" : "Add subject"}>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button loading={pending} onClick={handleSave}>
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
            const res = await deleteSubject(deleteId);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast("Subject deleted", "success");
              setDeleteId(null);
              await load();
            }
          });
        }}
        title="Delete subject?"
        message="This will also remove its topics (cascade)."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
