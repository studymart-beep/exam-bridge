"use client";

import { useTransition } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import VideoPlayer from "@/components/student/VideoPlayer";
import PDFViewer from "@/components/student/PDFViewer";
import ImageGallery from "@/components/student/ImageGallery";
import { markTopicProgress } from "@/app/actions/progress";
import { useToast } from "@/components/ui/Toast";

type Material = {
  id: string;
  type: "video" | "pdf" | "image";
  title: string;
  source: string | null;
};

export default function MaterialsViewer({
  topicId,
  materials,
}: {
  topicId: string;
  materials: Material[];
}) {
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const images = materials.filter((m) => m.type === "image");
  const others = materials.filter((m) => m.type !== "image");

  return (
    <div className="space-y-4 p-2">
      {others.map((m) => (
        <Card key={m.id} padding="sm">
          {m.type === "video" && (
            <VideoPlayer title={m.title} source={m.source} />
          )}
          {m.type === "pdf" && <PDFViewer title={m.title} source={m.source} />}
        </Card>
      ))}
      {images.length > 0 && (
        <Card padding="sm">
          <p className="text-sm font-medium mb-3">Images</p>
          <ImageGallery
            images={images.map((i) => ({
              id: i.id,
              title: i.title,
              source: i.source,
            }))}
          />
        </Card>
      )}
      <Button
        size="sm"
        variant="outline"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await markTopicProgress(topicId, 100, true);
            if (!res.success) showToast(res.error || "Failed", "error");
            else showToast("Marked as complete", "success");
          })
        }
      >
        Mark topic complete
      </Button>
    </div>
  );
}
