"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type GuestSubject = {
  id: string;
  name: string;
  slug: string;
  letter: string;
  topicCount: number;
};

const gradients = [
  "from-primary-light via-primary-soft/80 to-cream",
  "from-accent-light via-[#FEF3C7] to-cream",
  "from-calm-light via-[#EFF6FF] to-cream",
];
const emblems = [
  "bg-primary text-white",
  "bg-secondary text-text-primary",
  "bg-calm text-white",
];

export default function GuestSubjectsList({
  subjects,
}: {
  subjects: GuestSubject[];
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState("");

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {subjects.map((s, i) => {
          const ti = i % 3;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setPicked(s.name);
                setOpen(true);
              }}
              className={cn(
                "card-gloss group relative flex flex-col min-h-[150px] p-5 rounded-[20px] border border-white/60 text-left",
                "bg-gradient-to-br shadow-[0_8px_24px_-6px_rgba(22,101,52,0.12)]",
                "transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]",
                gradients[ti]
              )}
            >
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-heading font-extrabold",
                    emblems[ti]
                  )}
                >
                  {s.letter}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-border/60">
                  {s.topicCount} Topics
                </span>
              </div>
              <h3 className="relative z-10 mt-4 font-heading font-extrabold text-lg text-text-primary">
                {s.name}
              </h3>
            </button>
          );
        })}
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
