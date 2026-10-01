"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  type QuestionInput,
} from "@/lib/actions/admin/questions";
import type { AdminQuestionRow } from "@/lib/data/admin/cbt";

const empty: QuestionInput = {
  question_text: "",
  explanation: "",
  correct: "A",
  options: { A: "", B: "", C: "", D: "" },
};

export default function QuestionsManager({
  examId,
  initial,
}: {
  examId: string;
  initial: AdminQuestionRow[];
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionInput>(empty);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulk, setBulk] = useState("");
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setEditingId(null);
    setForm(empty);
    setModal(true);
  }

  function openEdit(q: AdminQuestionRow) {
    setEditingId(q.id);
    const opts = { A: "", B: "", C: "", D: "" };
    let correct: "A" | "B" | "C" | "D" = "A";
    q.options.forEach((o) => {
      if (o.label in opts) opts[o.label as keyof typeof opts] = o.option_text;
      if (o.is_correct) correct = o.label as "A" | "B" | "C" | "D";
    });
    setForm({
      question_text: q.question_text,
      explanation: q.explanation || "",
      correct,
      options: opts,
    });
    setModal(true);
  }

  function save() {
    startTransition(async () => {
      const res = editingId
        ? await updateQuestion(editingId, examId, form)
        : await createQuestion(examId, form);
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast("Saved", "success");
        setModal(false);
        router.refresh();
      }
    });
  }

  function parseBulk() {
    const blocks = bulk.split(/\n\s*\n/).filter(Boolean);
    const items: QuestionInput[] = [];
    for (const block of blocks) {
      const lines = block.split("\n").map((l) => l.trim());
      const qLine = lines.find((l) => l.startsWith("Q:"));
      const a = lines.find((l) => /^A\)/.test(l));
      const b = lines.find((l) => /^B\)/.test(l));
      const c = lines.find((l) => /^C\)/.test(l));
      const d = lines.find((l) => /^D\)/.test(l));
      const ans = lines.find((l) => l.startsWith("Answer:"));
      const exp = lines.find((l) => l.startsWith("Explanation:"));
      if (!qLine || !a || !b || !c || !d || !ans) continue;
      const correct = ans.replace("Answer:", "").trim().toUpperCase().charAt(0) as "A" | "B" | "C" | "D";
      items.push({
        question_text: qLine.replace(/^Q:\s*/, ""),
        explanation: exp?.replace(/^Explanation:\s*/, "") || "",
        correct,
        options: {
          A: a.replace(/^A\)\s*/, ""),
          B: b.replace(/^B\)\s*/, ""),
          C: c.replace(/^C\)\s*/, ""),
          D: d.replace(/^D\)\s*/, ""),
        },
      });
    }
    if (!items.length) {
      showToast("Could not parse any questions", "warning");
      return;
    }
    startTransition(async () => {
      const res = await bulkCreateQuestions(examId, items);
      if (!res.success) showToast(res.error || "Failed", "error");
      else {
        showToast(`Added ${items.length} questions`, "success");
        setBulk("");
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          Add question
        </Button>
      </div>
      {initial.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-text-muted">No questions yet.</p>
        </Card>
      )}
      {initial.map((q, i) => {
        const correct = q.options.find((o) => o.is_correct)?.label || "?";
        return (
          <Card key={q.id} className="flex gap-3 items-start">
            <span className="text-xs font-bold text-text-muted">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
              <p className="text-xs text-text-muted mt-1">Answer: {correct}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => openEdit(q)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="text-error" onClick={() => setDeleteId(q.id)}>
              Delete
            </Button>
          </Card>
        );
      })}

      <Card className="space-y-3">
        <h3 className="font-heading font-semibold">Bulk paste</h3>
        <Textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={8}
          placeholder={"Q: ...\nA) ...\nB) ...\nC) ...\nD) ...\nAnswer: A\nExplanation: ...\n\n"}
        />
        <Button size="sm" loading={pending} onClick={parseBulk}>
          Parse & save
        </Button>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? "Edit question" : "Add question"}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <Textarea
            label="Question"
            value={form.question_text}
            onChange={(e) => setForm({ ...form, question_text: e.target.value })}
            rows={3}
          />
          {(["A", "B", "C", "D"] as const).map((lab) => (
            <Input
              key={lab}
              label={`Option ${lab}`}
              value={form.options[lab]}
              onChange={(e) =>
                setForm({ ...form, options: { ...form.options, [lab]: e.target.value } })
              }
            />
          ))}
          <label className="block text-sm font-medium">Correct answer</label>
          <select
            value={form.correct}
            onChange={(e) => setForm({ ...form, correct: e.target.value as "A" | "B" | "C" | "D" })}
            className="w-full h-11 px-3 rounded-xl border border-border text-sm"
          >
            {(["A", "B", "C", "D"] as const).map((lab) => (
              <option key={lab} value={lab}>
                {lab}
              </option>
            ))}
          </select>
          <Textarea
            label="Explanation"
            value={form.explanation || ""}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            rows={2}
          />
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
            const res = await deleteQuestion(deleteId, examId);
            if (!res.success) showToast(res.error || "Failed", "error");
            else {
              showToast("Deleted", "success");
              setDeleteId(null);
              router.refresh();
            }
          });
        }}
        title="Delete question?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
