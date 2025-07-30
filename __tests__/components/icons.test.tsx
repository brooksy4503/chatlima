/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { VercelIcon, SpinnerIcon, Github, StarButton, XAiIcon } from '../../components/icons';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, target, rel, className, children }: any) => (
    <a 
      href={href} 
      target={target} 
      rel={rel}
      className={className}
      data-testid="next-link"
    >
      {children}
    </a>
  );
});

describe('Icons Component', () => {
  // Tests for VercelIcon
  describe('VercelIcon', () => {
    describe('Basic Rendering and Props', () => {
      test('renders SVG with default size', () => {
        render(<VercelIcon />);
        
        const svg = screen.getByTitle('Vercel Icon').closest('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('height', '17');
        expect(svg).toHaveAttribute('width', '17');
      });

      test('renders SVG with custom size', () => {
        render(<VercelIcon size={24} />);
        
        const svg = screen.getByTitle('Vercel Icon').closest('svg');
        expect(svg).toHaveAttribute('height', '24');
        expect(svg).toHaveAttribute('width', '24');
      });

      test('has proper SVG attributes', () => {
        render(<VercelIcon />);
        
        const svg = screen.getByTitle('Vercel Icon').closest('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
        expect(svg).toHaveAttribute('stroke-linejoin', 'round');
        // Color style is set via inline style attribute
        expect(svg).toHaveAttribute('style', expect.stringContaining('color: currentcolor'));
      });

      test('contains triangle path element', () => {
        render(<VercelIcon />);
        
        const svg = screen.getByTitle('Vercel Icon').closest('svg');
        const path = svg?.querySelector('path');
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('d', 'M8 1L16 15H0L8 1Z');
        expect(path).toHaveAttribute('fill', 'currentColor');
        expect(path).toHaveAttribute('fill-rule', 'evenodd');
        expect(path).toHaveAttribute('clip-rule', 'evenodd');
      });
    });

    describe('Accessibility', () => {
      test('has accessible title', () => {
        render(<VercelIcon />);
        
        const title = screen.getByText('Vercel Icon');
        expect(title).toBeInTheDocument();
      });

      test('SVG can be found by title', () => {
        render(<VercelIcon />);
        
        const title = screen.getByTitle('Vercel Icon');
        expect(title).toBeInTheDocument();
        const svg = title.closest('svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  // Tests for SpinnerIcon
  describe('SpinnerIcon', () => {
    describe('Basic Rendering and Props', () => {
      test('renders SVG with default size', () => {
        render(<SpinnerIcon />);
        
        const svg = screen.getByTitle('Spinner Icon').closest('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('height', '16');
        expect(svg).toHaveAttribute('width', '16');
      });

      test('renders SVG with custom size', () => {
        render(<SpinnerIcon size={32} />);
        
        const svg = screen.getByTitle('Spinner Icon').closest('svg');
        expect(svg).toHaveAttribute('height', '32');
        expect(svg).toHaveAttribute('width', '32');
      });

      test('has proper SVG attributes', () => {
        render(<SpinnerIcon />);
        
        const svg = screen.getByTitle('Spinner Icon').closest('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
        expect(svg).toHaveAttribute('stroke-linejoin', 'round');
        // Color style is set via inline style attribute
        expect(svg).toHaveAttribute('style', expect.stringContaining('color: currentcolor'));
      });

      test('contains spinner path elements with varying opacity', () => {
        render(<SpinnerIcon />);
        
        const svg = screen.getByTitle('Spinner Icon').closest('svg');
        const paths = svg?.querySelectorAll('path');
        
        // Should have multiple paths for spinner animation
        expect(paths?.length).toBeGreaterThan(1);
        
        // Check that paths have different opacity values for animation effect
        const opacityValues = Array.from(paths || []).map(path => path.getAttribute('opacity')).filter(Boolean);
        expect(opacityValues.length).toBeGreaterThan(0);
        expect(new Set(opacityValues).size).toBeGreaterThan(1); // Multiple different opacity values
      });

      test('contains clipPath definition for proper rendering', () => {
        render(<SpinnerIcon />);
        
        const svg = screen.getByTitle('Spinner Icon').closest('svg');
        const clipPath = svg?.querySelector('clipPath');
        expect(clipPath).toBeInTheDocument();
        expect(clipPath).toHaveAttribute('id', 'clip0_2393_1490');
        
        const rect = clipPath?.querySelector('rect');
        expect(rect).toBeInTheDocument();
        expect(rect).toHaveAttribute('width', '16');
        expect(rect).toHaveAttribute('height', '16');
      });
    });

    describe('Accessibility', () => {
      test('has accessible title', () => {
        render(<SpinnerIcon />);
        
        const title = screen.getByText('Spinner Icon');
        expect(title).toBeInTheDocument();
      });

      test('SVG can be found by title', () => {
        render(<SpinnerIcon />);
        
        const title = screen.getByTitle('Spinner Icon');
        expect(title).toBeInTheDocument();
        const svg = title.closest('svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  // Tests for Github
  describe('Github', () => {
    describe('Basic Rendering and Props', () => {
      test('renders SVG with default attributes', () => {
        render(<Github />);
        
        const svg = screen.getByTitle('GitHub Icon').closest('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('width', '1em');
        expect(svg).toHaveAttribute('height', '1em');
        expect(svg).toHaveAttribute('fill', 'currentColor');
      });

      test('renders with custom props via spread operator', () => {
        render(<Github className="custom-class" width="24" height="24" />);
        
        const svg = screen.getByTitle('GitHub Icon').closest('svg');
        expect(svg).toHaveClass('custom-class');
        expect(svg).toHaveAttribute('width', '24');
        expect(svg).toHaveAttribute('height', '24');
      });

      test('has proper SVG attributes', () => {
        render(<Github />);
        
        const svg = screen.getByTitle('GitHub Icon').closest('svg');
        expect(svg).toHaveAttribute('viewBox', '0 0 256 250');
        expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
        expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid');
      });

      test('contains GitHub logo path', () => {
        render(<Github />);
        
        const svg = screen.getByTitle('GitHub Icon').closest('svg');
        const path = svg?.querySelector('path');
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('d');
        expect(path?.getAttribute('d')).toContain('M128.001 0C57.317 0');
      });
    });

    describe('Accessibility', () => {
      test('has accessible title', () => {
        render(<Github />);
        
        const title = screen.getByText('GitHub Icon');
        expect(title).toBeInTheDocument();
      });

      test('SVG can be found by title', () => {
        render(<Github />);
        
        const title = screen.getByTitle('GitHub Icon');
        expect(title).toBeInTheDocument();
        const svg = title.closest('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    describe('Props Handling', () => {
      test('forwards all SVG props correctly', () => {
        render(
          <Github 
            data-testid="github-svg"
            role="button"
            aria-label="Custom GitHub Label"
            onClick={() => {}}
          />
        );
        
        const svg = screen.getByTestId('github-svg');
        expect(svg).toHaveAttribute('role', 'button');
        expect(svg).toHaveAttribute('aria-label', 'Custom GitHub Label');
        expect(svg).toHaveProperty('onclick');
      });
    });
  });

  // Tests for StarButton
  describe('StarButton', () => {
    describe('Basic Rendering and Props', () => {
      test('renders as a link with correct attributes', () => {
        render(<StarButton />);
        
        const link = screen.getByTestId('next-link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com/vercel-labs/ai-sdk-preview-reasoning');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      test('has proper CSS classes', () => {
        render(<StarButton />);
        
        const link = screen.getByTestId('next-link');
        expect(link).toHaveClass(
          'flex',
          'items-center', 
          'gap-2',
          'text-sm',
          'text-zinc-600',
          'dark:text-zinc-300',
          'hover:text-zinc-700',
          'dark:hover:text-zinc-300'
        );
      });

      test('contains GitHub icon', () => {
        render(<StarButton />);
        
        const githubIcon = screen.getByTitle('GitHub Icon').closest('svg');
        expect(githubIcon).toBeInTheDocument();
        expect(githubIcon).toHaveClass('size-4');
      });

      test('contains text that is hidden on small screens', () => {
        render(<StarButton />);
        
        const text = screen.getByText('Star on GitHub');
        expect(text).toBeInTheDocument();
        expect(text).toHaveClass('hidden', 'sm:inline');
      });
    });

    describe('Accessibility', () => {
      test('link is accessible with proper text content', () => {
        render(<StarButton />);
        
        const link = screen.getByRole('link', { name: /star on github/i });
        expect(link).toBeInTheDocument();
      });

      test('opens in new tab with proper security attributes', () => {
        render(<StarButton />);
        
        const link = screen.getByTestId('next-link');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    describe('Integration', () => {
      test('GitHub icon is properly sized within button', () => {
        render(<StarButton />);
        
        const githubIcon = screen.getByTitle('GitHub Icon').closest('svg');
        expect(githubIcon).toHaveClass('size-4');
      });
    });
  });

  // Tests for XAiIcon
  describe('XAiIcon', () => {
    describe('Basic Rendering and Props', () => {
      test('renders SVG with default size', () => {
        render(<XAiIcon />);
        
        const svg = screen.getByTitle('xAI Icon').closest('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('height', '16');
      });

      test('renders SVG with custom size', () => {
        render(<XAiIcon size={48} />);
        
        const svg = screen.getByTitle('xAI Icon').closest('svg');
        expect(svg).toHaveAttribute('height', '48');
      });

      test('has proper SVG attributes', () => {
        render(<XAiIcon />);
        
        const svg = screen.getByTitle('xAI Icon').closest('svg');
        expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
        expect(svg).toHaveAttribute('version', '1.1');
        expect(svg).toHaveAttribute('viewBox', '0 0 438.7 481.4');
      });

      test('contains xAI logo path', () => {
        render(<XAiIcon />);
        
        const svg = screen.getByTitle('xAI Icon').closest('svg');
        const path = svg?.querySelector('path');
        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute('d');
        expect(path?.getAttribute('d')).toContain('M355.5,155.1l8.3,326.4h66.6l8.3-445.2');
      });
    });

    describe('Accessibility', () => {
      test('has accessible title', () => {
        render(<XAiIcon />);
        
        const title = screen.getByText('xAI Icon');
        expect(title).toBeInTheDocument();
      });

      test('SVG can be found by title', () => {
        render(<XAiIcon />);
        
        const title = screen.getByTitle('xAI Icon');
        expect(title).toBeInTheDocument();
        const svg = title.closest('svg');
        expect(svg).toBeInTheDocument();
      });
    });
  });

  // Integration Tests
  describe('Integration Tests', () => {
    test('all icon components render together without conflicts', () => {
      render(
        <div>
          <VercelIcon size={20} />
          <SpinnerIcon size={20} />
          <Github className="test-github" />
          <StarButton />
          <XAiIcon size={20} />
        </div>
      );

      expect(screen.getByTitle('Vercel Icon').closest('svg')).toBeInTheDocument();
      expect(screen.getByTitle('Spinner Icon').closest('svg')).toBeInTheDocument();
      expect(screen.getAllByTitle('GitHub Icon')[0].closest('svg')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /star on github/i })).toBeInTheDocument();
      expect(screen.getByTitle('xAI Icon').closest('svg')).toBeInTheDocument();
    });

    test('icons maintain accessibility when used together', () => {
      render(
        <div>
          <VercelIcon />
          <SpinnerIcon />
          <Github />
          <XAiIcon />
        </div>
      );

      // All should have unique accessible names
      const vercelTitle = screen.getByTitle('Vercel Icon');
      const spinnerTitle = screen.getByTitle('Spinner Icon');
      const githubTitle = screen.getByTitle('GitHub Icon');
      const xaiTitle = screen.getByTitle('xAI Icon');
      
      expect(vercelTitle).toBeInTheDocument();
      expect(spinnerTitle).toBeInTheDocument();
      expect(githubTitle).toBeInTheDocument();
      expect(xaiTitle).toBeInTheDocument();
      
      // All titles should be unique
      const titleTexts = [vercelTitle, spinnerTitle, githubTitle, xaiTitle].map(t => t.textContent);
      const uniqueTitles = new Set(titleTexts);
      expect(uniqueTitles.size).toBe(4);
    });

    test('custom sizes work correctly across all components', () => {
      const customSize = 28;
      render(
        <div>
          <VercelIcon size={customSize} />
          <SpinnerIcon size={customSize} />
          <XAiIcon size={customSize} />
        </div>
      );

      const vercelIcon = screen.getByTitle('Vercel Icon').closest('svg');
      const spinnerIcon = screen.getByTitle('Spinner Icon').closest('svg');
      const xaiIcon = screen.getByTitle('xAI Icon').closest('svg');

      expect(vercelIcon).toHaveAttribute('height', customSize.toString());
      expect(vercelIcon).toHaveAttribute('width', customSize.toString());
      expect(spinnerIcon).toHaveAttribute('height', customSize.toString());
      expect(spinnerIcon).toHaveAttribute('width', customSize.toString());
      expect(xaiIcon).toHaveAttribute('height', customSize.toString());
    });
  });

  // Edge Cases and Error Handling
  describe('Edge Cases', () => {
    test('handles zero size gracefully', () => {
      render(<VercelIcon size={0} />);
      
      const svg = screen.getByTitle('Vercel Icon').closest('svg');
      expect(svg).toHaveAttribute('height', '0');
      expect(svg).toHaveAttribute('width', '0');
    });

    test('handles very large size values', () => {
      const largeSize = 9999;
      render(<SpinnerIcon size={largeSize} />);
      
      const svg = screen.getByTitle('Spinner Icon').closest('svg');
      expect(svg).toHaveAttribute('height', largeSize.toString());
      expect(svg).toHaveAttribute('width', largeSize.toString());
    });

    test('Github component handles undefined props gracefully', () => {
      render(<Github />);
      
      const svg = screen.getByTitle('GitHub Icon').closest('svg');
      expect(svg).toBeInTheDocument();
      // Should not crash and should render with default props
    });
  });
});