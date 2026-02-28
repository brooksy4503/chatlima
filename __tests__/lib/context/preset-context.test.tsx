/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { PresetProvider, usePresets } from '@/lib/context/preset-context';

const mockUseAuth = jest.fn();
jest.mock('@/lib/context/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockFetch = jest.fn();
beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
});

function TestConsumer() {
  const { presets, loading, error } = usePresets();
  return (
    <div data-testid="consumer">
      <span data-testid="presets-count">{presets.length}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? 'none'}</span>
    </div>
  );
}

describe('PresetProvider auth gating', () => {
  it('does not call GET /api/presets when isPending is true', async () => {
    mockUseAuth.mockReturnValue({ isPending: true, user: { id: 'user-1' } });
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    render(
      <PresetProvider>
        <TestConsumer />
      </PresetProvider>
    );

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('does not call GET /api/presets when user is null', async () => {
    mockUseAuth.mockReturnValue({ isPending: false, user: null });
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    render(
      <PresetProvider>
        <TestConsumer />
      </PresetProvider>
    );

    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  it('calls GET /api/presets when user is set and isPending is false', async () => {
    mockUseAuth.mockReturnValue({ isPending: false, user: { id: 'user-1' } });
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    render(
      <PresetProvider>
        <TestConsumer />
      </PresetProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/presets',
        expect.objectContaining({
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      );
    });
  });

  it('clears presets and error when user becomes null', async () => {
    mockUseAuth.mockReturnValue({ isPending: false, user: { id: 'user-1' } });
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 'p1', name: 'Preset 1', isDefault: true }]),
    });

    const { rerender } = render(
      <PresetProvider>
        <TestConsumer />
      </PresetProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    mockUseAuth.mockReturnValue({ isPending: false, user: null });
    rerender(
      <PresetProvider>
        <TestConsumer />
      </PresetProvider>
    );

    await waitFor(() => {
      const countEl = document.querySelector('[data-testid="presets-count"]');
      expect(countEl?.textContent).toBe('0');
    });
  });
});
