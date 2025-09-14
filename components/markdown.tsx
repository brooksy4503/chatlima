import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";


const components: Partial<Components> = {
  pre: ({ children, ...props }) => {
    // Extract text content from children for copying
    const getTextContent = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(getTextContent).join('');
      if (React.isValidElement(node)) {
        const props = node.props as { children?: React.ReactNode };
        return getTextContent(props.children);
      }
      return '';
    };

    const textContent = getTextContent(children);

    return (
      <div className="relative group/codeblock">
        <pre className="overflow-x-auto max-w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 p-2.5 my-1.5 text-sm whitespace-pre-wrap break-words" {...props}>
          {children}
        </pre>
        <CopyButton 
          text={textContent} 
          className="absolute top-2 right-2 opacity-0 group-hover/codeblock:opacity-100 transition-opacity"
        />
      </div>
    );
  },
  code: ({ children, className, ...props }: React.HTMLProps<HTMLElement> & { className?: string }) => {
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && !className;

    if (isInline) {
      return (
        <code
          className="px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 black:text-zinc-300 text-[0.9em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn("block font-mono text-sm whitespace-pre-wrap break-words max-w-full", className)} {...props}>
        {children}
      </code>
    );
  },
  ol: ({ node, children, ...props }) => (
    <ol className="list-decimal list-outside ml-6 pl-2 space-y-0.5 my-1.5" {...props}>
      {children}
    </ol>
  ),
  ul: ({ node, children, ...props }) => (
    <ul className="list-disc list-outside ml-6 pl-2 space-y-0.5 my-1.5" {...props}>
      {children}
    </ul>
  ),
  li: ({ node, children, ...props }) => (
    <li className="leading-normal" {...props}>
      {children}
    </li>
  ),
  p: ({ node, children, ...props }) => (
    <p className="leading-relaxed my-1" {...props}>
      {children}
    </p>
  ),
  strong: ({ node, children, ...props }) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ node, children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ node, children, ...props }) => (
    <blockquote
      className="border-l-2 border-zinc-200 dark:border-zinc-700 black:border-zinc-700 pl-3 my-1.5 italic text-zinc-600 dark:text-zinc-400 black:text-zinc-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ node, href, children, ...props }) => {
    const isInternal = href && (href.startsWith("/") || href.startsWith("#"));
    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
        className="text-blue-500 hover:underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 black:text-blue-400 black:hover:text-blue-300 transition-colors"
      >
        {children}
      </a>
    );
  },
  h1: ({ node, children, ...props }) => (
    <h1
      className="text-2xl font-semibold mt-3 mb-1.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2
      className="text-xl font-semibold mt-2.5 mb-1.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3
      className="text-lg font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ node, children, ...props }) => (
    <h4
      className="text-base font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
      {...props}
    >
      {children}
    </h4>
  ),
  h5: ({ node, children, ...props }) => (
    <h5
      className="text-sm font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
      {...props}
    >
      {children}
    </h5>
  ),
  h6: ({ node, children, ...props }) => (
    <h6
      className="text-xs font-semibold mt-2 mb-0.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100"
      {...props}
    >
      {children}
    </h6>
  ),
  table: ({ node, children, ...props }) => (
    <div className="my-1.5 overflow-x-auto">
      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, ...props }) => (
    <thead className="bg-zinc-50 dark:bg-zinc-800/50 black:bg-zinc-800/50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ node, children, ...props }) => (
    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700 bg-white dark:bg-transparent black:bg-transparent" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ node, children, ...props }) => (
    <tr className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 black:hover:bg-zinc-800/30" {...props}>
      {children}
    </tr>
  ),
  th: ({ node, children, ...props }) => (
    <th
      className="px-3 py-1.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 black:text-zinc-400 uppercase tracking-wider"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ node, children, ...props }) => (
    <td className="px-3 py-1.5 text-sm" {...props}>
      {children}
    </td>
  ),
  hr: ({ node, ...props }) => (
    <hr className="my-1.5 border-zinc-200 dark:border-zinc-700 black:border-zinc-700" {...props} />
  ),
};

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex];

// Preprocesses markdown to convert \(...\) to $...$ and \[...\] to $$...$$
function preprocessMathDelimiters(markdown: string): string {
  // Handle null, undefined, or non-string input
  if (!markdown || typeof markdown !== 'string') {
    return '';
  }
  
  // Convert block math: \[...\] => $$...$$
  markdown = markdown.replace(/\\\[([\s\S]+?)\\\]/g, (match, p1) => `$$${p1}$$`);
  // Convert inline math: \(...\) => $...$
  markdown = markdown.replace(/\\\(([\s\S]+?)\\\)/g, (match, p1) => `$${p1}$`);
  return markdown;
}



const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  // Process math delimiters
  const processed = preprocessMathDelimiters(children);
  
  return (
    <div className="overflow-x-auto max-w-full">
      <ReactMarkdown 
        remarkPlugins={remarkPlugins} 
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => 
    prevProps.children === nextProps.children,
);