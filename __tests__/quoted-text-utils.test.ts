import { formatQuotedMessageContent } from "@/lib/quoted-text-utils";

describe("formatQuotedMessageContent", () => {
  it("formats quote-only messages", () => {
    expect(formatQuotedMessageContent("Summary for Your Question", "")).toBe(
      "> Summary for Your Question"
    );
  });

  it("formats multiline quotes", () => {
    expect(formatQuotedMessageContent("line one\nline two", "")).toBe(
      "> line one\n> line two"
    );
  });

  it("appends the user question after the quote", () => {
    expect(
      formatQuotedMessageContent("quoted text", "What does this mean?")
    ).toBe("> quoted text\n\nWhat does this mean?");
  });
});
