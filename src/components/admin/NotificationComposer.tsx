"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { sendNotification } from "@/lib/actions/admin/notifications";

export default function NotificationComposer() {
  const { showToast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");

  return (
    <form
      className="space-y-3"
      action={() => {
        const fd = new FormData();
        fd.set("title", title);
        fd.set("body", body);
        fd.set("audience", audience);
        startTransition(async () => {
          const res = await sendNotification(fd);
          if (!res.success) showToast(res.error || "Failed", "error");
          else {
            showToast(`Sent to ${res.count} students`, "success");
            setTitle("");
            setBody("");
            router.refresh();
          }
        });
      }}
    >
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} rows={3} required />
      <label className="block text-sm font-medium">Audience</label>
      <select
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        className="w-full h-11 px-3 rounded-xl border border-gray-200 text-sm"
      >
        <option value="all">All students</option>
        <option value="active">Only active</option>
        <option value="inactive">Only inactive</option>
      </select>
      <Button type="submit" fullWidth loading={pending}>
        Send
      </Button>
    </form>
  );
}
