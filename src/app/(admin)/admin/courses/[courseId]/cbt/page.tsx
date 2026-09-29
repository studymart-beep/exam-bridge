"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminMenu } from "../../../layout";
import CbtAttachPanel from "@/components/admin/CbtAttachPanel";
import { getAdminCourseById } from "@/lib/mock/adminCourses";
import { getCourseCbtExamId } from "@/lib/mock/adminCourseCbt";
import { useToast } from "@/components/ui/Toast";

export default function CourseCbtPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const openMenu = useAdminMenu();
  const { showToast } = useToast();
  const course = getAdminCourseById(courseId);
  const [examId, setExamId] = useState<string | null>(getCourseCbtExamId(courseId));

  if (!course) {
    return (
      <div>
        <AdminHeader title="Not found" onMenuClick={openMenu} />
        <p className="p-6 text-center text-text-muted">
          Course not found.{" "}
          <Link href="/admin/courses" className="text-primary">
            Back
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Course General CBT"
        subtitle={course.title}
        onMenuClick={openMenu}
      />
      <div className="px-4 sm:px-6 py-5 max-w-3xl mx-auto space-y-4">
        <Link href={`/admin/courses/${courseId}`} className="text-sm text-primary hover:underline">
          ← Back to course
        </Link>
        <p className="text-sm text-text-secondary">
          Course General CBT (final exam). Students unlock this after completing all topics in the course.
        </p>
        <CbtAttachPanel
          attachedExamId={examId}
          createHref={`/admin/cbt?courseId=${courseId}`}
          emptyTitle="This course has no general CBT yet."
          emptyDescription="Create a new final exam or attach an existing one."
          onAttach={(id) => {
            // TODO: replace with API call
            setExamId(id);
            showToast("Course CBT attached", "success");
          }}
          onDetach={() => {
            // TODO: replace with API call
            setExamId(null);
            showToast("Course CBT detached", "success");
          }}
        />
      </div>
    </div>
  );
}
