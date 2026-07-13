import { test, expect } from '@playwright/test';

const branchedChatId = 'branch-chat-test-id';

const branchedChatPayload = {
  id: branchedChatId,
  title: 'Branch test',
  activeLeafMessageId: 'a2',
  messages: [
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
  ],
  activePathMessages: [
    {
      id: 'u1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello' }],
      parentMessageId: null,
    },
    {
      id: 'a2',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hi again' }],
      parentMessageId: 'u1',
      modelDisplayName: 'Model B',
    },
  ],
};

test.describe('Conversation branching UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/chats/${branchedChatId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(branchedChatPayload),
        });
        return;
      }
      await route.continue();
    });

    await page.route(`**/api/chats/${branchedChatId}/active-leaf`, async (route) => {
      if (route.request().method() === 'PATCH') {
        const body = route.request().postDataJSON() as { leafMessageId?: string };
        const leafMessageId = body.leafMessageId ?? 'a1';
        const activePathMessages =
          leafMessageId === 'a1'
            ? [
                branchedChatPayload.activePathMessages[0],
                {
                  id: 'a1',
                  role: 'assistant',
                  parts: [{ type: 'text', text: 'Hi there' }],
                  parentMessageId: 'u1',
                  modelDisplayName: 'Model A',
                },
              ]
            : branchedChatPayload.activePathMessages;

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ activeLeafMessageId: leafMessageId, activePathMessages }),
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
    await page.goto(`/chat/${branchedChatId}`);

    await expect(page.getByText('Hi again')).toBeVisible();
    await expect(page.getByLabel('Version 2 of 2')).toBeVisible();

    const patchPromise = page.waitForRequest(
      (req) =>
        req.url().includes(`/api/chats/${branchedChatId}/active-leaf`) &&
        req.method() === 'PATCH'
    );

    await page.getByLabel('Previous version').click();
    await patchPromise;

    await expect(page.getByText('Hi there')).toBeVisible();
    await expect(page.getByLabel('Version 1 of 2')).toBeVisible();
  });

  test('exposes message actions menu on assistant messages', async ({ page }) => {
    await page.goto(`/chat/${branchedChatId}`);

    await expect(page.getByLabel('Message actions').first()).toBeVisible();
  });
});
