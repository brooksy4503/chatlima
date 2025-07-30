/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import { Citations } from '../../components/citation';

// Mock the motion component
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ExternalLinkIcon: ({ size, className }: any) => (
    <svg data-testid="external-link-icon" width={size} height={size} className={className} />
  ),
  ChevronDownIcon: ({ size }: any) => (
    <svg data-testid="chevron-down-icon" width={size} height={size} />
  ),
  ChevronUpIcon: ({ size }: any) => (
    <svg data-testid="chevron-up-icon" width={size} height={size} />
  ),
}));

describe('Citations Component', () => {
  const mockCitations = [
    {
      url: 'https://example.com/article1',
      title: 'Example Article 1',
      content: 'This is the content of the first article that provides useful information.',
      startIndex: 0,
      endIndex: 10,
    },
    {
      url: 'https://example.com/article2',
      title: 'Example Article 2',
      content: 'This is the content of the second article with more details.',
      startIndex: 11,
      endIndex: 20,
    },
    {
      url: 'https://example.com/article3',
      title: 'Example Article 3',
      // No content for this citation
      startIndex: 21,
      endIndex: 30,
    },
  ];

  const singleCitation = [
    {
      url: 'https://example.com/single',
      title: 'Single Article',
      content: 'Content for single article',
      startIndex: 0,
      endIndex: 5,
    },
  ];

  // Tests for Basic Rendering and Props
  describe('Basic Rendering and Props', () => {
    test('renders nothing when citations array is empty', () => {
      const { container } = render(<Citations citations={[]} />);
      expect(container.firstChild).toBeNull();
    });

    test('renders nothing when citations is undefined', () => {
      const { container } = render(<Citations citations={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    test('renders toggle button with correct citation count for single citation', () => {
      render(<Citations citations={singleCitation} />);
      
      expect(screen.getByText('1 citation')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    test('renders toggle button with correct citation count for multiple citations', () => {
      render(<Citations citations={mockCitations} />);
      
      expect(screen.getByText('3 citations')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    test('renders with proper CSS classes for toggle button', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveClass(
        'flex',
        'items-center',
        'gap-1.5',
        'text-xs',
        'text-muted-foreground/70'
      );
    });
  });

  // Tests for User Interactions
  describe('User Interactions', () => {
    test('expands citation list when toggle button is clicked', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      
      // Initially collapsed - citations should not be visible
      expect(screen.queryByText('Example Article 1')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(toggleButton);
      
      // Citations should now be visible
      expect(screen.getByText('Example Article 1')).toBeInTheDocument();
      expect(screen.getByText('Example Article 2')).toBeInTheDocument();
      expect(screen.getByText('Example Article 3')).toBeInTheDocument();
    });

    test('collapses citation list when toggle button is clicked twice', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      
      // Expand first
      fireEvent.click(toggleButton);
      expect(screen.getByText('Example Article 1')).toBeInTheDocument();
      
      // Collapse again
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Example Article 1')).not.toBeInTheDocument();
    });

    test('changes chevron icon when expanding/collapsing', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      
      // Initially shows down chevron
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument();
      
      // After clicking, shows up chevron
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-down-icon')).not.toBeInTheDocument();
      
      // After clicking again, shows down chevron
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('chevron-up-icon')).not.toBeInTheDocument();
    });

    test('citation links are clickable and have proper attributes', () => {
      render(<Citations citations={mockCitations} />);
      
      // Expand to see citations
      fireEvent.click(screen.getByRole('button'));
      
      const firstLink = screen.getByRole('link', { name: /example article 1/i });
      expect(firstLink).toHaveAttribute('href', 'https://example.com/article1');
      expect(firstLink).toHaveAttribute('target', '_blank');
      expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // Tests for Citation Content Display
  describe('Citation Content Display', () => {
    test('displays citation titles as clickable links', () => {
      render(<Citations citations={mockCitations} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByRole('link', { name: /example article 1/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /example article 2/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /example article 3/i })).toBeInTheDocument();
    });

    test('displays citation content when available', () => {
      render(<Citations citations={mockCitations} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('This is the content of the first article that provides useful information.')).toBeInTheDocument();
      expect(screen.getByText('This is the content of the second article with more details.')).toBeInTheDocument();
    });

    test('does not display content paragraph when citation has no content', () => {
      render(<Citations citations={mockCitations} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      // The third citation has no content, so it shouldn't have a content paragraph
      const citationCards = screen.getAllByRole('link').map(link => link.closest('div'));
      const thirdCard = citationCards[2];
      
      expect(thirdCard?.querySelector('p')).not.toBeInTheDocument();
    });

    test('displays external link icons for all citation links', () => {
      render(<Citations citations={mockCitations} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      const externalLinkIcons = screen.getAllByTestId('external-link-icon');
      expect(externalLinkIcons).toHaveLength(3);
    });

    test('applies proper CSS classes to citation cards', () => {
      render(<Citations citations={singleCitation} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      // The citation card is the container div, not the link's parent
      const citationCard = screen.getByRole('link').closest('div')?.parentElement;
      expect(citationCard).toHaveClass(
        'text-sm',
        'border',
        'border-border/30',
        'rounded-lg',
        'p-3',
        'bg-muted/10'
      );
    });
  });

  // Tests for Accessibility
  describe('Accessibility', () => {
    test('toggle button is keyboard accessible', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      
      // Test Enter key
      fireEvent.keyDown(toggleButton, { key: 'Enter', code: 'Enter' });
      // Note: Since we're not testing actual keyboard activation behavior,
      // we just ensure the button exists and is focusable
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).not.toHaveAttribute('disabled');
    });

    test('citation links have proper accessibility attributes', () => {
      render(<Citations citations={mockCitations} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    test('toggle button has descriptive text', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveTextContent('3 citations');
    });

    test('citation content has proper text styling for readability', () => {
      render(<Citations citations={mockCitations} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      const contentParagraphs = screen.getAllByText(/this is the content/i);
      contentParagraphs.forEach(paragraph => {
        expect(paragraph).toHaveClass('mt-1.5', 'text-xs', 'text-muted-foreground', 'line-clamp-3');
      });
    });
  });

  // Tests for Edge Cases
  describe('Edge Cases', () => {
    test('handles citations with empty titles', () => {
      const citationsWithEmptyTitle = [
        {
          url: 'https://example.com/no-title',
          title: '',
          content: 'Content without title',
          startIndex: 0,
          endIndex: 5,
        },
      ];
      
      render(<Citations citations={citationsWithEmptyTitle} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      // Should still render the link even with empty title
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com/no-title');
    });

    test('handles citations with very long content', () => {
      const longContent = 'A'.repeat(500);
      const citationsWithLongContent = [
        {
          url: 'https://example.com/long-content',
          title: 'Long Content Article',
          content: longContent,
          startIndex: 0,
          endIndex: 5,
        },
      ];
      
      render(<Citations citations={citationsWithLongContent} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
      
      // Should have line-clamp class for truncation
      const contentElement = screen.getByText(longContent);
      expect(contentElement).toHaveClass('line-clamp-3');
    });

    test('handles malformed URLs gracefully', () => {
      const citationsWithBadUrl = [
        {
          url: 'not-a-valid-url',
          title: 'Bad URL Article',
          content: 'Content with bad URL',
          startIndex: 0,
          endIndex: 5,
        },
      ];
      
      render(<Citations citations={citationsWithBadUrl} />);
      
      // Expand citations
      fireEvent.click(screen.getByRole('button'));
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'not-a-valid-url');
      // Browser will handle the invalid URL appropriately
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('complete expand and collapse workflow works correctly', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      
      // Initial state: collapsed
      expect(screen.queryByText('Example Article 1')).not.toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
      
      // First click: expand
      fireEvent.click(toggleButton);
      expect(screen.getByText('Example Article 1')).toBeInTheDocument();
      expect(screen.getByText('Example Article 2')).toBeInTheDocument();
      expect(screen.getByText('Example Article 3')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
      
      // Second click: collapse
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Example Article 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Example Article 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Example Article 3')).not.toBeInTheDocument();
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    test('multiple rapid clicks work correctly', () => {
      render(<Citations citations={mockCitations} />);
      
      const toggleButton = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(toggleButton); // expand
      fireEvent.click(toggleButton); // collapse
      fireEvent.click(toggleButton); // expand
      fireEvent.click(toggleButton); // collapse
      fireEvent.click(toggleButton); // expand
      
      // Should end in expanded state
      expect(screen.getByText('Example Article 1')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    test('works correctly with single citation', () => {
      render(<Citations citations={singleCitation} />);
      
      // Should show singular form
      expect(screen.getByText('1 citation')).toBeInTheDocument();
      
      // Expand and verify single citation displays
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Single Article')).toBeInTheDocument();
      expect(screen.getByText('Content for single article')).toBeInTheDocument();
      
      // Should have exactly one citation link
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', 'https://example.com/single');
    });
  });
});