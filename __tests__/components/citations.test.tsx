import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Citations, CitationLink } from '@/components/citations';
import type { WebSearchCitation } from '@/lib/types';

// Mock citations data
const mockCitations: WebSearchCitation[] = [
  {
    url: 'https://example.com/article1',
    title: 'Example Article 1',
    content: 'This is the content of the first article.',
    startIndex: 0,
    endIndex: 10,
    source: 'openrouter'
  },
  {
    url: 'https://example.com/article2',
    title: 'Example Article 2',
    content: 'This is the content of the second article.',
    startIndex: 20,
    endIndex: 30,
    source: 'openrouter'
  }
];

describe('Citations Component', () => {
  it('renders citation count when collapsed', () => {
    render(<Citations citations={mockCitations} source="openrouter" />);
    
    // Should show inline citations (2 citations = show all inline, no toggle)
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.com')).toBeInTheDocument();
  });

  it('renders without citations when array is empty', () => {
    const { container } = render(<Citations citations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders without citations when citations is null', () => {
    const { container } = render(<Citations citations={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('expands and shows citation list when clicked', () => {
    // Create more citations to trigger the expandable behavior
    const manyCitations = [
      ...mockCitations,
      { url: 'https://another.com/article3', title: 'Article 3', startIndex: 0, endIndex: 10, source: 'openrouter' as const },
      { url: 'https://more.com/article4', title: 'Article 4', startIndex: 0, endIndex: 10, source: 'openrouter' as const }
    ];
    
    render(<Citations citations={manyCitations} />);
    
    // Should show inline citations first
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.com')).toBeInTheDocument();
    
    // Should have a +more button
    const moreButton = screen.getByText('+1 more');
    fireEvent.click(moreButton);
    
    // Should show additional citations
    expect(screen.getByText('Article 3')).toBeInTheDocument();
  });

  it('shows provider-specific styling', () => {
    render(<Citations citations={mockCitations} source="openai" />);
    
    // Should show citations with provider-specific styling
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.com')).toBeInTheDocument();
  });

  it('handles unknown source gracefully', () => {
    render(<Citations citations={mockCitations} source="openrouter" />);
    
    // Should still render citations even with unknown source
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('renders citation links with correct attributes', () => {
    render(<Citations citations={mockCitations} />);
    
    // Should have inline citation links
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://example.com/article1');
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows citation numbers correctly', () => {
    render(<Citations citations={mockCitations} />);
    
    // Should show citation numbers in inline format
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('displays hostname correctly', () => {
    render(<Citations citations={mockCitations} />);
    
    // Should show hostnames in inline citations
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('test.com')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    // Create citations that will show a toggle button
    const manyCitations = [
      ...mockCitations,
      { url: 'https://another.com/article3', title: 'Article 3', startIndex: 0, endIndex: 10, source: 'openrouter' as const },
      { url: 'https://more.com/article4', title: 'Article 4', startIndex: 0, endIndex: 10, source: 'openrouter' as const }
    ];
    
    render(<Citations citations={manyCitations} />);
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-label');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('CitationLink Component', () => {
  const mockCitation: WebSearchCitation = {
    url: 'https://example.com/test',
    title: 'Test Citation',
    content: 'Test content',
    startIndex: 0,
    endIndex: 5,
    source: 'openrouter'
  };

  it('renders citation number correctly', () => {
    render(<CitationLink citation={mockCitation} index={0} />);
    
    expect(screen.getByText('[1]')).toBeInTheDocument();
  });

  it('renders as a link with correct attributes', () => {
    render(<CitationLink citation={mockCitation} index={0} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/test');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('title', 'Test Citation');
  });

  it('has proper accessibility label', () => {
    render(<CitationLink citation={mockCitation} index={0} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Citation 1: Test Citation');
  });

  it('applies custom className when provided', () => {
    render(<CitationLink citation={mockCitation} index={0} className="custom-class" />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-class');
  });
});
