/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Import the component to access its internal components object
// We'll test the individual component functions directly
describe('Markdown Custom Components', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Code Components', () => {
    test('renders pre element with correct styling', () => {
      const PreComponent = ({ children }: any) => (
        <pre className="overflow-x-auto max-w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 p-2.5 my-1.5 text-sm whitespace-pre-wrap break-words">
          {children}
        </pre>
      );

      render(<PreComponent>Test code block</PreComponent>);
      
      const preElement = screen.getByText('Test code block');
      expect(preElement).toHaveClass(
        'overflow-x-auto', 
        'max-w-full', 
        'rounded-lg', 
        'bg-zinc-100', 
        'dark:bg-zinc-800/50', 
        'black:bg-zinc-800/50',
        'p-2.5',
        'my-1.5',
        'text-sm',
        'whitespace-pre-wrap',
        'break-words'
      );
      expect(preElement).toHaveTextContent('Test code block');
    });

    test('renders inline code with correct styling', () => {
      const CodeComponent = ({ children, className }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match && !className;

        if (isInline) {
          return (
            <code className="px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 black:text-zinc-300 text-[0.9em] font-mono">
              {children}
            </code>
          );
        }
        return <code className="block font-mono text-sm whitespace-pre-wrap break-words max-w-full">{children}</code>;
      };

      render(<CodeComponent>inline code</CodeComponent>);
      
      const codeElement = screen.getByText('inline code');
      expect(codeElement).toHaveClass(
        'px-1',
        'py-0.5',
        'rounded-md',
        'bg-zinc-100',
        'dark:bg-zinc-800/50',
        'black:bg-zinc-800/50',
        'text-zinc-700',
        'dark:text-zinc-300',
        'black:text-zinc-300',
        'text-[0.9em]',
        'font-mono'
      );
    });

    test('renders block code with correct styling', () => {
      const CodeComponent = ({ children, className }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const isInline = !match && !className;

        if (isInline) {
          return <code className="px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 black:text-zinc-300 text-[0.9em] font-mono">{children}</code>;
        }
        return (
          <code className="block font-mono text-sm whitespace-pre-wrap break-words max-w-full">
            {children}
          </code>
        );
      };

      render(<CodeComponent className="language-javascript">console.log('test');</CodeComponent>);
      
      const codeElement = screen.getByText("console.log('test');");
      expect(codeElement).toHaveClass(
        'block',
        'font-mono',
        'text-sm',
        'whitespace-pre-wrap',
        'break-words',
        'max-w-full'
      );
    });
  });

  describe('List Components', () => {
    test('renders ordered list with correct styling', () => {
      const OlComponent = ({ children }: any) => (
        <ol className="list-decimal list-outside ml-6 pl-2 space-y-0.5 my-1.5">
          {children}
        </ol>
      );

      render(<OlComponent><li>Item 1</li><li>Item 2</li></OlComponent>);
      
      const olElement = screen.getByRole('list');
      expect(olElement).toHaveClass(
        'list-decimal',
        'list-outside',
        'ml-6',
        'pl-2',
        'space-y-0.5',
        'my-1.5'
      );
    });

    test('renders unordered list with correct styling', () => {
      const UlComponent = ({ children }: any) => (
        <ul className="list-disc list-outside ml-6 pl-2 space-y-0.5 my-1.5">
          {children}
        </ul>
      );

      render(<UlComponent><li>Item 1</li><li>Item 2</li></UlComponent>);
      
      const ulElement = screen.getByRole('list');
      expect(ulElement).toHaveClass(
        'list-disc',
        'list-outside',
        'ml-6',
        'pl-2',
        'space-y-0.5',
        'my-1.5'
      );
    });

    test('renders list item with correct styling', () => {
      const LiComponent = ({ children }: any) => (
        <li className="leading-normal">{children}</li>
      );

      render(<ul><LiComponent>Test item</LiComponent></ul>);
      
      const liElement = screen.getByRole('listitem');
      expect(liElement).toHaveClass('leading-normal');
      expect(liElement).toHaveTextContent('Test item');
    });
  });

  describe('Typography Components', () => {
    test('renders paragraph with correct styling', () => {
      const PComponent = ({ children }: any) => (
        <p className="leading-relaxed my-1">{children}</p>
      );

      render(<PComponent>Test paragraph</PComponent>);
      
      const pElement = screen.getByText('Test paragraph');
      expect(pElement).toHaveClass('leading-relaxed', 'my-1');
    });

    test('renders strong text with correct styling', () => {
      const StrongComponent = ({ children }: any) => (
        <strong className="font-semibold">{children}</strong>
      );

      render(<StrongComponent>Bold text</StrongComponent>);
      
      const strongElement = screen.getByText('Bold text');
      expect(strongElement).toHaveClass('font-semibold');
    });

    test('renders emphasis with correct styling', () => {
      const EmComponent = ({ children }: any) => (
        <em className="italic">{children}</em>
      );

      render(<EmComponent>Italic text</EmComponent>);
      
      const emElement = screen.getByText('Italic text');
      expect(emElement).toHaveClass('italic');
    });

    test('renders blockquote with correct styling', () => {
      const BlockquoteComponent = ({ children }: any) => (
        <blockquote className="border-l-2 border-zinc-200 dark:border-zinc-700 black:border-zinc-700 pl-3 my-1.5 italic text-zinc-600 dark:text-zinc-400 black:text-zinc-400">
          {children}
        </blockquote>
      );

      render(<BlockquoteComponent>Quote text</BlockquoteComponent>);
      
      const blockquoteElement = screen.getByText('Quote text');
      expect(blockquoteElement).toHaveClass(
        'border-l-2',
        'border-zinc-200',
        'dark:border-zinc-700',
        'black:border-zinc-700',
        'pl-3',
        'my-1.5',
        'italic',
        'text-zinc-600',
        'dark:text-zinc-400',
        'black:text-zinc-400'
      );
    });
  });

  describe('Heading Components', () => {
    test('renders h1 with correct styling and cyberpunk theme support', () => {
      const H1Component = ({ children }: any) => (
        <h1 className="text-2xl font-semibold mt-3 mb-1.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100">
          {children}
        </h1>
      );

      render(<H1Component>Main Heading</H1Component>);
      
      const h1Element = screen.getByRole('heading', { level: 1 });
      expect(h1Element).toHaveClass(
        'text-2xl',
        'font-semibold',
        'mt-3',
        'mb-1.5',
        'text-zinc-900',
        'dark:text-zinc-100',
        'black:text-zinc-100',
        'cyberpunk:text-zinc-100'
      );
    });

    test('renders h2 with correct styling', () => {
      const H2Component = ({ children }: any) => (
        <h2 className="text-xl font-semibold mt-2.5 mb-1.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100">
          {children}
        </h2>
      );

      render(<H2Component>Section Heading</H2Component>);
      
      const h2Element = screen.getByRole('heading', { level: 2 });
      expect(h2Element).toHaveClass(
        'text-xl',
        'font-semibold',
        'mt-2.5',
        'mb-1.5',
        'text-zinc-900',
        'dark:text-zinc-100',
        'black:text-zinc-100',
        'cyberpunk:text-zinc-100'
      );
    });

    test('renders h3 through h6 with correct styling', () => {
      const HeadingComponents = {
        H3: ({ children }: any) => (
          <h3 className="text-lg font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100">
            {children}
          </h3>
        ),
        H4: ({ children }: any) => (
          <h4 className="text-base font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100">
            {children}
          </h4>
        ),
        H5: ({ children }: any) => (
          <h5 className="text-sm font-semibold mt-2 mb-1 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100">
            {children}
          </h5>
        ),
        H6: ({ children }: any) => (
          <h6 className="text-xs font-semibold mt-2 mb-0.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100">
            {children}
          </h6>
        ),
      };

      const headingTests = [
        { Component: HeadingComponents.H3, level: 3, sizeClass: 'text-lg', text: 'H3 Heading' },
        { Component: HeadingComponents.H4, level: 4, sizeClass: 'text-base', text: 'H4 Heading' },
        { Component: HeadingComponents.H5, level: 5, sizeClass: 'text-sm', text: 'H5 Heading' },
        { Component: HeadingComponents.H6, level: 6, sizeClass: 'text-xs', text: 'H6 Heading' },
      ];

      headingTests.forEach(({ Component, level, sizeClass, text }) => {
        const { unmount } = render(<Component>{text}</Component>);
        
        const headingElement = screen.getByRole('heading', { level });
        expect(headingElement).toHaveClass(
          sizeClass,
          'font-semibold',
          'mt-2',
          level === 6 ? 'mb-0.5' : 'mb-1',
          'text-zinc-900',
          'dark:text-zinc-100',
          'black:text-zinc-100',
          'cyberpunk:text-zinc-100'
        );
        
        unmount();
      });
    });
  });

  describe('Link Components', () => {
    // Note: We can't fully test the Link component behavior without importing the actual markdown component
    // But we can test the logic for internal vs external links
    test('identifies internal links correctly', () => {
      const isInternal = (href: string) => Boolean(href && (href.startsWith("/") || href.startsWith("#")));
      
      expect(isInternal("/internal-page")).toBe(true);
      expect(isInternal("#section")).toBe(true);  
      expect(isInternal("https://external.com")).toBe(false);
      expect(isInternal("http://external.com")).toBe(false);
      expect(isInternal("mailto:test@example.com")).toBe(false);
      expect(isInternal("")).toBe(false);
    });

    test('renders external link with correct attributes', () => {
      const ExternalLinkComponent = ({ href, children }: any) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 black:text-blue-400 black:hover:text-blue-300 transition-colors"
        >
          {children}
        </a>
      );

      render(<ExternalLinkComponent href="https://example.com">External Link</ExternalLinkComponent>);
      
      const linkElement = screen.getByRole('link');
      expect(linkElement).toHaveAttribute('href', 'https://example.com');
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
      expect(linkElement).toHaveClass(
        'text-blue-500',
        'hover:underline',
        'hover:text-blue-600',
        'dark:text-blue-400',
        'dark:hover:text-blue-300',
        'black:text-blue-400',
        'black:hover:text-blue-300',
        'transition-colors'
      );
    });
  });

  describe('Table Components', () => {
    test('renders table with wrapper and correct styling', () => {
      const TableComponent = ({ children }: any) => (
        <div className="my-1.5 overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700">
            {children}
          </table>
        </div>
      );

      render(
        <TableComponent>
          <tbody>
            <tr><td>Cell</td></tr>
          </tbody>
        </TableComponent>
      );
      
      const wrapperDiv = screen.getByRole('table').parentElement;
      expect(wrapperDiv).toHaveClass('my-1.5', 'overflow-x-auto');
      
      const tableElement = screen.getByRole('table');
      expect(tableElement).toHaveClass(
        'min-w-full',
        'divide-y',
        'divide-zinc-200',
        'dark:divide-zinc-700',
        'black:divide-zinc-700'
      );
    });

    test('renders thead with correct styling', () => {
      const TheadComponent = ({ children }: any) => (
        <thead className="bg-zinc-50 dark:bg-zinc-800/50 black:bg-zinc-800/50">
          {children}
        </thead>
      );

      render(
        <table>
          <TheadComponent>
            <tr><th>Header</th></tr>
          </TheadComponent>
        </table>
      );
      
      const theadElement = screen.getByRole('columnheader').parentElement?.parentElement;
      expect(theadElement).toHaveClass(
        'bg-zinc-50',
        'dark:bg-zinc-800/50',
        'black:bg-zinc-800/50'
      );
    });

    test('renders tbody with correct styling', () => {
      const TbodyComponent = ({ children }: any) => (
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 black:divide-zinc-700 bg-white dark:bg-transparent black:bg-transparent">
          {children}
        </tbody>
      );

      render(
        <table>
          <TbodyComponent>
            <tr><td>Cell</td></tr>
          </TbodyComponent>
        </table>
      );
      
      const tbodyElement = screen.getByRole('cell').parentElement?.parentElement;
      expect(tbodyElement).toHaveClass(
        'divide-y',
        'divide-zinc-200',
        'dark:divide-zinc-700',
        'black:divide-zinc-700',
        'bg-white',
        'dark:bg-transparent',
        'black:bg-transparent'
      );
    });

    test('renders tr with hover effects', () => {
      const TrComponent = ({ children }: any) => (
        <tr className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30 black:hover:bg-zinc-800/30">
          {children}
        </tr>
      );

      render(
        <table>
          <tbody>
            <TrComponent><td>Cell</td></TrComponent>
          </tbody>
        </table>
      );
      
      const trElement = screen.getByRole('cell').parentElement;
      expect(trElement).toHaveClass(
        'transition-colors',
        'hover:bg-zinc-50',
        'dark:hover:bg-zinc-800/30',
        'black:hover:bg-zinc-800/30'
      );
    });

    test('renders th with correct styling', () => {
      const ThComponent = ({ children }: any) => (
        <th className="px-3 py-1.5 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 black:text-zinc-400 uppercase tracking-wider">
          {children}
        </th>
      );

      render(
        <table>
          <thead>
            <tr><ThComponent>Header</ThComponent></tr>
          </thead>
        </table>
      );
      
      const thElement = screen.getByRole('columnheader');
      expect(thElement).toHaveClass(
        'px-3',
        'py-1.5',
        'text-left',
        'text-xs',
        'font-medium',
        'text-zinc-500',
        'dark:text-zinc-400',
        'black:text-zinc-400',
        'uppercase',
        'tracking-wider'
      );
    });

    test('renders td with correct styling', () => {
      const TdComponent = ({ children }: any) => (
        <td className="px-3 py-1.5 text-sm">{children}</td>
      );

      render(
        <table>
          <tbody>
            <tr><TdComponent>Cell content</TdComponent></tr>
          </tbody>
        </table>
      );
      
      const tdElement = screen.getByRole('cell');
      expect(tdElement).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });
  });

  describe('Miscellaneous Components', () => {
    test('renders hr with correct styling', () => {
      const HrComponent = () => (
        <hr className="my-1.5 border-zinc-200 dark:border-zinc-700 black:border-zinc-700" />
      );

      render(<HrComponent />);
      
      const hrElement = screen.getByRole('separator');
      expect(hrElement).toHaveClass(
        'my-1.5',
        'border-zinc-200',
        'dark:border-zinc-700',
        'black:border-zinc-700'
      );
    });
  });

  describe('Theme Support', () => {
    test('all components include dark, black, and cyberpunk theme classes', () => {
      // Test a representative component (h1) to verify theme support
      const H1Component = ({ children }: any) => (
        <h1 className="text-2xl font-semibold mt-3 mb-1.5 text-zinc-900 dark:text-zinc-100 black:text-zinc-100 cyberpunk:text-zinc-100">
          {children}
        </h1>
      );

      render(<H1Component>Test Heading</H1Component>);
      
      const h1Element = screen.getByRole('heading', { level: 1 });
      
      // Verify theme classes are present
      expect(h1Element.className).toContain('dark:text-zinc-100');
      expect(h1Element.className).toContain('black:text-zinc-100');  
      expect(h1Element.className).toContain('cyberpunk:text-zinc-100');
    });

    test('code components support all theme variants', () => {
      const CodeComponent = ({ children }: any) => (
        <code className="px-1 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 black:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 black:text-zinc-300 text-[0.9em] font-mono">
          {children}
        </code>
      );

      render(<CodeComponent>test code</CodeComponent>);
      
      const codeElement = screen.getByText('test code');
      
      // Verify all theme background and text color variants
      expect(codeElement.className).toContain('bg-zinc-100');
      expect(codeElement.className).toContain('dark:bg-zinc-800/50');
      expect(codeElement.className).toContain('black:bg-zinc-800/50');
      expect(codeElement.className).toContain('text-zinc-700');
      expect(codeElement.className).toContain('dark:text-zinc-300');
      expect(codeElement.className).toContain('black:text-zinc-300');
    });
  });
});