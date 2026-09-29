"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import VideoPlayer from "@/components/student/VideoPlayer";
import PDFViewer from "@/components/student/PDFViewer";
import ImageGallery from "@/components/student/ImageGallery";
import { useToast } from "@/components/ui/Toast";
import type { Topic } from "@/types";

interface TopicDetailClientProps {
  topic: Topic;
  courseId: string;
}

const tabs = ["Video", "PDF", "Images"] as const;

export default function TopicDetailClient({
  topic,
  courseId,
}: TopicDetailClientProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Video");
  const [completed, setCompleted] = useState(topic.completed);
  const { showToast } = useToast();

  const handleMarkComplete = () => {
    setCompleted(true);
    showToast("Topic marked as complete!", "success");
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-150",
              activeTab === tab
                ? "bg-white text-text-primary shadow-soft"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "Video" && (
        <VideoPlayer title={topic.title} />
      )}
      {activeTab === "PDF" && (
        <PDFViewer title={`${topic.title} Notes`} />
      )}
      {activeTab === "Images" && (
        <ImageGallery />
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {topic.hasCbt && topic.cbtId && (
          <Link href={`/cbt/${topic.cbtId}`} className="flex-1">
            <Button fullWidth variant="primary">
              Take CBT
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
        )}
        <Button
          fullWidth
          variant={completed ? "secondary" : "outline"}
          onClick={handleMarkComplete}
          disabled={completed}
          className="flex-1"
        >
          {completed ? (
            <>
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </>
          ) : (
            "Mark as Complete"
          )}
        </Button>
      </div>
    </div>
  );
}
