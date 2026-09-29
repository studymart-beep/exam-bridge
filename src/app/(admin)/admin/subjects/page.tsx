"use client";

import { useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import SubjectForm from "@/components/admin/forms/SubjectForm";
import { adminSubjects as initial } from "@/lib/mock/adminSubjects";
import type { AdminSubject } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function AdminSubjectsPage() {
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<AdminSubject[]>([...initial].sort((a, b) => a.order - b.order));
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<AdminSubject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = (data: { name: string; slug: string; description: string; letter: string }) => {
    // TODO: replace with API call
    if (editing) {
      setSubjects((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...data } : s))
      );
      showToast("Subject updated", "success");
    } else {
      const newSub: AdminSubject = {
        id: `subj-${Date.now()}`,
        ...data,
        color: "#1D4ED8",
        bgColor: "#DBEAFE",
        topicCount: 0,
        order: subjects.length + 1,
        published: true,
      };
      setSubjects((prev) => [...prev, newSub]);
      showToast("Subject added", "success");
    }
    setModal(null);
    setEditing(null);
  };

  const handleDelete = () => {
    // TODO: replace with API call
    setSubjects((prev) => prev.filter((s) => s.id !== deleteId));
    showToast("Subject deleted", "success");
    setDeleteId(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    setSubjects((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((s) => s.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= sorted.length) return prev;
      const tmp = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[swap].order };
      sorted[swap] = { ...sorted[swap], order: tmp };
      return sorted.sort((a, b) => a.order - b.order);
    });
  };

  return (
    <div>
      <AdminHeader
        title="Subjects"
        subtitle={`${subjects.length} subjects`}
        onMenuClick={openMenu}
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setModal("add"); }}>
            Add subject
          </Button>
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-3">
        {subjects.map((s) => (
          <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: s.bgColor, color: s.color }}
            >
              {s.letter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-text-primary">{s.name}</h3>
                <Badge variant={s.published ? "success" : "default"}>
                  {s.published ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-xs text-text-muted">
                {s.slug} · {s.topicCount} topics · order {s.order}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              <button type="button" onClick={() => move(s.id, -1)} className="p-2 rounded-lg text-text-muted hover:bg-gray-100 text-xs">↑</button>
              <button type="button" onClick={() => move(s.id, 1)} className="p-2 rounded-lg text-text-muted hover:bg-gray-100 text-xs">↓</button>
              <Link href={`/admin/subjects/${s.id}/topics`} className="px-2 py-1.5 text-xs font-medium text-primary hover:underline">
                Topics
              </Link>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(s); setModal("edit"); }}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(s.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modal !== null} onClose={() => { setModal(null); setEditing(null); }} title={editing ? "Edit subject" : "Add subject"}>
        <SubjectForm
          initial={editing || undefined}
          onSubmit={handleSave}
          onCancel={() => { setModal(null); setEditing(null); }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete subject?"
        message="This will remove the subject and may affect linked topics."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
