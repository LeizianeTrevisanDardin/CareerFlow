import {
  parseGeneratedResume,
} from "@/lib/resume-template";

type ResumePreviewProps = {
  content: string;
};

function isBullet(line: string) {
  const value = line.trim();

  return (
    value.startsWith("-") ||
    value.startsWith("•") ||
    value.startsWith("*")
  );
}

function cleanBullet(line: string) {
  return line
    .replace(/^[-•*]\s*/, "")
    .trim();
}

export default function ResumePreview({
  content,
}: ResumePreviewProps) {
  const resume =
    parseGeneratedResume(content);

  return (
    <div className="mx-auto w-full max-w-[850px] bg-white px-6 py-8 sm:px-10 lg:px-14 lg:py-12">

      {/* ======================================
          NAME
      ====================================== */}

      {resume.name && (
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {resume.name}
        </h1>
      )}

      {/* ======================================
          CONTACT / HEADLINE
      ====================================== */}

      {resume.contactLines.length > 0 && (
        <div className="mt-3 space-y-1">
          {resume.contactLines.map(
            (line, index) => (
              <p
                key={`${line}-${index}`}
                className="break-words text-sm leading-5 text-slate-700"
              >
                {line}
              </p>
            )
          )}
        </div>
      )}

      {/* ======================================
          SECTIONS
      ====================================== */}

      <div className="mt-8 space-y-7">
        {resume.sections.map(
          (section, sectionIndex) => (
            <section
              key={`${section.title}-${sectionIndex}`}
            >
              {/* Section title */}

              <div className="border-b border-slate-300 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-950">
                  {section.title}
                </h2>
              </div>

              {/* Section content */}

              <div className="mt-3 space-y-2">
                {section.lines.map(
                  (line, lineIndex) => {
                    const bullet =
                      isBullet(line);

                    if (bullet) {
                      return (
                        <div
                          key={`${line}-${lineIndex}`}
                          className="flex gap-2 text-sm leading-6 text-slate-700"
                        >
                          <span className="shrink-0">
                            •
                          </span>

                          <p>
                            {cleanBullet(
                              line
                            )}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <p
                        key={`${line}-${lineIndex}`}
                        className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700"
                      >
                        {line}
                      </p>
                    );
                  }
                )}
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}