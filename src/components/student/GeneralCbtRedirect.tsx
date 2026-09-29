"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GeneralCbtRedirect({ examId }: { examId: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/cbt/${examId}`);
  }, [examId, router]);
  return (
    <div className="p-8 text-center text-sm text-text-muted">
      Opening exam…
    </div>
  );
}
