"use client";

import { useState } from "react";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { AdminCbtQuestion } from "@/types";

interface ParsedQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  error?: string;
}

interface BulkQuestionPasteProps {
  onImport: (questions: Omit<AdminCbtQuestion, "id" | "examId" | "order">[]) => void;
  onCancel: () => void;
}

function parseBulkText(text: string): ParsedQuestion[] {
  const blocks = text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let question = "";
    const options = { A: "", B: "", C: "", D: "" };
    let correctAnswer: "A" | "B" | "C" | "D" = "A";
    let explanation = "";
    let error: string | undefined;

    for (const line of lines) {
      const qMatch = line.match(/^Q[:.)]\s*(.+)/i);
      if (qMatch) {
        question = qMatch[1];
        continue;
      }
      const optMatch = line.match(/^([A-Da-d])[).]\s*(.+)/);
      if (optMatch) {
        const key = optMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
        options[key] = optMatch[2];
        continue;
      }
      const ansMatch = line.match(/^Answer:\s*([A-Da-d])\)?/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1].toUpperCase() as "A" | "B" | "C" | "D";
        continue;
      }
      const expMatch = line.match(/^Explanation:\s*(.+)/i);
      if (expMatch) {
        explanation = expMatch[1];
        continue;
      }
      if (!question && !line.match(/^(A|B|C|D|Answer|Explanation)/i)) {
        question = line;
      }
    }

    if (!question) error = "Missing question text";
    else if (!options.A || !options.B || !options.C || !options.D) error = "Missing one or more options";

    return { question, options, correctAnswer, explanation, error };
  });
}

export default function BulkQuestionPaste({ onImport, onCancel }: BulkQuestionPasteProps) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedQuestion[] | null>(null);

  const handleParse = () => {
    if (!text.trim()) return;
    setParsed(parseBulkText(text));
  };

  const valid = parsed?.filter((p) => !p.error) || [];
  const failed = parsed?.filter((p) => p.error) || [];

  const handleImport = () => {
    // TODO: replace with API call
    onImport(
      valid.map((p) => ({
        question: p.question,
        options: p.options,
        correctAnswer: p.correctAnswer,
        explanation: p.explanation,
      }))
    );
  };

  return (
    <div className="space-y-4">
      <Textarea
        label="Paste questions"
        value={text}
        onChange={(e) => { setText(e.target.value); setParsed(null); }}
        className="min-h-[200px] font-mono text-xs"
        helperText="Format: Q: ... / A) ... B) ... C) ... D) ... / Answer: B / Explanation: ..."
        placeholder={`Q: What is 2 + 2?\nA) 3\nB) 4\nC) 5\nD) 6\nAnswer: B\nExplanation: 2 + 2 equals 4.\n\nQ: Capital of Nigeria?\nA) Lagos\nB) Kano\nC) Abuja\nD) Ibadan\nAnswer: C\nExplanation: Abuja became capital in 1991.`}
      />

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="button" onClick={handleParse} disabled={!text.trim()}>
          Parse and preview
        </Button>
      </div>

      {parsed && (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="success">{valid.length} valid</Badge>
            {failed.length > 0 && <Badge variant="error">{failed.length} failed</Badge>}
          </div>

          {parsed.map((p, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-sm ${p.error ? "border-error/30 bg-red-50" : "border-border bg-primary-light/40"}`}
            >
              {p.error ? (
                <p className="text-error font-medium">Q{i + 1}: {p.error}</p>
              ) : (
                <>
                  <p className="font-medium text-text-primary">{i + 1}. {p.question}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    A) {p.options.A} · B) {p.options.B} · C) {p.options.C} · D) {p.options.D}
                  </p>
                  <p className="text-xs text-success mt-0.5">Answer: {p.correctAnswer}</p>
                </>
              )}
            </div>
          ))}

          {valid.length > 0 && (
            <Button onClick={handleImport} fullWidth>
              Import {valid.length} question{valid.length > 1 ? "s" : ""}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
