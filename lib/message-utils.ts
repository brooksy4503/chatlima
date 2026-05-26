import type { UIMessage } from 'ai';

/** Extract plain text from a UIMessage's parts. */
export function getUIMessageText(message: UIMessage): string {
  if (!message.parts?.length) {
    return '';
  }

  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map(part => part.text)
    .join('\n\n');
}
