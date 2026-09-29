"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { AdminCbtQuestion } from "@/types";
import { cn } from "@/lib/utils";

interface QuestionEditorProps {
  initial?: Partial<AdminCbtQuestion>;
  onSubmit: (data: {
    question: string;
    options: { A: string; B: string; C: string; D: string };
    correctAnswer: "A" | "B" | "C" | "D";
    explanation: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

const KEYS = ["A", "B", "C", "D"] as const;

export default function QuestionEditor({ initial, onSubmit, onCancel, loading }: QuestionEditorProps) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [options, setOptions] = useState({
    A: initial?.options?.A || "",
    B: initial?.options?.B || "",
    C: initial?.options?.C || "",
    D: initial?.options?.D || "",
  });
  const [correct, setCorrect] = useState<"A" | "B" | "C" | "D">(initial?.correctAnswer || "A");
  const [explanation, setExplanation] = useState(initial?.explanation || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!question.trim()) err.question = "Question is required";
    KEYS.forEach((k) => {
      if (!options[k].trim()) err[`opt${k}`] = `Option ${k} is required`;
    });
    setErrors(err);
    if (Object.keys(err).length) return;
    // TODO: replace with API call
    onSubmit({ question: question.trim(), options, correctAnswer: correct, explanation: explanation.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea label="Question" value={question} onChange={(e) => setQuestion(e.target.value)} error={errors.question} placeholder="Enter the question..." />
      {KEYS.map((k) => (
        <div key={k} className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => setCorrect(k)}
            className={cn(
              "mt-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors",
              correct === k ? "bg-primary text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            )}
          >
            {k}
          </button>
          <Input
            value={options[k]}
            onChange={(e) => setOptions((o) => ({ ...o, [k]: e.target.value }))}
            error={errors[`opt${k}`]}
            placeholder={`Option ${k}`}
            className="flex-1"
          />
        </div>
      ))}
      <p className="text-xs text-text-muted -mt-2">Click a letter to mark the correct answer</p>
      <Textarea label="Explanation" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why this answer is correct..." />
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center text-sm text-text-muted">
        Image upload placeholder (optional)
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? "Save Question" : "Add Question"}</Button>
      </div>
    </form>
  );
}
