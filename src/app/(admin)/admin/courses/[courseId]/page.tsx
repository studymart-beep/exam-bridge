"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TopicForm from "@/components/admin/forms/TopicForm";
import { getAdminCourseById } from "@/lib/mock/adminCourses";
import { getAdminTopicsByCourse } from "@/lib/mock/adminTopics";
import type { AdminTopic } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function AdminCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const course = getAdminCourseById(courseId);
  const [topics, setTopics] = useState<AdminTopic[]>(getAdminTopicsByCourse(courseId));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminTopic | null>(null);

  if (!course) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">Course not found. <Link href="/admin/courses" className="text-primary">Back</Link></p>
      </div>
    );
  }

  const move = (id: string, dir: -1 | 1) => {
    setTopics((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((t) => t.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= sorted.length) return prev;
      const a = sorted[idx].order;
      sorted[idx] = { ...sorted[idx], order: sorted[swap].order };
      sorted[swap] = { ...sorted[swap], order: a };
      return sorted.sort((x, y) => x.order - y.order);
    });
  };

  const handleSave = (data: { title: string; description: string; duration: string }) => {
    // TODO: replace with API call
    if (editing) {
      setTopics((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...data } : t)));
      showToast("Topic updated", "success");
    } else {
      setTopics((prev) => [
        ...prev,
        {
          id: `topic-${Date.now()}`,
          courseId,
          subjectId: course.subjectId,
          ...data,
          order: prev.length + 1,
          published: true,
          hasVideo: false,
          hasPdf: false,
          hasCbt: false,
        },
      ]);
      showToast("Topic added", "success");
    }
    setModal(false);
    setEditing(null);
  };

  return (
    <div>
      <AdminHeader title={course.title} subtitle={course.subjectName} onMenuClick={openMenu} />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <Link href="/admin/courses" className="text-sm text-primary hover:underline">← Back to courses</Link>
        <Card>
          <p className="text-sm text-text-secondary">{course.description}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge variant="info">{course.level}</Badge>
            <Badge variant={course.published ? "success" : "default"}>
              {course.published ? "Published" : "Draft"}
            </Badge>
            <span className="text-xs text-text-muted self-center">{topics.length} topics</span>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-text-primary">Topics</h3>
          <Button size="sm" onClick={() => { setEditing(null); setModal(true); }}>Add topic</Button>
        </div>

        <div className="space-y-2">
          {topics.map((t) => (
            <Card key={t.id} padding="sm" className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => move(t.id, -1)} className="text-xs text-text-muted hover:text-primary">↑</button>
                <button type="button" onClick={() => move(t.id, 1)} className="text-xs text-text-muted hover:text-primary">↓</button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{t.order}. {t.title}</p>
                <p className="text-xs text-text-muted">{t.duration}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(t); setModal(true); }}>Edit</Button>
            </Card>
          ))}
        </div>
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setEditing(null); }} title={editing ? "Edit topic" : "Add topic"}>
        <TopicForm initial={editing || undefined} onSubmit={handleSave} onCancel={() => { setModal(false); setEditing(null); }} />
      </Modal>
    </div>
  );
}
