import { buildDefaultSystemInstruction } from '@/lib/chat/systemInstruction';

const baseParams = {
  webFetchEnabled: false,
  webSearchUseAgenticServerTools: false,
  effectiveWebSearchEnabled: false,
  imageGenerationEnabled: false,
};

describe('buildDefaultSystemInstruction', () => {
  beforeEach(() => {
    jest.setSystemTime(new Date('2026-07-15T03:00:00.000Z'));
  });

  it('includes the current date and baseline attachment instructions', () => {
    const instruction = buildDefaultSystemInstruction(baseParams);

    expect(instruction).toContain("Today's date is 2026-07-15");
    expect(instruction).toContain('## File Attachments:');
    expect(instruction).toContain('`read_file`');
    expect(instruction).toContain('## How to Respond:');
    expect(instruction).not.toContain('## Native URL Fetch:');
    expect(instruction).not.toContain('## Web Search Enabled');
    expect(instruction).not.toContain('## Image Generation Enabled:');
  });

  it('adds each enabled tool instruction exactly for its mode', () => {
    const instruction = buildDefaultSystemInstruction({
      ...baseParams,
      webFetchEnabled: true,
      webSearchUseAgenticServerTools: true,
      effectiveWebSearchEnabled: true,
      imageGenerationEnabled: true,
    });

    expect(instruction).toContain('## Native URL Fetch:');
    expect(instruction).toContain('## Web Search Enabled (Agentic):');
    expect(instruction).not.toContain('\n## Web Search Enabled:\n');
    expect(instruction).toContain('## Image Generation Enabled:');
  });

  it('uses the legacy search instruction when agentic tools are disabled', () => {
    const instruction = buildDefaultSystemInstruction({
      ...baseParams,
      effectiveWebSearchEnabled: true,
    });

    expect(instruction).toContain('\n## Web Search Enabled:\n');
    expect(instruction).not.toContain('Web Search Enabled (Agentic)');
  });

  it('sanitizes a custom instruction and appends project context', () => {
    const instruction = buildDefaultSystemInstruction({
      ...baseParams,
      systemInstruction: '  Be\u0000   concise.  ',
      projectContextAppendix: 'Project rule: cite internal files.',
    });

    expect(instruction).toBe(
      'Be concise.\n\nProject rule: cite internal files.'
    );
    expect(instruction).not.toContain('## How to Respond:');
  });

  it('appends project context to the generated default', () => {
    const instruction = buildDefaultSystemInstruction({
      ...baseParams,
      projectContextAppendix: 'Project context block',
    });

    expect(instruction.endsWith('\n\nProject context block')).toBe(true);
  });
});
