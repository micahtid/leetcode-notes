"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ source }: { source: string }) {
  return (
    <div className="markdown-body text-[14px] leading-relaxed text-ink-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-medium tracking-tight mt-6 mb-3">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-medium tracking-tight mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-medium text-ink-700 mt-5 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1 marker:text-ink-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1 marker:text-ink-400">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="underline underline-offset-2 decoration-ink-400 hover:decoration-ink-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-ink-300 pl-4 text-ink-600 mb-4">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-ink-200" />,
          strong: ({ children }) => (
            <strong className="font-medium text-ink-900">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ className, children, ...props }) => {
            const isBlock = (className ?? "").startsWith("language-");
            if (isBlock) {
              return (
                <code
                  className="block font-mono text-[13px] leading-relaxed text-ink-900"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                className="bg-ink-100 rounded-md px-1.5 py-0.5 font-mono text-[13px] text-ink-900"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-ink-100 border border-ink-200 rounded-xl p-4 overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="text-left font-medium text-ink-700 border-b border-ink-200 py-2 px-3">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-ink-100 py-2 px-3">{children}</td>
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
