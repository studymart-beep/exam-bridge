"use client";

import { useState } from "react";
import StudentHeader from "@/components/student/StudentHeader";
import SubjectCard from "@/components/student/SubjectCard";
import { subjects } from "@/lib/mock/subjects";
import { cn } from "@/lib/utils";
import PageLock from "@/components/student/PageLock";

const filters = ["All", "Science", "Arts", "Commercial", "Core"];

const categoryMap: Record<string, string[]> = {
  Science: ["mathematics", "biology", "physics", "chemistry"],
  Arts: ["literature-in-english", "english-language", "government"],
  Commercial: ["accounting"],
  Core: ["mathematics", "english-language"],
};

export default function SubjectsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" ||
      (categoryMap[filter] || []).includes(s.slug);
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <StudentHeader title="Subjects" />
      <PageLock label="Subscribe to unlock all subjects.">
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-heading font-bold text-text-primary">
            Subjects
          </h2>
          <p className="text-sm text-text-secondary">
            Select a subject to start learning
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150",
                filter === f
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary border border-gray-200 hover:bg-gray-50"
              )}
            >
              {f === "All" && (
                <span className="mr-1">▾</span>
              )}
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">No subjects found</p>
          </div>
        )}
      </div>
      </PageLock>
    </div>
  );
}
