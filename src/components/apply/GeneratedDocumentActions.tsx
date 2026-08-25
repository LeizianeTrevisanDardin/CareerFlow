"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

type GeneratedDocumentActionsProps = {
  content: string;
  fileName: string;
};

export default function GeneratedDocumentActions({
  content,
  fileName,
}: GeneratedDocumentActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying document:", error);
    }
  }

  function handleDownload() {
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${fileName}.txt`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </div>
  );
}