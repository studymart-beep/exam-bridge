"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { startExam } from "@/app/actions/cbt";

export default function StartExamButton({ examId }: { examId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);
    const result = await startExam(examId);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    // TODO: navigate to interactive exam UI with attemptId
    if (result.attemptId) {
      router.push(`/cbt/${examId}?attempt=${result.attemptId}`);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-error">{error}</p>}
      <Button fullWidth size="lg" onClick={handleStart} loading={loading}>
        Start Exam
      </Button>
    </div>
  );
}
