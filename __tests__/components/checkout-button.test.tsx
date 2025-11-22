/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutButton } from '../../components/checkout-button';

// Mock the useAuth hook
const mockUseAuth = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock auth-client signIn
const mockSignIn = {
  social: jest.fn(),
};

jest.mock('../../lib/auth-client', () => ({
  signIn: mockSignIn,
}));

// Mock the Button component
jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CreditCard: ({ className }: any) => <div className={className} data-testid="credit-card-icon" />,
}));

// Mock window.location to prevent JSDOM navigation errors
const mockLocation = {
  href: '',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
};

// Store original location for restoration
const originalLocation = window.location;

// Set up location mock
beforeAll(() => {
  delete (window as any).location;
  window.location = mockLocation as any;
});

// Restore original location after all tests
afterAll(() => {
  if (originalLocation) {
    delete (window as any).location;
    window.location = originalLocation;
  }
});

describe('CheckoutButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = '';
  });

  describe('Anonymous User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAnonymous: true,
        isAuthenticated: false,
      });
    });

    it('renders with sign in text for anonymous users', () => {
      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sign In to Purchase Credits');
    });

    it('displays credit card icon', () => {
      render(<CheckoutButton />);
      
      const icon = screen.getByTestId('credit-card-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('mr-2 h-4 w-4');
    });

    it('has full width styling', () => {
      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

        it('calls signIn.social when clicked', () => {
      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockSignIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/upgrade',
      });
    });
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAnonymous: false,
        isAuthenticated: false,
      });
    });

    it('renders with sign in text for unauthenticated users', () => {
      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign In to Purchase Credits');
    });

        it('calls router.push when clicked', () => {
      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockPush).toHaveBeenCalledWith('/api/auth/sign-in/google');
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          isAnonymous: false,
        },
        isAnonymous: false,
        isAuthenticated: true,
      });
    });

    it('renders with upgrade text for authenticated users', () => {
      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Upgrade');
    });

    it('navigates to checkout when clicked', () => {
      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      // Component uses window.location.href for authenticated users
      expect(mockLocation.href).toBe('/api/auth/checkout/ai-usage');
      expect(mockSignIn.social).not.toHaveBeenCalled();
    });

    it('displays credit card icon', () => {
      render(<CheckoutButton />);
      
      const icon = screen.getByTestId('credit-card-icon');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles authenticated user with anonymous flag set to true', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'Anonymous User',
          isAnonymous: true,
        },
        isAnonymous: true,
        isAuthenticated: true,
      });

      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign In to Purchase Credits');
      
      fireEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith('/api/auth/sign-in/google');
    });

    it('handles user object present but not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: {
          id: 'user-123',
          name: 'John Doe',
        },
        isAnonymous: false,
        isAuthenticated: false,
      });

      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Sign In to Purchase Credits');
      
      fireEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith('/api/auth/sign-in/google');
    });

    it('handles loading state gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAnonymous: false,
        isAuthenticated: false,
      });

      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Sign In to Purchase Credits');
    });
  });

  describe('Accessibility', () => {
    it('renders as a proper button element', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAnonymous: true,
        isAuthenticated: false,
      });

      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('is keyboard accessible', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAnonymous: true,
        isAuthenticated: false,
      });

      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Component Structure', () => {
    it('renders icon and text in correct order', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAnonymous: true,
        isAuthenticated: false,
      });

      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      const icon = screen.getByTestId('credit-card-icon');
      
      expect(button).toContainElement(icon);
      expect(icon).toHaveClass('mr-2');
    });

    it('applies correct CSS classes', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAnonymous: true,
        isAuthenticated: false,
      });

      render(<CheckoutButton />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });
});