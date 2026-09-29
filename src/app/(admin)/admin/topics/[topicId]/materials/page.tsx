"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../../layout";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import MaterialForm from "@/components/admin/MaterialForm";
import MaterialRow from "@/components/admin/MaterialRow";
import { getMaterialsByTopicId } from "@/lib/mock/adminMaterials";
import { adminTopics } from "@/lib/mock/adminTopics";
import { getAdminCourseById } from "@/lib/mock/adminCourses";
import type { Material, MaterialType } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function TopicMaterialsPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const topic = adminTopics.find((t) => t.id === topicId);
  const course = topic ? getAdminCourseById(topic.courseId) : undefined;
  const [materials, setMaterials] = useState<Material[]>(getMaterialsByTopicId(topicId));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!topic) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">
          Topic not found.{" "}
          <Link href="/admin/subjects" className="text-primary">
            Back
          </Link>
        </p>
      </div>
    );
  }

  const handleSave = (data: {
    type: MaterialType;
    title: string;
    source: string;
    orderIndex: number;
  }) => {
    // TODO: replace with API call
    if (editing) {
      setMaterials((prev) =>
        prev
          .map((m) => (m.id === editing.id ? { ...m, ...data } : m))
          .sort((a, b) => a.orderIndex - b.orderIndex)
      );
      showToast("Material updated", "success");
    } else {
      setMaterials((prev) =>
        [
          ...prev,
          {
            id: `mat-${Date.now()}`,
            topicId,
            ...data,
            createdAt: new Date().toISOString(),
          },
        ].sort((a, b) => a.orderIndex - b.orderIndex)
      );
      showToast("Material added", "success");
    }
    setModal(false);
    setEditing(null);
  };

  const move = (id: string, dir: -1 | 1) => {
    setMaterials((prev) => {
      const sorted = [...prev].sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = sorted.findIndex((m) => m.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= sorted.length) return prev;
      const tmp = sorted[idx].orderIndex;
      sorted[idx] = { ...sorted[idx], orderIndex: sorted[swap].orderIndex };
      sorted[swap] = { ...sorted[swap], orderIndex: tmp };
      return sorted.sort((a, b) => a.orderIndex - b.orderIndex);
    });
  };

  const backHref = topic.subjectId
    ? `/admin/subjects/${topic.subjectId}/topics`
    : "/admin/subjects";

  return (
    <div>
      <AdminHeader
        title="Materials"
        subtitle={topic.title}
        onMenuClick={openMenu}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setModal(true);
            }}
          >
            Add material
          </Button>
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <div className="text-sm text-text-muted">
          <Link href={backHref} className="text-primary hover:underline">
            ← Topics
          </Link>
          {course && <span> · {course.title}</span>}
          <span> · {topic.title}</span>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-text-primary">Materials</h3>
          <Link href={`/admin/topics/${topicId}/cbt`} className="text-sm text-primary hover:underline">
            Manage topic CBT →
          </Link>
        </div>

        {materials.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-text-muted">No materials yet. Add the first one.</p>
            <Button
              onClick={() => {
                setEditing(null);
                setModal(true);
              }}
            >
              Add material
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((m) => (
              <MaterialRow
                key={m.id}
                material={m}
                onEdit={() => {
                  setEditing(m);
                  setModal(true);
                }}
                onDelete={() => setDeleteId(m.id)}
                onMoveUp={() => move(m.id, -1)}
                onMoveDown={() => move(m.id, 1)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modal}
        onClose={() => {
          setModal(false);
          setEditing(null);
        }}
        title={editing ? "Edit material" : "Add material"}
      >
        <MaterialForm
          initial={editing || undefined}
          onSubmit={handleSave}
          onCancel={() => {
            setModal(false);
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          // TODO: replace with API call
          setMaterials((prev) => prev.filter((m) => m.id !== deleteId));
          showToast("Material deleted", "success");
          setDeleteId(null);
        }}
        title="Delete material?"
        message="This material will be removed from the topic."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
