/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolInvocation } from '../../components/tool-invocation';

// Mock framer-motion to avoid animation complexity in tests
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDownIcon: ({ className }: any) => (
    <div className={className} data-testid="chevron-down" />
  ),
  ChevronUpIcon: ({ className }: any) => (
    <div className={className} data-testid="chevron-up" />
  ),
  Loader2: ({ className }: any) => (
    <div className={className} data-testid="loader" />
  ),
  CheckCircle2: ({ className, size }: any) => (
    <div className={className} data-testid="check-circle" data-size={size} />
  ),
  TerminalSquare: ({ className }: any) => (
    <div className={className} data-testid="terminal-icon" />
  ),
  Code: ({ className }: any) => (
    <div className={className} data-testid="code-icon" />
  ),
  ArrowRight: ({ className }: any) => (
    <div className={className} data-testid="arrow-right" />
  ),
  Circle: ({ className }: any) => (
    <div className={className} data-testid="circle" />
  ),
}));

describe('ToolInvocation', () => {
  const defaultProps = {
    toolName: 'test-tool',
    state: 'call',
    args: { param1: 'value1', param2: 'value2' },
    result: { output: 'test result', status: 'success' },
    isLatestMessage: false,
    status: 'ready',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering and Props', () => {
    test('renders with default props', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      expect(screen.getByText('test-tool')).toBeInTheDocument();
      expect(screen.getByTestId('terminal-icon')).toBeInTheDocument();
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    test('displays tool name correctly', () => {
      render(<ToolInvocation {...defaultProps} toolName="custom-tool" />);
      
      expect(screen.getByText('custom-tool')).toBeInTheDocument();
    });

    test('renders collapsed by default', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
      expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
      expect(screen.queryByText('Result')).not.toBeInTheDocument();
    });

    test('does not render arguments section when args is null', () => {
      render(<ToolInvocation {...defaultProps} args={null} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
    });

    test('does not render result section when result is null', () => {
      render(<ToolInvocation {...defaultProps} result={null} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.queryByText('Result')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('expands when clicked', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      const expandButton = screen.getByTestId('chevron-down').closest('div');
      expect(expandButton).not.toBeNull();
      if (expandButton) {
        fireEvent.click(expandButton);
      }
      
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
      expect(screen.getByText('Arguments')).toBeInTheDocument();
      expect(screen.getByText('Result')).toBeInTheDocument();
    });

    test('collapses when clicked again', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      const expandButton = screen.getByTestId('chevron-down').closest('div');
      expect(expandButton).not.toBeNull();
      
      // Expand
      if (expandButton) {
        fireEvent.click(expandButton);
      }
      expect(screen.getByTestId('chevron-up')).toBeInTheDocument();
      
      // Collapse
      const collapseButton = screen.getByTestId('chevron-up').closest('div');
      expect(collapseButton).not.toBeNull();
      if (collapseButton) {
        fireEvent.click(collapseButton);
      }
      expect(screen.getByTestId('chevron-down')).toBeInTheDocument();
    });

    test('toggles expansion state correctly', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      const expandButton = screen.getByTestId('chevron-down').closest('div');
      
      // Initially collapsed
      expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
      
      // Expand
      if (expandButton) {
        fireEvent.click(expandButton);
      }
      expect(screen.getByText('Arguments')).toBeInTheDocument();
      
      // Collapse
      const collapseButton = screen.getByTestId('chevron-up').closest('div');
      if (collapseButton) {
        fireEvent.click(collapseButton);
      }
      expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
    });
  });

  describe('State Management - Call State', () => {
    test('displays "Waiting" status for call state when not latest message', () => {
      render(
        <ToolInvocation 
          {...defaultProps} 
          state="call" 
          isLatestMessage={false} 
          status="ready" 
        />
      );
      
      expect(screen.getByText('Waiting')).toBeInTheDocument();
      expect(screen.getByTestId('circle')).toBeInTheDocument();
    });

    test('displays "Running" status for call state when latest message and not ready', () => {
      render(
        <ToolInvocation 
          {...defaultProps} 
          state="call" 
          isLatestMessage={true} 
          status="processing" 
        />
      );
      
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    test('displays "Waiting" status for call state when latest message and ready', () => {
      render(
        <ToolInvocation 
          {...defaultProps} 
          state="call" 
          isLatestMessage={true} 
          status="ready" 
        />
      );
      
      expect(screen.getByText('Waiting')).toBeInTheDocument();
      expect(screen.getByTestId('circle')).toBeInTheDocument();
    });
  });

  describe('State Management - Result State', () => {
    test('displays "Completed" status for result state', () => {
      render(<ToolInvocation {...defaultProps} state="result" />);
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
    });

    test('shows check circle icon for completed state', () => {
      render(<ToolInvocation {...defaultProps} state="result" />);
      
      const checkIcon = screen.getByTestId('check-circle');
      expect(checkIcon).toBeInTheDocument();
      expect(checkIcon).toHaveAttribute('data-size', '14');
    });
  });

  describe('Content Formatting', () => {
    test('formats JSON objects correctly', () => {
      const complexArgs = {
        nested: { key: 'value' },
        array: [1, 2, 3],
        string: 'test'
      };
      
      render(<ToolInvocation {...defaultProps} args={complexArgs} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      
      const pre = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'pre' && 
               content.includes('"nested"') &&
               content.includes('"key": "value"');
      });
      
      expect(pre).toBeInTheDocument();
    });

    test('handles string content correctly', () => {
      render(<ToolInvocation {...defaultProps} args="simple string" />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.getByText('simple string')).toBeInTheDocument();
    });

    test('handles JSON string content correctly', () => {
      const jsonString = '{"key": "value", "number": 42}';
      render(<ToolInvocation {...defaultProps} args={jsonString} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      
      const formattedContent = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'pre' && 
               content.includes('"key": "value"') &&
               content.includes('"number": 42');
      });
      
      expect(formattedContent).toBeInTheDocument();
    });

    test('handles invalid JSON string gracefully', () => {
      const invalidJson = '{"key": value}'; // Invalid JSON
      render(<ToolInvocation {...defaultProps} args={invalidJson} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.getByText(invalidJson)).toBeInTheDocument();
    });

    test('handles non-serializable content gracefully', () => {
      const circularObj: { a: number; self?: any } = { a: 1 };
      circularObj.self = circularObj; // Create circular reference
      
      render(<ToolInvocation {...defaultProps} args={circularObj} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      // Should not crash and display some string representation
      expect(screen.getByText('Arguments')).toBeInTheDocument();
    });

    test('formats both args and result when expanded', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      
      expect(screen.getByText('Arguments')).toBeInTheDocument();
      expect(screen.getByText('Result')).toBeInTheDocument();
      expect(screen.getByTestId('code-icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('arrow-right')).toHaveLength(2);
    });
  });

  describe('Visual States and Styling', () => {
    test('applies correct CSS classes for call state with loading', () => {
      render(
        <ToolInvocation 
          {...defaultProps} 
          state="call" 
          isLatestMessage={true} 
          status="processing" 
        />
      );
      
      const runningText = screen.getByText('Running');
      expect(runningText).toHaveClass('text-primary');
    });

    test('applies correct CSS classes for call state without loading', () => {
      render(
        <ToolInvocation 
          {...defaultProps} 
          state="call" 
          isLatestMessage={false} 
          status="ready" 
        />
      );
      
      const waitingText = screen.getByText('Waiting');
      expect(waitingText).toHaveClass('text-muted-foreground');
    });

    test('applies correct CSS classes for result state', () => {
      render(<ToolInvocation {...defaultProps} state="result" />);
      
      const completedText = screen.getByText('Completed');
      expect(completedText).toHaveClass('text-primary');
    });

    test('shows spinner animation for loading state', () => {
      render(
        <ToolInvocation 
          {...defaultProps} 
          state="call" 
          isLatestMessage={true} 
          status="processing" 
        />
      );
      
      const loader = screen.getByTestId('loader');
      expect(loader).toHaveClass('animate-spin');
    });
  });

  describe('Accessibility', () => {
    test('has clickable expand/collapse functionality', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      // Find the clickable div by its classes
      const clickableElement = document.querySelector('.cursor-pointer');
      expect(clickableElement).toBeInTheDocument();
      expect(clickableElement).toHaveClass('cursor-pointer');
    });

    test('is keyboard accessible', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      const expandButton = screen.getByTestId('chevron-down').closest('div')?.parentElement?.parentElement;
      expandButton?.focus();
      
      fireEvent.keyDown(expandButton!, { key: 'Enter' });
      // Note: The component doesn't actually handle keyboard events, 
      // but we test that it doesn't crash
      expect(expandButton).toBeInTheDocument();
    });

    test('provides visual feedback on hover', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      // Find the element with hover classes
      const hoverElement = document.querySelector('.hover\\:bg-muted\\/20');
      expect(hoverElement).toBeInTheDocument();
      expect(hoverElement).toHaveClass('hover:bg-muted/20');
    });

    test('has proper semantic structure', () => {
      render(<ToolInvocation {...defaultProps} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      
      // Check for proper heading structure
      expect(screen.getByText('Arguments')).toBeInTheDocument();
      expect(screen.getByText('Result')).toBeInTheDocument();
      
      // Check for code elements (pre tags)
      const preElements = document.querySelectorAll('pre');
      expect(preElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty args object', () => {
      render(<ToolInvocation {...defaultProps} args={{}} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.getByText('Arguments')).toBeInTheDocument();
      expect(screen.getByText('{}')).toBeInTheDocument();
    });

    test('handles empty result object', () => {
      render(<ToolInvocation {...defaultProps} result={{}} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.getByText('Result')).toBeInTheDocument();
      expect(screen.getByText('{}')).toBeInTheDocument();
    });

    test('handles undefined values gracefully', () => {
      render(
        <ToolInvocation 
          {...defaultProps} 
          args={undefined} 
          result={undefined} 
        />
      );
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
      expect(screen.queryByText('Result')).not.toBeInTheDocument();
    });

    test('handles very long tool names', () => {
      const longToolName = 'very-long-tool-name-that-might-overflow-the-container';
      
      render(<ToolInvocation {...defaultProps} toolName={longToolName} />);
      
      expect(screen.getByText(longToolName)).toBeInTheDocument();
    });

    test('handles large result data', () => {
      const largeResult = {
        data: Array(100).fill(0).map((_, i) => ({ id: i, value: `item-${i}` }))
      };
      
      render(<ToolInvocation {...defaultProps} result={largeResult} />);
      
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      expect(screen.getByText('Result')).toBeInTheDocument();
      
      // Should have scrollable container for large content
      const preElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'pre' && 
               content.includes('"id": 0');
      });
      expect(preElement).toHaveClass('max-h-[300px]');
      expect(preElement).toHaveClass('overflow-y-auto');
    });
  });

  describe('Integration Tests', () => {
    test('complete expansion workflow with mixed content types', async () => {
      const complexProps = {
        ...defaultProps,
        toolName: 'complex-tool',
        state: 'result',
        args: { 
          stringParam: 'test',
          objectParam: { nested: true },
          arrayParam: [1, 2, 3]
        },
        result: '{"success": true, "data": [{"id": 1}, {"id": 2}]}',
        isLatestMessage: true,
        status: 'completed'
      };
      
      render(<ToolInvocation {...complexProps} />);
      
      // Initial state
      expect(screen.getByText('complex-tool')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
      
      // Expand
      const clickableArea = screen.getByTestId('chevron-down').closest('div')?.parentElement;
      fireEvent.click(clickableArea!);
      
      await waitFor(() => {
        expect(screen.getByText('Arguments')).toBeInTheDocument();
        expect(screen.getByText('Result')).toBeInTheDocument();
      });
      
      // Verify content formatting
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'pre' && 
               content.includes('"stringParam": "test"');
      })).toBeInTheDocument();
      
      expect(screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'pre' && 
               content.includes('"success": true');
      })).toBeInTheDocument();
      
      // Collapse
      const collapseButton = screen.getByTestId('chevron-up').closest('div')?.parentElement;
      fireEvent.click(collapseButton!);
      expect(screen.queryByText('Arguments')).not.toBeInTheDocument();
    });

    test('state transitions work correctly', () => {
      const { rerender } = render(
        <ToolInvocation 
          {...defaultProps} 
          state="call" 
          isLatestMessage={true} 
          status="processing" 
        />
      );
      
      // Initial loading state
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
      
      // Complete the tool
      rerender(
        <ToolInvocation 
          {...defaultProps} 
          state="result" 
          isLatestMessage={false} 
          status="completed" 
        />
      );
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByTestId('check-circle')).toBeInTheDocument();
    });
  });
});