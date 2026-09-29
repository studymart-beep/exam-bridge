"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import CourseForm from "@/components/admin/forms/CourseForm";
import { adminCourses as initial } from "@/lib/mock/adminCourses";
import { adminSubjects } from "@/lib/mock/adminSubjects";
import type { AdminCourse } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function AdminCoursesPage() {
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<AdminCourse[]>([...initial]);
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(
    () => (subjectFilter === "all" ? courses : courses.filter((c) => c.subjectId === subjectFilter)),
    [courses, subjectFilter]
  );

  const handleSave = (data: { title: string; subjectId: string; description: string; level: string }) => {
    // TODO: replace with API call
    const subj = adminSubjects.find((s) => s.id === data.subjectId);
    if (editing) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, ...data, subjectName: subj?.name || c.subjectName }
            : c
        )
      );
      showToast("Course updated", "success");
    } else {
      setCourses((prev) => [
        ...prev,
        {
          id: `course-${Date.now()}`,
          ...data,
          subjectName: subj?.name || "",
          topicCount: 0,
          published: true,
          order: prev.length + 1,
        },
      ]);
      showToast("Course added", "success");
    }
    setModal(false);
    setEditing(null);
  };

  return (
    <div>
      <AdminHeader
        title="Courses"
        subtitle={`${filtered.length} courses`}
        onMenuClick={openMenu}
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setModal(true); }}>Add course</Button>
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-4">
        <div className="w-full sm:w-56">
          <Select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            options={[
              { value: "all", label: "All subjects" },
              ...adminSubjects.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
        </div>
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading font-semibold text-text-primary">{c.title}</h3>
                  <Badge variant={c.published ? "success" : "default"}>
                    {c.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  {c.subjectName} · {c.level} · {c.topicCount} topics
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/courses/${c.id}`}>
                  <Button size="sm" variant="ghost">View</Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => { setEditing(c); setModal(true); }}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(c.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? "Edit course" : "Add course"}>
        <CourseForm initial={editing || undefined} onSubmit={handleSave} onCancel={() => { setModal(false); setEditing(null); }} />
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          // TODO: replace with API call
          setCourses((prev) => prev.filter((c) => c.id !== deleteId));
          showToast("Course deleted", "success");
          setDeleteId(null);
        }}
        title="Delete course?"
        message="This course and its topic links will be removed."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
