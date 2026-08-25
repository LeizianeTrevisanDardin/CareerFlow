"use client";

import { useState } from "react";

import {
  Check,
  Copy,
  Download,
  FileText,
} from "lucide-react";

import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import { jsPDF } from "jspdf";

import {
  parseGeneratedResume,
} from "@/lib/resume-template";

type GeneratedDocumentActionsProps = {
  content: string;
  fileName: string;
  documentType:
    | "resume"
    | "cover_letter";
};

export default function GeneratedDocumentActions({
  content,
  fileName,
  documentType,
}: GeneratedDocumentActionsProps) {
  const [copied, setCopied] =
    useState(false);

  const [downloading, setDownloading] =
    useState<"pdf" | "docx" | null>(
      null
    );

  // ======================================================
  // HELPERS
  // ======================================================

  function sanitizeFileName(
    value: string
  ) {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9-_]+/g,
        "-"
      )
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function downloadBlob(
    blob: Blob,
    downloadName: string
  ) {
    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = downloadName;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  }

  function isBullet(
    line: string
  ) {
    const value =
      line.trim();

    return (
      value.startsWith("-") ||
      value.startsWith("•") ||
      value.startsWith("*")
    );
  }

  function cleanBullet(
    line: string
  ) {
    return line
      .replace(
        /^[-•*]\s*/,
        ""
      )
      .trim();
  }

  function parseCoverLetter(
    value: string
  ) {
    return value
      .split(/\n\s*\n/)
      .map((paragraph) =>
        paragraph.trim()
      )
      .filter(Boolean);
  }

  // ======================================================
  // COPY
  // ======================================================

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        content
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Error copying document:",
        error
      );
    }
  }

  // ======================================================
  // DOCX - RESUME
  // ======================================================

  async function createResumeDocx() {
    const resume =
      parseGeneratedResume(content);

    const children:
      Paragraph[] = [];

    // NAME
    if (resume.name) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.name,
              bold: true,
              size: 34,
            }),
          ],

          spacing: {
            after: 120,
          },
        })
      );
    }

    // CONTACT INFO
    resume.contactLines.forEach(
      (line) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 20,
              }),
            ],

            spacing: {
              after: 40,
            },
          })
        );
      }
    );

    if (
      resume.contactLines.length >
      0
    ) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "",
            }),
          ],

          spacing: {
            after: 80,
          },
        })
      );
    }

    // SECTIONS
    resume.sections.forEach(
      (section) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text:
                  section.title,
                bold: true,
                size: 22,
              }),
            ],

            spacing: {
              before: 220,
              after: 100,
            },

            border: {
              bottom: {
                style:
                  BorderStyle.SINGLE,
                size: 4,
                color:
                  "D1D5DB",
              },
            },
          })
        );

        section.lines.forEach(
          (line) => {
            if (
              isBullet(line)
            ) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        cleanBullet(
                          line
                        ),
                      size: 20,
                    }),
                  ],

                  bullet: {
                    level: 0,
                  },

                  spacing: {
                    after: 70,
                  },
                })
              );

              return;
            }

            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 20,
                  }),
                ],

                spacing: {
                  after: 90,
                },
              })
            );
          }
        );
      }
    );

    return new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720,
              },
            },
          },

          children,
        },
      ],
    });
  }

  // ======================================================
  // DOCX - COVER LETTER
  // ======================================================

  async function createCoverLetterDocx() {
    const paragraphs =
      parseCoverLetter(
        content
      );

    const children:
      Paragraph[] = [];

    paragraphs.forEach(
      (paragraph, index) => {
        const lines =
          paragraph
            .split("\n")
            .map((line) =>
              line.trim()
            )
            .filter(Boolean);

        lines.forEach(
          (line) => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 22,
                  }),
                ],

                spacing: {
                  after: 60,
                },
              })
            );
          }
        );

        if (
          index <
          paragraphs.length - 1
        ) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "",
                }),
              ],

              spacing: {
                after: 140,
              },
            })
          );
        }
      }
    );

    return new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 900,
                right: 900,
                bottom: 900,
                left: 900,
              },
            },
          },

          children,
        },
      ],
    });
  }

  // ======================================================
  // DOWNLOAD DOCX
  // ======================================================

  async function handleDownloadDocx() {
    try {
      setDownloading(
        "docx"
      );

      const documentFile =
        documentType ===
        "resume"
          ? await createResumeDocx()
          : await createCoverLetterDocx();

      const blob =
        await Packer.toBlob(
          documentFile
        );

      const safeName =
        sanitizeFileName(
          fileName
        ) ||
        "careerflow-document";

      downloadBlob(
        blob,
        `${safeName}.docx`
      );
    } catch (error) {
      console.error(
        "Error generating DOCX:",
        error
      );
    } finally {
      setDownloading(null);
    }
  }

  // ======================================================
  // PDF - RESUME
  // ======================================================

  function createResumePdf() {
    const resume =
      parseGeneratedResume(
        content
      );

    const pdf =
      new jsPDF({
        orientation:
          "portrait",

        unit: "pt",

        format: "letter",
      });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const leftMargin = 48;
    const rightMargin = 48;
    const topMargin = 48;
    const bottomMargin = 48;

    const usableWidth =
      pageWidth -
      leftMargin -
      rightMargin;

    let currentY =
      topMargin;

    function addPageIfNeeded(
      requiredHeight: number
    ) {
      if (
        currentY +
          requiredHeight >
        pageHeight -
          bottomMargin
      ) {
        pdf.addPage();

        currentY =
          topMargin;
      }
    }

    // NAME
    if (resume.name) {
      addPageIfNeeded(30);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(19);

      pdf.text(
        resume.name,
        leftMargin,
        currentY
      );

      currentY += 25;
    }

    // CONTACT
    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(9.5);

    resume.contactLines.forEach(
      (line) => {
        const wrapped =
          pdf.splitTextToSize(
            line,
            usableWidth
          );

        const height =
          wrapped.length * 12;

        addPageIfNeeded(
          height
        );

        pdf.text(
          wrapped,
          leftMargin,
          currentY
        );

        currentY += height;
      }
    );

    currentY += 8;

    // SECTIONS
    resume.sections.forEach(
      (section) => {
        addPageIfNeeded(35);

        currentY += 8;

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(10.5);

        pdf.text(
          section.title,
          leftMargin,
          currentY
        );

        currentY += 6;

        pdf.setDrawColor(
          210,
          214,
          220
        );

        pdf.setLineWidth(0.6);

        pdf.line(
          leftMargin,
          currentY,
          pageWidth -
            rightMargin,
          currentY
        );

        currentY += 15;

        section.lines.forEach(
          (line) => {
            const bullet =
              isBullet(line);

            const cleanText =
              bullet
                ? cleanBullet(
                    line
                  )
                : line;

            pdf.setFont(
              "helvetica",
              "normal"
            );

            pdf.setFontSize(
              9.5
            );

            const text =
              bullet
                ? `• ${cleanText}`
                : cleanText;

            const textWidth =
              bullet
                ? usableWidth -
                  14
                : usableWidth;

            const wrapped =
              pdf.splitTextToSize(
                text,
                textWidth
              );

            const lineHeight =
              13.5;

            const height =
              wrapped.length *
              lineHeight;

            addPageIfNeeded(
              height + 4
            );

            pdf.text(
              wrapped,
              bullet
                ? leftMargin +
                  10
                : leftMargin,
              currentY
            );

            currentY +=
              height + 4;
          }
        );

        currentY += 3;
      }
    );

    return pdf;
  }

  // ======================================================
  // PDF - COVER LETTER
  // ======================================================

  function createCoverLetterPdf() {
    const paragraphs =
      parseCoverLetter(
        content
      );

    const pdf =
      new jsPDF({
        orientation:
          "portrait",

        unit: "pt",

        format: "letter",
      });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const leftMargin = 65;
    const rightMargin = 65;
    const topMargin = 65;
    const bottomMargin = 65;

    const usableWidth =
      pageWidth -
      leftMargin -
      rightMargin;

    let currentY =
      topMargin;

    function addPageIfNeeded(
      requiredHeight: number
    ) {
      if (
        currentY +
          requiredHeight >
        pageHeight -
          bottomMargin
      ) {
        pdf.addPage();

        currentY =
          topMargin;
      }
    }

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(11);

    paragraphs.forEach(
      (paragraph) => {
        const lines =
          paragraph
            .split("\n")
            .map((line) =>
              line.trim()
            )
            .filter(Boolean);

        lines.forEach(
          (line) => {
            const wrapped =
              pdf.splitTextToSize(
                line,
                usableWidth
              );

            const lineHeight =
              16;

            const height =
              wrapped.length *
              lineHeight;

            addPageIfNeeded(
              height + 4
            );

            pdf.text(
              wrapped,
              leftMargin,
              currentY
            );

            currentY +=
              height;
          }
        );

        currentY += 13;
      }
    );

    return pdf;
  }

  // ======================================================
  // DOWNLOAD PDF
  // ======================================================

  async function handleDownloadPdf() {
    try {
      setDownloading(
        "pdf"
      );

      const pdf =
        documentType ===
        "resume"
          ? createResumePdf()
          : createCoverLetterPdf();

      const safeName =
        sanitizeFileName(
          fileName
        ) ||
        "careerflow-document";

      pdf.save(
        `${safeName}.pdf`
      );
    } catch (error) {
      console.error(
        "Error generating PDF:",
        error
      );
    } finally {
      setDownloading(null);
    }
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="flex flex-wrap items-center gap-2">

      {/* COPY */}

      <button
        type="button"
        onClick={
          handleCopy
        }
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4"
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

      {/* DOCX */}

      <button
        type="button"
        onClick={
          handleDownloadDocx
        }
        disabled={
          downloading !== null
        }
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
      >
        <FileText className="h-4 w-4" />

        {downloading ===
        "docx"
          ? "Preparing..."
          : "DOCX"}
      </button>

      {/* PDF */}

      <button
        type="button"
        onClick={
          handleDownloadPdf
        }
        disabled={
          downloading !== null
        }
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
      >
        <Download className="h-4 w-4" />

        {downloading ===
        "pdf"
          ? "Preparing..."
          : "PDF"}
      </button>

    </div>
  );
}