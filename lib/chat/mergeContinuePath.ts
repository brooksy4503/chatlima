import type { UIMessage } from 'ai';
import type { CompareUIMessage } from '@/lib/chat/compareHistory';

/** Merge a client continue request onto the server-owned active path. */
export function mergeContinuePath(
  serverPath: CompareUIMessage[],
  clientPath: UIMessage[]
): { messages: UIMessage[]; activeLeafMessageId: string | null } {
  if (serverPath.length === 0) {
    return {
      messages: clientPath,
      activeLeafMessageId: clientPath[clientPath.length - 1]?.id ?? null,
    };
  }

  const prefixMatches = serverPath.every((msg, index) => clientPath[index]?.id === msg.id);

  if (!prefixMatches) {
    return {
      messages: serverPath as UIMessage[],
      activeLeafMessageId: serverPath[serverPath.length - 1]?.id ?? null,
    };
  }

  if (clientPath.length > serverPath.length) {
    return {
      messages: [...(serverPath as UIMessage[]), ...clientPath.slice(serverPath.length)],
      activeLeafMessageId: clientPath[clientPath.length - 1]?.id ?? null,
    };
  }

  return {
    messages: serverPath as UIMessage[],
    activeLeafMessageId: serverPath[serverPath.length - 1]?.id ?? null,
  };
}
