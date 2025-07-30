/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { Markdown } from '../../components/markdown';

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock KaTeX CSS import
jest.mock('katex/dist/katex.min.css', () => ({}));

// Mock react-markdown and plugins
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children, components, remarkPlugins, rehypePlugins }: any) => (
    <div data-testid="react-markdown" data-remark-plugins={remarkPlugins?.length} data-rehype-plugins={rehypePlugins?.length}>
      {/* Simulate how ReactMarkdown would render the content with custom components */}
      <div data-testid="markdown-content">{children}</div>
    </div>
  ),
}));

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: 'remark-gfm-plugin',
}));

jest.mock('remark-math', () => ({
  __esModule: true,
  default: 'remark-math-plugin',
}));

jest.mock('rehype-katex', () => ({
  __esModule: true,
  default: 'rehype-katex-plugin',
}));

describe('Markdown', () => {
  const mockMarkdownContent = `
# Test Heading
This is a **bold** text with *italic* and \`inline code\`.

## Lists
- Item 1
- Item 2

1. Numbered item 1
2. Numbered item 2

> This is a blockquote

[External link](https://example.com)
[Internal link](/internal)

\`\`\`javascript
console.log('code block');
\`\`\`

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
  `.trim();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders markdown content correctly', () => {
      render(<Markdown>{mockMarkdownContent}</Markdown>);
      
      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    test('renders with empty content', () => {
      render(<Markdown>{''}</Markdown>);
      
      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toHaveTextContent('');
    });

    test('applies overflow-x-auto wrapper class', () => {
      const { container } = render(<Markdown>Test content</Markdown>);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('overflow-x-auto', 'max-w-full');
    });
  });

  describe('Plugin Configuration', () => {
    test('configures remark and rehype plugins correctly', () => {
      render(<Markdown>Test content</Markdown>);
      
      const markdownElement = screen.getByTestId('react-markdown');
      expect(markdownElement).toHaveAttribute('data-remark-plugins', '2'); // remarkGfm + remarkMath
      expect(markdownElement).toHaveAttribute('data-rehype-plugins', '1'); // rehypeKatex
    });
  });

  describe('Math Delimiter Preprocessing', () => {
    test('converts inline math delimiters \\(...\\) to $...$', () => {
      const mathContent = 'Inline math: \\(x^2 + y^2 = z^2\\)';
      render(<Markdown>{mathContent}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('Inline math: $x^2 + y^2 = z^2$');
    });

    test('converts block math delimiters \\[...\\] to $$...$$', () => {
      const mathContent = 'Block math: \\[\\frac{a}{b} = c\\]';
      render(<Markdown>{mathContent}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('Block math: $$\\frac{a}{b} = c$$');
    });

    test('handles multiple math expressions', () => {
      const mathContent = 'First: \\(a + b\\) and block: \\[c = d\\] and another inline: \\(e - f\\)';
      render(<Markdown>{mathContent}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('First: $a + b$ and block: $$c = d$$ and another inline: $e - f$');
    });

    test('handles math with whitespace and newlines', () => {
      const mathContent = `Block math with newlines:
\\[
  \\sum_{i=1}^{n} x_i = \\frac{n(n+1)}{2}
\\]`;
      render(<Markdown>{mathContent}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      expect(content.textContent).toContain('$$');
      expect(content.textContent).toContain('\\sum_{i=1}^{n} x_i = \\frac{n(n+1)}{2}');
    });

    test('does not modify regular parentheses and brackets', () => {
      const regularContent = 'Regular (parentheses) and [brackets] should not change.';
      render(<Markdown>{regularContent}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('Regular (parentheses) and [brackets] should not change.');
    });

    test('handles empty values in math preprocessing', () => {
      // Test empty string
      const { unmount } = render(<Markdown>{''}</Markdown>);
      expect(screen.getByTestId('markdown-content')).toHaveTextContent('');
      unmount();
    });

    test('handles whitespace-only content in math preprocessing', () => {
      // Test whitespace-only string (ReactMarkdown may trim this, so just ensure no crash)
      expect(() => {
        render(<Markdown>{'   '}</Markdown>);
      }).not.toThrow();
      
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });
  });

  describe('Memoization', () => {
    test('memoizes component and prevents unnecessary re-renders', () => {
      const { rerender } = render(<Markdown>Test content</Markdown>);
      const firstRender = screen.getByTestId('react-markdown');
      
      // Re-render with same content
      rerender(<Markdown>Test content</Markdown>);
      const secondRender = screen.getByTestId('react-markdown');
      
      // Component should be memoized (same reference)
      expect(firstRender).toBe(secondRender);
    });

    test('re-renders when content changes', () => {
      const { rerender } = render(<Markdown>Original content</Markdown>);
      expect(screen.getByTestId('markdown-content')).toHaveTextContent('Original content');
      
      rerender(<Markdown>Updated content</Markdown>);
      expect(screen.getByTestId('markdown-content')).toHaveTextContent('Updated content');
    });
  });

  describe('Error Handling', () => {
    test('handles malformed markdown gracefully', () => {
      const malformedMarkdown = '# Heading with [broken link](';
      
      expect(() => {
        render(<Markdown>{malformedMarkdown}</Markdown>);
      }).not.toThrow();
      
      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });

    test('handles null or undefined content gracefully', () => {
      // Test with empty string
      expect(() => {
        render(<Markdown>{''}</Markdown>);
      }).not.toThrow();
      
      // Test component handles empty/falsy values
      const { container } = render(<Markdown>{''}</Markdown>);
      expect(container.firstChild).toBeInTheDocument();
      
      // Test with null (after fixing preprocessMathDelimiters)
      expect(() => {
        render(<Markdown>{null as any}</Markdown>);
      }).not.toThrow();
    });

    test('handles very long content', () => {
      const longContent = 'a'.repeat(10000);
      
      expect(() => {
        render(<Markdown>{longContent}</Markdown>);
      }).not.toThrow();
      
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(longContent);
    });
  });

  describe('Accessibility', () => {
    test('maintains semantic HTML structure', () => {
      const { container } = render(<Markdown>Test content</Markdown>);
      
      // Should have proper div wrapper
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper).toHaveClass('overflow-x-auto', 'max-w-full');
    });

    test('allows custom components to maintain accessibility', () => {
      // The component configuration should allow ReactMarkdown to render
      // semantic HTML elements that maintain accessibility
      render(<Markdown># Heading\nParagraph text</Markdown>);
      
      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders efficiently with large content', () => {
      const startTime = performance.now();
      
      const largeContent = Array(100).fill(0).map((_, i) => 
        `## Section ${i}\n\nThis is paragraph ${i} with **bold** and *italic* text.\n\n`
      ).join('');
      
      render(<Markdown>{largeContent}</Markdown>);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render reasonably quickly (less than 100ms for large content)
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles content with only whitespace', () => {
      render(<Markdown>   \n\n   \t   </Markdown>);
      
      expect(screen.getByTestId('react-markdown')).toBeInTheDocument();
    });

    test('handles mixed math and markdown content', () => {
      const mixedContent = `
# Math Examples

Inline math: \\(x = 2\\) in a sentence.

Block math:
\\[
  E = mc^2
\\]

- List item with math: \\(a + b = c\\)
- Another item

| Formula | Result |
|---------|--------|
| \\(2 + 2\\) | 4 |
      `.trim();
      
      render(<Markdown>{mixedContent}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      expect(content.textContent).toContain('$x = 2$');
      expect(content.textContent).toContain('$$\n  E = mc^2\n$$');
      expect(content.textContent).toContain('$a + b = c$');
      expect(content.textContent).toContain('$2 + 2$');
    });

    test('handles special characters and Unicode', () => {
      const unicodeContent = '# Test with émojis 🚀 and spëcial châractërs';
      
      render(<Markdown>{unicodeContent}</Markdown>);
      
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(unicodeContent);
    });

    test('handles nested math expressions', () => {
      const nestedMath = 'Formula: \\(\\frac{\\sqrt{a + b}}{c - d}\\) and block: \\[\\sum_{i=1}^{n} \\frac{x_i}{y_i}\\]';
      
      render(<Markdown>{nestedMath}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      expect(content.textContent).toContain('$\\frac{\\sqrt{a + b}}{c - d}$');
      expect(content.textContent).toContain('$$\\sum_{i=1}^{n} \\frac{x_i}{y_i}$$');
    });
  });

  describe('Integration Tests', () => {
    test('complete markdown workflow with all features', () => {
      const completeMarkdown = `
# Complete Markdown Test

This tests **all** features *together*.

## Math Section
Inline: \\(x^2 + y^2 = z^2\\)

Block:
\\[
  \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

## Lists and Code
- Item with \`inline code\`
- Item with math: \\(a = b + c\\)

1. Numbered item
2. Another numbered item

\`\`\`javascript
function test() {
  return "Hello World";
}
\`\`\`

## Links and Quotes
[External](https://example.com) and [Internal](/test)

> This is a blockquote with \\(inline math\\)

## Table
| Feature | Status |
|---------|--------|
| Math    | \\(\\checkmark\\) |
| Code    | \`working\` |

---

Final paragraph.
      `.trim();
      
      render(<Markdown>{completeMarkdown}</Markdown>);
      
      const content = screen.getByTestId('markdown-content');
      
      // Verify math processing
      expect(content.textContent).toContain('$x^2 + y^2 = z^2$');
      expect(content.textContent).toContain('$$\n  \\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$');
      expect(content.textContent).toContain('$a = b + c$');
      expect(content.textContent).toContain('$inline math$');
      expect(content.textContent).toContain('$\\checkmark$');
      
      // Verify all content sections are present
      expect(content.textContent).toContain('Complete Markdown Test');
      expect(content.textContent).toContain('Math Section');
      expect(content.textContent).toContain('Lists and Code');
      expect(content.textContent).toContain('Links and Quotes');
      expect(content.textContent).toContain('Final paragraph');
    });
  });
});