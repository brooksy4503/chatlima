// Mock implementation of async_hooks for client-side usage
// This provides empty implementations to prevent build errors

class AsyncLocalStorage {
  constructor() {
    this.store = new Map();
  }
  
  getStore() {
    return this.store.get(undefined);
  }
  
  run(store, callback) {
    const previous = this.getStore();
    this.store.set(undefined, store);
    try {
      return callback();
    } finally {
      if (previous === undefined) {
        this.store.delete(undefined);
      } else {
        this.store.set(undefined, previous);
      }
    }
  }
  
  enterWith(store) {
    this.store.set(undefined, store);
  }
  
  exit(callback) {
    const previous = this.getStore();
    this.store.delete(undefined);
    try {
      return callback();
    } finally {
      this.store.set(undefined, previous);
    }
  }
  
  disable() {
    // No-op
  }
  
  enable() {
    // No-op
  }
}

// Export the mock implementations
module.exports = {
  AsyncLocalStorage,
  // Add other async_hooks exports as needed
  createHook: () => ({
    enable: () => {},
    disable: () => {},
  }),
  executionAsyncId: () => 0,
  triggerAsyncId: () => 0,
  asyncLocalStorage: new AsyncLocalStorage(),
};