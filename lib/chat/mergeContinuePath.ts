import type { UIMessage } from 'ai';
import type { CompareUIMessage } from '@/lib/chat/compareHistory';
import { resolvePersistedActiveLeafId } from '@/lib/chat/conversationTree';

/** Merge a client continue request onto the server-owned active path. */
export function mergeContinuePath(
  serverPath: CompareUIMessage[],
  clientPath: UIMessage[]
): { messages: UIMessage[]; activeLeafMessageId: string | null } {
  if (serverPath.length === 0) {
    return {
      messages: clientPath,
      activeLeafMessageId: resolvePersistedActiveLeafId(clientPath),
    };
  }

  const prefixMatches = serverPath.every((msg, index) => clientPath[index]?.id === msg.id);

  if (!prefixMatches) {
    const messages = serverPath as UIMessage[];
    return {
      messages,
      activeLeafMessageId: resolvePersistedActiveLeafId(messages),
    };
  }

  if (clientPath.length > serverPath.length) {
    const messages = [...(serverPath as UIMessage[]), ...clientPath.slice(serverPath.length)];
    return {
      messages,
      activeLeafMessageId: resolvePersistedActiveLeafId(messages),
    };
  }

  const messages = serverPath as UIMessage[];
  return {
    messages,
    activeLeafMessageId: resolvePersistedActiveLeafId(messages),
  };
}
