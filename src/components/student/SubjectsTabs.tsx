"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Tabs from "@/components/ui/Tabs";
import SubjectCard from "@/components/student/SubjectCard";
import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type SubjectRow = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  letter: string;
  color?: string;
  bgColor?: string;
  topicCount?: number;
  thumbnailUrl?: string | null;
};

/**
 * Subjects browser with the personalisation tabs from the reference flow:
 * "My Subjects" (picked at registration) vs "All Subjects".
 */
export default function SubjectsTabs({
  mine,
  all,
  hasPicks,
}: {
  mine: SubjectRow[];
  all: SubjectRow[];
  hasPicks: boolean;
}) {
  const [tab, setTab] = useState(hasPicks ? "mine" : "all");
  const [q, setQ] = useState("");

  const list = tab === "mine" ? mine : all;
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? list.filter((x) => x.name.toLowerCase().includes(s)) : list;
  }, [list, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          segmented
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: "mine", label: "My Subjects", count: mine.length },
            { id: "all", label: "All Subjects", count: all.length },
          ]}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="h-10 w-full sm:w-52 px-3.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
          aria-label="Search subjects"
        />
      </div>

      {tab === "mine" && !hasPicks ? (
        <Card className="text-center py-10" tint="green">
          <p className="font-heading font-bold text-text-primary">
            No subjects selected yet
          </p>
          <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
            Pick the subjects you are studying so your dashboard, CBT and
            progress follow you.
          </p>
          <Link href="/profile" className="inline-block mt-4">
            <Button size="sm">Choose subjects</Button>
          </Link>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-10" tint="green">
          <p className="text-sm text-text-muted">
            {q ? `No subjects match “${q}”.` : "No subjects yet. Check back soon."}
          </p>
        </Card>
      ) : (
        <Section
          title={tab === "mine" ? "My subjects" : "All subjects"}
          subtitle={
            tab === "mine"
              ? "Your selected subjects — studied first."
              : "Everything published on the platform."
          }
          goldBar
          tint="green"
        >
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            )}
          >
            {filtered.map((s, idx) => (
              <SubjectCard
                key={`${tab}-${s.id}`}
                index={idx}
                subject={{
                  id: s.id,
                  name: s.name,
                  slug: s.slug,
                  description: s.description || "",
                  letter: s.letter,
                  color: s.color,
                  bgColor: s.bgColor,
                  topicCount: s.topicCount,
                  thumbnailUrl: s.thumbnailUrl,
                }}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
