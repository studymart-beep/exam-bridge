"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import QuestionEditor from "@/components/admin/forms/QuestionEditor";
import BulkQuestionPaste from "@/components/admin/BulkQuestionPaste";
import Tabs from "@/components/ui/Tabs";
import { getAdminCbtById } from "@/lib/mock/adminCbtExams";
import { getQuestionsByExamId } from "@/lib/mock/adminCbtQuestions";
import type { AdminCbtQuestion } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function AdminQuestionsPage() {
  const { examId } = useParams<{ examId: string }>();
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const exam = getAdminCbtById(examId);
  const [questions, setQuestions] = useState<AdminCbtQuestion[]>(getQuestionsByExamId(examId));
  const [mode, setMode] = useState<"list" | "add" | "edit" | "bulk">("list");
  const [editing, setEditing] = useState<AdminCbtQuestion | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!exam) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">Exam not found.</p>
      </div>
    );
  }

  const handleSave = (data: {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
  }) => {
    // TODO: replace with API call
    if (editing) {
      setQuestions((prev) => prev.map((q) => (q.id === editing.id ? { ...q, ...data } : q)));
      showToast("Question updated", "success");
    } else {
      setQuestions((prev) => [
        ...prev,
        { id: `q-${Date.now()}`, examId, order: prev.length + 1, ...data },
      ]);
      showToast("Question added", "success");
    }
    setMode("list");
    setEditing(null);
  };

  const handleBulk = (items: Omit<AdminCbtQuestion, "id" | "examId" | "order">[]) => {
    // TODO: replace with API call
    setQuestions((prev) => [
      ...prev,
      ...items.map((item, i) => ({
        ...item,
        id: `q-bulk-${Date.now()}-${i}`,
        examId,
        order: prev.length + i + 1,
      })),
    ]);
    showToast(`Imported ${items.length} questions`, "success");
    setMode("list");
  };

  return (
    <div>
      <AdminHeader
        title="Questions"
        subtitle={exam.title}
        onMenuClick={openMenu}
        actions={
          mode === "list" ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setMode("bulk")}>Bulk paste</Button>
              <Button size="sm" onClick={() => { setEditing(null); setMode("add"); }}>Add</Button>
            </div>
          ) : undefined
        }
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link href={`/admin/cbt/${examId}`} className="text-sm text-primary hover:underline">
          ← Back to exam
        </Link>

        {mode === "list" && (
          <div className="space-y-3">
            {questions.map((q) => (
              <Card key={q.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-text-primary">
                    {q.order}. {q.question}
                  </p>
                  <Badge variant="success" size="sm">{q.correctAnswer}</Badge>
                </div>
                <p className="text-xs text-text-muted line-clamp-1">
                  A) {q.options.A} · B) {q.options.B} · C) {q.options.C} · D) {q.options.D}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(q); setMode("edit"); }}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(q.id)}>Delete</Button>
                </div>
              </Card>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-text-muted text-sm py-8">No questions yet. Add one or bulk paste.</p>
            )}
          </div>
        )}

        {(mode === "add" || mode === "edit") && (
          <Card>
            <h3 className="font-heading font-semibold mb-4">{mode === "edit" ? "Edit question" : "Add question"}</h3>
            <QuestionEditor
              initial={editing || undefined}
              onSubmit={handleSave}
              onCancel={() => { setMode("list"); setEditing(null); }}
            />
          </Card>
        )}

        {mode === "bulk" && (
          <Card>
            <h3 className="font-heading font-semibold mb-4">Bulk paste questions</h3>
            <BulkQuestionPaste onImport={handleBulk} onCancel={() => setMode("list")} />
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          // TODO: replace with API call
          setQuestions((prev) => prev.filter((q) => q.id !== deleteId));
          showToast("Question deleted", "success");
          setDeleteId(null);
        }}
        title="Delete question?"
        message="This question will be removed from the exam."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
