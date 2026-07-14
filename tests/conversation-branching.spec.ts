import { test, expect } from '@playwright/test';
import { gotoApp } from '../playwright.shared';

const branchedChatId = 'branch-chat-test-id';

const branchedMessages = [
  {
    id: 'u1',
    role: 'user',
    parts: [{ type: 'text', text: 'Hello' }],
    parentMessageId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'a1',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Hi there' }],
    parentMessageId: 'u1',
    modelDisplayName: 'Model A',
    createdAt: '2026-01-01T00:00:01.000Z',
  },
  {
    id: 'a2',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Hi again' }],
    parentMessageId: 'u1',
    modelDisplayName: 'Model B',
    createdAt: '2026-01-01T00:00:02.000Z',
  },
];

function buildActivePath(leafMessageId: 'a1' | 'a2') {
  const assistant =
    leafMessageId === 'a2'
      ? {
          id: 'a2',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Hi again' }],
          parentMessageId: 'u1',
          modelDisplayName: 'Model B',
        }
      : {
          id: 'a1',
          role: 'assistant',
          parts: [{ type: 'text', text: 'Hi there' }],
          parentMessageId: 'u1',
          modelDisplayName: 'Model A',
        };

  return [
    {
      id: 'u1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello' }],
      parentMessageId: null,
    },
    assistant,
  ];
}

test.describe('Conversation branching UI', () => {
  test.beforeEach(async ({ page }) => {
    let activeLeafMessageId: 'a1' | 'a2' = 'a1';

    const buildChatPayload = () => ({
      id: branchedChatId,
      title: 'Branch test',
      activeLeafMessageId,
      messages: branchedMessages,
      activePathMessages: buildActivePath(activeLeafMessageId),
    });

    await page.route('**/api/chats', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
        return;
      }
      await route.continue();
    });

    await page.route(`**/api/chats/${branchedChatId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildChatPayload()),
        });
        return;
      }
      await route.continue();
    });

    await page.route(`**/api/chats/${branchedChatId}/active-leaf`, async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON() as { leafMessageId?: string };
        activeLeafMessageId = body.leafMessageId === 'a2' ? 'a2' : 'a1';
        const activePathMessages = buildActivePath(activeLeafMessageId);

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ activeLeafMessageId, activePathMessages }),
        });
        return;
      }
      await route.continue();
    });

    await page.route('**/api/token-usage?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { breakdownByMessage: [], totalTokens: 0 } }),
      });
    });
  });

  test('shows branch pager and switches assistant versions', async ({ page }) => {
    await gotoApp(page, `/chat/${branchedChatId}`);

    await expect(page.getByText('Hi there')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next version' })).toBeEnabled();
    await expect(page.getByText('1 / 2')).toBeVisible();

    const patchPromise = page.waitForRequest(
      (req) =>
        req.url().includes(`/api/chats/${branchedChatId}/active-leaf`) &&
        req.method() === 'PATCH'
    );

    await page.getByLabel('Next version').click();
    await patchPromise;

    await expect(page.getByText('Hi again')).toBeVisible();
    await expect(page.getByText('Model B')).toBeVisible();
    await expect(page.getByText(/\d+ \/ 2/)).toBeVisible();
  });

  test('exposes message actions menu on assistant messages', async ({ page }) => {
    await gotoApp(page, `/chat/${branchedChatId}`);

    await expect(page.getByLabel('Message actions').first()).toBeVisible();
  });
});
