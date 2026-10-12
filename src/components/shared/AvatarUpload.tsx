"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getAvatarUploadUrl, finalizeAvatar } from "@/lib/actions/avatar";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compress failed"))),
      "image/jpeg",
      0.85
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

export default function AvatarUpload({
  name,
  avatarUrl,
  size = 80,
}: {
  name: string;
  avatarUrl: string | null;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  function onPick() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showToast("Use JPEG, PNG or WebP", "error");
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }

  function cancelCrop() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setCroppedAreaPixels(null);
  }

  function confirmCrop() {
    if (!src || !croppedAreaPixels) return;
    startTransition(async () => {
      try {
        const blob = await getCroppedBlob(src, croppedAreaPixels);
        const meta = await getAvatarUploadUrl("image/jpeg");
        if ("error" in meta) {
          showToast(meta.error, "error");
          return;
        }
        const put = await fetch(meta.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: blob,
        });
        if (!put.ok) {
          showToast("Upload failed", "error");
          return;
        }
        const fin = await finalizeAvatar(meta.path);
        if (!fin.success) {
          showToast(fin.error, "error");
          return;
        }
        setPreview(fin.avatarUrl);
        cancelCrop();
        showToast("Photo updated", "success");
      } catch {
        showToast("Crop or upload failed", "error");
      }
    });
  }

  return (
    <>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <button
          type="button"
          onClick={onPick}
          disabled={pending}
          className={cn(
            "w-full h-full rounded-full overflow-hidden border-2 border-secondary bg-primary/20 flex items-center justify-center",
            pending && "opacity-60"
          )}
          aria-label="Upload picture"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-heading font-bold text-white text-xl">
              {initials(name)}
            </span>
          )}
        </button>
        <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary text-primary-dark text-xs font-bold flex items-center justify-center shadow">
          ✎
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFile}
        />
      </div>

      {src && (
        <div className="fixed inset-0 z-[120] bg-black/80 flex flex-col">
          <div className="relative flex-1 min-h-0">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="round"
              showGrid={false}
            />
          </div>
          <div className="bg-surface p-4 space-y-3 safe-area-pb">
            <label className="block text-xs text-text-muted">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full mt-1"
              />
            </label>
            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={cancelCrop}>
                Cancel
              </Button>
              <Button fullWidth loading={pending} onClick={confirmCrop}>
                Crop &amp; Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
