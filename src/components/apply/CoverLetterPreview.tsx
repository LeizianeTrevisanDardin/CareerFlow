type CoverLetterPreviewProps = {
  content: string;
};

export default function CoverLetterPreview({
  content,
}: CoverLetterPreviewProps) {
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-[850px] bg-white px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
      <div className="space-y-5">
        {paragraphs.map((paragraph, index) => {
          const lines = paragraph
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          return (
            <div
              key={`${index}-${paragraph.slice(0, 20)}`}
              className="space-y-1"
            >
              {lines.map((line, lineIndex) => (
                <p
                  key={`${lineIndex}-${line}`}
                  className="break-words text-sm leading-7 text-slate-700"
                >
                  {line}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}