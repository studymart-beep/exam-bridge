"use client";

import { useState } from "react";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../layout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable, { type Column } from "@/components/admin/DataTable";
import ExamForm from "@/components/admin/forms/ExamForm";
import { adminCbtExams as initial } from "@/lib/mock/adminCbtExams";
import { adminSubjects } from "@/lib/mock/adminSubjects";
import type { AdminCbtExam } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function AdminCbtPage() {
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const [exams, setExams] = useState<AdminCbtExam[]>([...initial]);
  const [modal, setModal] = useState(false);

  const handleCreate = (data: {
    title: string;
    subjectId: string;
    durationMinutes: number;
    passMark: number;
  }) => {
    // TODO: replace with API call
    const subj = adminSubjects.find((s) => s.id === data.subjectId);
    setExams((prev) => [
      {
        id: `cbt-${Date.now()}`,
        title: data.title,
        subjectId: data.subjectId,
        subjectName: subj?.name || "",
        questionCount: 0,
        durationMinutes: data.durationMinutes,
        passMark: data.passMark,
        status: "draft",
        attemptsCount: 0,
        avgScore: 0,
        passRate: 0,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    showToast("Exam created", "success");
    setModal(false);
  };

  const columns: Column<AdminCbtExam>[] = [
    {
      key: "title",
      header: "Exam",
      render: (e) => (
        <div>
          <p className="font-medium text-text-primary">{e.title}</p>
          <p className="text-xs text-text-muted sm:hidden">{e.subjectName}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      className: "hidden sm:table-cell",
      render: (e) => e.subjectName,
    },
    {
      key: "qs",
      header: "Q",
      render: (e) => e.questionCount,
    },
    {
      key: "duration",
      header: "Time",
      className: "hidden md:table-cell",
      render: (e) => `${e.durationMinutes}m`,
    },
    {
      key: "pass",
      header: "Pass",
      className: "hidden md:table-cell",
      render: (e) => `${e.passMark}%`,
    },
    {
      key: "status",
      header: "Status",
      render: (e) => (
        <Badge variant={e.status === "published" ? "success" : e.status === "draft" ? "warning" : "default"}>
          {e.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (e) => (
        <Link href={`/admin/cbt/${e.id}`} className="text-sm font-medium text-primary hover:underline">
          Manage
        </Link>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title="CBT Exams"
        subtitle={`${exams.length} exams`}
        onMenuClick={openMenu}
        actions={<Button size="sm" onClick={() => setModal(true)}>Create exam</Button>}
      />
      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto">
        <Card padding="none" className="overflow-hidden">
          <div className="p-2 sm:p-4">
            <DataTable columns={columns} data={exams} keyExtractor={(e) => e.id} emptyMessage="No exams yet" />
          </div>
        </Card>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Create CBT exam">
        <ExamForm onSubmit={handleCreate} onCancel={() => setModal(false)} />
      </Modal>
    </div>
  );
}
