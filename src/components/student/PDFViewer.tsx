"use client";

interface PDFViewerProps {
  title?: string;
}

export default function PDFViewer({ title }: PDFViewerProps) {
  return (
    <div className="w-full min-h-[400px] bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-text-primary font-medium text-sm">
        {title || "PDF Notes"}
      </p>
      <p className="mt-1 text-text-muted text-xs text-center max-w-xs">
        In-app PDF viewer placeholder. Downloadable notes and summaries will render here.
      </p>
      <button
        type="button"
        className="mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary-light rounded-xl hover:bg-blue-100 transition-colors"
      >
        Download PDF
      </button>
    </div>
  );
}
