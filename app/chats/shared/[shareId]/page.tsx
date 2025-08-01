import { notFound } from 'next/navigation';
import { SharedChatMessages } from '@/components/shared-chat-messages';
import type { ChatSnapshot } from '@/lib/services/chat-sharing';

interface PageProps {
  params: Promise<{ shareId: string }>;
}

async function getSharedChat(shareId: string): Promise<ChatSnapshot | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/chats/shared/${shareId}`, {
      cache: 'force-cache',
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching shared chat:', error);
    return null;
  }
}

export default async function SharedChatPage({ params }: PageProps) {
  const { shareId } = await params;
  const snapshot = await getSharedChat(shareId);

  if (!snapshot) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-lg sm:max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-lg">{snapshot.chat.title}</h1>
              <p className="text-sm text-muted-foreground">
                Shared chat • {new Date(snapshot.chat.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                Read-only
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1">
        <SharedChatMessages 
          messages={snapshot.messages}
          metadata={snapshot.metadata}
        />
      </main>

      {/* Footer with redaction notice */}
      {snapshot.metadata.redaction.piiRemoved && (
        <footer className="border-t bg-muted/30">
          <div className="max-w-lg sm:max-w-3xl mx-auto px-4 py-3">
            <p className="text-xs text-muted-foreground text-center">
              This shared chat has been sanitized for privacy. Personal information, 
              system prompts, tool arguments, and media attachments have been removed.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { shareId } = await params;
  const snapshot = await getSharedChat(shareId);

  if (!snapshot) {
    return {
      title: 'Shared Chat Not Found',
      description: 'The requested shared chat could not be found.',
    };
  }

  return {
    title: `${snapshot.chat.title} - Shared Chat`,
    description: `A shared conversation about ${snapshot.chat.title}`,
    robots: 'noindex, nofollow', // Don't index shared chats for privacy
  };
}