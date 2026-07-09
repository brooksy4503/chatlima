export function formatQuotedMessageContent(
  quotedText: string,
  draftInput: string
): string {
  const blockquote = quotedText
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  const trimmedInput = draftInput.trim();
  if (!trimmedInput) {
    return blockquote;
  }

  return `${blockquote}\n\n${trimmedInput}`;
}
