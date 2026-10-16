"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { cardTintClass, cn } from "@/lib/utils";

export type GuestSubject = {
  id: string;
  name: string;
  slug: string;
  letter: string;
  topicCount: number;
};

export default function GuestSubjectsList({
  subjects,
}: {
  subjects: GuestSubject[];
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string>("");

  function onPick(name: string) {
    setPicked(name);
    setOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.name)}
            className={cn(
              "group flex flex-col items-start p-4 rounded-2xl border shadow-soft text-left transition-all",
              cardTintClass(i)
            )}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-heading font-bold mb-3 bg-white/70 text-primary">
              {s.letter}
            </div>
            <h3 className="font-heading font-semibold text-text-primary">
              {s.name}
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              {s.topicCount} topic{s.topicCount === 1 ? "" : "s"}
            </p>
          </button>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Register to continue"
      >
        <p className="text-sm text-text-secondary mb-4">
          Create a free account to browse{" "}
          <span className="font-semibold text-text-primary">{picked}</span> and
          unlock study materials.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/register" className="flex-1">
            <Button fullWidth>Register</Button>
          </Link>
          <Link href="/login" className="flex-1">
            <Button fullWidth variant="outline">
              Log in
            </Button>
          </Link>
        </div>
      </Modal>
    </>
  );
}
