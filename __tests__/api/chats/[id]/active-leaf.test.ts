/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/chats/[id]/active-leaf/route';
import { auth } from '@/lib/auth';
import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

jest.mock('@/lib/services/conversationPersistence', () => ({
  ConversationPersistenceService: {
    loadChatGraph: jest.fn(),
    setActiveLeaf: jest.fn(),
  },
}));

const mockGetSession = auth.api.getSession as jest.Mock;
const mockLoadChatGraph = ConversationPersistenceService.loadChatGraph as jest.Mock;
const mockSetActiveLeaf = ConversationPersistenceService.setActiveLeaf as jest.Mock;

const branchedMessages = [
  {
    id: 'u1',
    role: 'user',
    parentMessageId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    parts: [{ type: 'text', text: 'Hello' }],
  },
  {
    id: 'a1',
    role: 'assistant',
    parentMessageId: 'u1',
    createdAt: new Date('2026-01-01T00:00:01Z'),
    parts: [{ type: 'text', text: 'Hi there' }],
  },
  {
    id: 'a2',
    role: 'assistant',
    parentMessageId: 'u1',
    createdAt: new Date('2026-01-01T00:00:02Z'),
    parts: [{ type: 'text', text: 'Hi again' }],
  },
];

describe('PATCH /api/chats/[id]/active-leaf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ user: { id: 'user-1' } });
    mockLoadChatGraph.mockResolvedValue({
      allMessages: branchedMessages,
      activeLeafMessageId: 'a2',
    });
    mockSetActiveLeaf.mockResolvedValue(true);
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await PATCH(
      new NextRequest('http://localhost/api/chats/chat-1/active-leaf', {
        method: 'PATCH',
        body: JSON.stringify({ leafMessageId: 'a1' }),
      }),
      { params: Promise.resolve({ id: 'chat-1' }) }
    );

    expect(response.status).toBe(401);
  });

  it('switches assistant sibling and returns active path projection', async () => {
    const response = await PATCH(
      new NextRequest('http://localhost/api/chats/chat-1/active-leaf', {
        method: 'PATCH',
        body: JSON.stringify({ leafMessageId: 'a1' }),
      }),
      { params: Promise.resolve({ id: 'chat-1' }) }
    );

    expect(response.status).toBe(200);
    expect(mockSetActiveLeaf).toHaveBeenCalledWith({
      chatId: 'chat-1',
      userId: 'user-1',
      leafMessageId: 'a1',
    });

    const body = await response.json();
    expect(body.activeLeafMessageId).toBe('a1');
    expect(body.activePathMessages.map((m: { id: string }) => m.id)).toEqual(['u1', 'a1']);
  });

  it('resolves deepest leaf when selecting a user sibling', async () => {
    const userBranchMessages = [
      {
        id: 'u1',
        role: 'user',
        parentMessageId: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        parts: [{ type: 'text', text: 'Original' }],
      },
      {
        id: 'a1',
        role: 'assistant',
        parentMessageId: 'u1',
        createdAt: new Date('2026-01-01T00:00:01Z'),
        parts: [{ type: 'text', text: 'Reply A' }],
      },
      {
        id: 'u1b',
        role: 'user',
        parentMessageId: null,
        createdAt: new Date('2026-01-01T00:00:02Z'),
        parts: [{ type: 'text', text: 'Edited' }],
      },
      {
        id: 'a1b',
        role: 'assistant',
        parentMessageId: 'u1b',
        createdAt: new Date('2026-01-01T00:00:03Z'),
        parts: [{ type: 'text', text: 'Reply B' }],
      },
    ];

    mockLoadChatGraph.mockResolvedValue({
      allMessages: userBranchMessages,
      activeLeafMessageId: 'a1b',
    });

    const response = await PATCH(
      new NextRequest('http://localhost/api/chats/chat-1/active-leaf', {
        method: 'PATCH',
        body: JSON.stringify({ leafMessageId: 'u1' }),
      }),
      { params: Promise.resolve({ id: 'chat-1' }) }
    );

    expect(response.status).toBe(200);
    expect(mockSetActiveLeaf).toHaveBeenCalledWith({
      chatId: 'chat-1',
      userId: 'user-1',
      leafMessageId: 'a1',
    });

    const body = await response.json();
    expect(body.activePathMessages.map((m: { id: string }) => m.id)).toEqual(['u1', 'a1']);
  });

  it('returns 400 when branch selection is invalid', async () => {
    mockSetActiveLeaf.mockResolvedValue(false);

    const response = await PATCH(
      new NextRequest('http://localhost/api/chats/chat-1/active-leaf', {
        method: 'PATCH',
        body: JSON.stringify({ leafMessageId: 'missing' }),
      }),
      { params: Promise.resolve({ id: 'chat-1' }) }
    );

    expect(response.status).toBe(400);
  });
});
