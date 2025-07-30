import '@testing-library/jest-dom';

// React 19 and modern DOM feature support
// Ensure DOM is available in tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// React 19 specific mocks and polyfills
// Mock structuredClone for React 19 compatibility
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function structuredClone(value) {
    if (value === null || value === undefined) {
      return value;
    }

    try {
      // For objects and arrays, use JSON methods
      if (typeof value === 'object') {
        return JSON.parse(JSON.stringify(value));
      }

      // For primitive values, return directly
      return value;
    } catch (error) {
      console.warn('structuredClone polyfill failed:', error);

      // Returns a shallow copy as fallback
      return Array.isArray(value) ? [...value] : { ...value };
    }
  };
}

// Mock modern browser APIs that React 19 might use
global.Request = global.Request || class Request {};
global.Response = global.Response || class Response {};
global.Headers = global.Headers || class Headers {};

// Silence specific React 19 warnings in tests
const originalError = console.error;
console.error = (...args) => {
  // Suppress specific React 19 warnings during testing
  if (typeof args[0] === 'string' && 
      (args[0].includes('outdated JSX transform') ||
       args[0].includes('Warning:') && args[0].includes('act'))) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock CSS modules - handled in moduleNameMapper in jest.config.js

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Mock TextDecoder/TextEncoder and streaming APIs for Node.js environment
const { TextDecoder, TextEncoder } = require('util');
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// Mock streaming APIs
global.TransformStream = class TransformStream {
  constructor() {
    this.readable = {};
    this.writable = {};
  }
};

global.ReadableStream = class ReadableStream {
  constructor() {}
};

global.WritableStream = class WritableStream {
  constructor() {}
};

// Mock database dependencies
jest.mock('drizzle-orm/neon-serverless', () => ({
  drizzle: jest.fn(() => ({
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue([]),
      }),
    }),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    }),
  })),
}));

jest.mock('@neondatabase/serverless', () => ({
  Pool: jest.fn(),
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-id-123'),
}));

// Mock AI SDK providers
jest.mock('@ai-sdk/openai', () => ({
  createOpenAI: jest.fn(() => ({})),
}));

jest.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: jest.fn(() => ({})),
}));

jest.mock('@ai-sdk/groq', () => ({
  createGroq: jest.fn(() => ({})),
}));

jest.mock('@ai-sdk/xai', () => ({
  createXai: jest.fn(() => ({})),
}));

jest.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: jest.fn(() => ({})),
}));

jest.mock('@requesty/ai-sdk', () => ({
  createRequesty: jest.fn(() => ({})),
}));



