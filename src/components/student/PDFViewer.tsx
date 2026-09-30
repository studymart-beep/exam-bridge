"use client";

interface PDFViewerProps {
  title?: string;
  source?: string | null;
}

export default function PDFViewer({ title, source }: PDFViewerProps) {
  if (!source) {
    return (
      <div className="w-full min-h-[200px] bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center p-6">
        <p className="text-sm text-text-muted">No PDF source</p>
      </div>
    );
  }

  const isUrl = source.startsWith("http://") || source.startsWith("https://");

  return (
    <div className="space-y-2">
      {title && <p className="text-sm font-medium text-text-primary">{title}</p>}
      {isUrl ? (
        <>
          <div className="w-full min-h-[480px] rounded-2xl border border-gray-200 overflow-hidden bg-white">
            <iframe
              src={source}
              title={title || "PDF"}
              className="w-full h-[480px] border-0"
            />
          </div>
          <a
            href={source}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm font-medium text-primary hover:underline"
          >
            Open / download PDF
          </a>
        </>
      ) : (
        <div className="w-full min-h-[120px] bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-6 gap-2">
          <p className="text-sm text-text-primary font-medium">{title || "PDF"}</p>
          <p className="text-xs text-text-muted break-all text-center">{source}</p>
        </div>
      )}
    </div>
  );
}
