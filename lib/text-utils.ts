/**
 * Text processing utilities for enhanced textarea handling
 */

// Common programming keywords for code detection
const PROGRAMMING_KEYWORDS = [
    'function', 'class', 'import', 'export', 'const', 'let', 'var',
    'if', 'else', 'for', 'while', 'return', 'try', 'catch', 'async', 'await',
    'interface', 'type', 'enum', 'extends', 'implements', 'public', 'private',
    'def', 'print', 'True', 'False', 'None', // Python
    'public', 'static', 'void', 'int', 'String', // Java
    'console.log', 'document', 'window', 'require', // JavaScript
];

// File extension patterns
const CODE_EXTENSIONS = [
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
    '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sh', '.sql',
    '.html', '.css', '.scss', '.sass', '.json', '.xml', '.yaml', '.yml'
];

// Code-like syntax patterns
const CODE_PATTERNS = [
    /=>/g,           // Arrow functions
    /\{[\s\S]*\}/g,  // Braces
    /\[[\s\S]*\]/g,  // Brackets
    /<[^>]+>/g,      // HTML/JSX tags
    /^\s*\/\//m,     // Comments
    /^\s*\/\*/m,     // Block comments
    /^\s*#/m,        // Hash comments
    /;\s*$/m,        // Semicolons at line end
];

/**
 * Detects if the given text appears to be code
 */
export function detectCode(text: string): {
    isCode: boolean;
    confidence: number;
    reasons: string[];
} {
    if (!text || text.trim().length < 10) {
        return { isCode: false, confidence: 0, reasons: [] };
    }

    const reasons: string[] = [];
    let score = 0;

    // Check for multiple lines with consistent indentation
    const lines = text.split('\n');
    if (lines.length > 2) {
        const indentedLines = lines.filter(line => /^\s{2,}/.test(line));
        if (indentedLines.length / lines.length > 0.3) {
            score += 30;
            reasons.push('consistent indentation');
        }
    }

    // Check for programming keywords
    const keywordMatches = PROGRAMMING_KEYWORDS.filter(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    );
    if (keywordMatches.length > 0) {
        score += keywordMatches.length * 10;
        reasons.push(`programming keywords: ${keywordMatches.slice(0, 3).join(', ')}`);
    }

    // Check for file extensions
    const extensionMatches = CODE_EXTENSIONS.filter(ext => text.includes(ext));
    if (extensionMatches.length > 0) {
        score += 20;
        reasons.push('file extensions');
    }

    // Check for code patterns
    let patternMatches = 0;
    CODE_PATTERNS.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
            patternMatches += matches.length;
        }
    });

    if (patternMatches > 2) {
        score += Math.min(patternMatches * 5, 40);
        reasons.push('code syntax patterns');
    }

    // Check bracket/brace density
    const specialChars = text.match(/[{}[\]()]/g);
    if (specialChars && specialChars.length / text.length > 0.05) {
        score += 25;
        reasons.push('high bracket density');
    }

    // Check for common code formatting patterns
    if (/^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:]/m.test(text)) {
        score += 15;
        reasons.push('variable assignments');
    }

    const confidence = Math.min(score, 100);
    const isCode = confidence >= 40;

    return { isCode, confidence, reasons };
}

/**
 * Sanitizes text input to fix common display issues
 */
export function sanitizeText(text: string): string {
    if (!text) return text;

    return text
        // Normalize line endings
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Fix smart quotes and similar characters
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/…/g, '...')
        .replace(/–/g, '-')
        .replace(/—/g, '--')
        // Remove invisible characters that can break display
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        // Normalize whitespace (but preserve intentional spacing)
        .replace(/\u00A0/g, ' '); // Non-breaking space to regular space
}

/**
 * Normalizes indentation for better display
 */
export function normalizeIndentation(text: string): string {
    const lines = text.split('\n');

    // Find the minimum indentation (excluding empty lines)
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    if (nonEmptyLines.length === 0) return text;

    const minIndent = Math.min(...nonEmptyLines.map(line => {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }));

    // Remove common leading whitespace
    if (minIndent > 0) {
        return lines
            .map(line => line.length > minIndent ? line.slice(minIndent) : line)
            .join('\n');
    }

    return text;
}

/**
 * Fixes common copy-paste artifacts
 */
export function fixCopyPasteArtifacts(text: string): string {
    return text
        // Remove extra whitespace at line ends
        .replace(/[ \t]+$/gm, '')
        // Fix multiple consecutive blank lines
        .replace(/\n{3,}/g, '\n\n')
        // Fix mixed tab/space indentation
        .replace(/^\t+/gm, match => '  '.repeat(match.length));
}

/**
 * Detects programming language from text content
 */
export function detectLanguage(text: string): string | null {
    const lowerText = text.toLowerCase();

    // JavaScript/TypeScript patterns
    if (lowerText.includes('console.log') || lowerText.includes('function') ||
        lowerText.includes('=>') || lowerText.includes('const ') ||
        lowerText.includes('import ') || lowerText.includes('export ')) {
        if (lowerText.includes('interface ') || lowerText.includes('type ') ||
            text.includes(': string') || text.includes(': number') ||
            text.includes('tsx') || text.includes('typescript')) {
            return 'typescript';
        }
        if (text.includes('jsx') || lowerText.includes('react') ||
            text.includes('className=') || text.includes('onClick=')) {
            return 'jsx';
        }
        return 'javascript';
    }

    // Python patterns
    if (lowerText.includes('def ') || lowerText.includes('print(') ||
        lowerText.includes('class ') || lowerText.includes('if __name__') ||
        lowerText.includes('import numpy') || lowerText.includes('import pandas')) {
        return 'python';
    }

    // HTML/JSX patterns
    if (text.includes('<') && text.includes('>') &&
        (text.includes('</') || text.includes('/>'))) {
        if (text.includes('className=') || text.includes('onClick=') ||
            text.includes('useState') || text.includes('useEffect')) {
            return 'jsx';
        }
        return 'html';
    }

    // CSS patterns
    if (text.includes('{') && text.includes('}') &&
        (text.includes(':') && text.includes(';'))) {
        if (lowerText.includes('@media') || lowerText.includes('px') ||
            lowerText.includes('rem') || lowerText.includes('color:') ||
            lowerText.includes('margin:') || lowerText.includes('padding:')) {
            return 'css';
        }
    }

    // JSON patterns
    if ((text.trim().startsWith('{') && text.trim().endsWith('}')) ||
        (text.trim().startsWith('[') && text.trim().endsWith(']'))) {
        try {
            JSON.parse(text);
            return 'json';
        } catch { }
    }

    // SQL patterns
    if (lowerText.includes('select ') || lowerText.includes('insert ') ||
        lowerText.includes('update ') || lowerText.includes('delete ') ||
        lowerText.includes('create table')) {
        return 'sql';
    }

    // Shell/Bash patterns
    if (lowerText.includes('#!/bin/bash') || lowerText.includes('#!/bin/sh') ||
        text.includes('$ ') || lowerText.includes('npm install') ||
        lowerText.includes('git ') || lowerText.includes('cd ')) {
        return 'bash';
    }

    // Java patterns
    if (lowerText.includes('public class') || lowerText.includes('public static void') ||
        lowerText.includes('system.out.println') || text.includes('import java')) {
        return 'java';
    }

    // C/C++ patterns
    if (text.includes('#include') || lowerText.includes('int main') ||
        lowerText.includes('printf(') || lowerText.includes('cout <<')) {
        return text.includes('cout') || text.includes('std::') ? 'cpp' : 'c';
    }

    return null;
}

/**
 * Checks if text is already wrapped in code blocks
 */
export function isAlreadyWrappedInCodeBlocks(text: string): boolean {
    const trimmed = text.trim();
    return trimmed.startsWith('```') && trimmed.endsWith('```') &&
        trimmed.split('```').length >= 3; // At least opening and closing
}

/**
 * Wraps code in appropriate markdown code blocks
 */
export function wrapInCodeBlocks(text: string, language: string | null = null): string {
    // Don't wrap if already wrapped
    if (isAlreadyWrappedInCodeBlocks(text)) {
        return text;
    }

    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(text);
    const languageTag = detectedLanguage || '';

    // Clean up the text
    const cleanedText = text.trim();

    return `\`\`\`${languageTag}\n${cleanedText}\n\`\`\``;
}

/**
 * Main text processing function that combines all enhancements
 */
export function processTextInput(text: string, options: {
    autoWrapCode?: boolean;
    forceCodeWrapping?: boolean;
} = {}): {
    processedText: string;
    isCode: boolean;
    confidence: number;
    reasons: string[];
    language?: string | null;
    wasWrapped?: boolean;
} {
    const codeDetection = detectCode(text);
    const { autoWrapCode = true, forceCodeWrapping = false } = options;

    let processedText = sanitizeText(text);
    let wasWrapped = false;
    let language: string | null = null;

    if (codeDetection.isCode) {
        processedText = normalizeIndentation(processedText);
        processedText = fixCopyPasteArtifacts(processedText);
        language = detectLanguage(processedText);

        // Auto-wrap in code blocks if enabled and confidence is high enough
        if ((autoWrapCode && codeDetection.confidence >= 60) || forceCodeWrapping) {
            if (!isAlreadyWrappedInCodeBlocks(processedText)) {
                processedText = wrapInCodeBlocks(processedText, language);
                wasWrapped = true;
            }
        }
    }

    return {
        processedText,
        language,
        wasWrapped,
        ...codeDetection
    };
}

/**
 * Smart bracket matching and auto-completion
 */
export function getMatchingBracket(char: string): string | null {
    const brackets: Record<string, string> = {
        '(': ')',
        '[': ']',
        '{': '}',
        '"': '"',
        "'": "'",
        '`': '`'
    };
    return brackets[char] || null;
}

/**
 * Check if brackets are balanced in the text
 */
export function areBracketsBalanced(text: string): boolean {
    const stack: string[] = [];
    const openBrackets = ['(', '[', '{'];
    const closeBrackets = [')', ']', '}'];
    const bracketPairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

    for (const char of text) {
        if (openBrackets.includes(char)) {
            stack.push(char);
        } else if (closeBrackets.includes(char)) {
            const expected = bracketPairs[char];
            if (stack.length === 0 || stack.pop() !== expected) {
                return false;
            }
        }
    }

    return stack.length === 0;
}

/**
 * Auto-indent based on the previous line's indentation
 */
export function calculateIndentation(
    text: string,
    cursorPosition: number
): { indentation: string; shouldIncreaseIndent: boolean } {
    const lines = text.slice(0, cursorPosition).split('\n');
    const currentLine = lines[lines.length - 1];
    const previousLine = lines.length > 1 ? lines[lines.length - 2] : '';

    // Get indentation from previous line
    const previousIndentMatch = previousLine.match(/^(\s*)/);
    const previousIndent = previousIndentMatch ? previousIndentMatch[1] : '';

    // Check if we should increase indentation
    const shouldIncreaseIndent =
        previousLine.trim().endsWith('{') ||
        previousLine.trim().endsWith('[') ||
        previousLine.trim().endsWith('(') ||
        previousLine.trim().endsWith(':') ||
        /^\s*(if|for|while|function|class|def)\b/.test(previousLine);

    const indentation = shouldIncreaseIndent
        ? previousIndent + '  ' // Add 2 spaces
        : previousIndent;

    return { indentation, shouldIncreaseIndent };
}

/**
 * Smart code snippet expansion
 */
export function expandCodeSnippet(text: string, language: string | null): string | null {
    const snippets: Record<string, Record<string, string>> = {
        javascript: {
            'func': 'function ${1:name}(${2:params}) {\n  ${3:// body}\n}',
            'arrow': '(${1:params}) => {\n  ${2:// body}\n}',
            'log': 'console.log(${1:value});',
            'if': 'if (${1:condition}) {\n  ${2:// body}\n}',
            'for': 'for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n  ${3:// body}\n}',
            'try': 'try {\n  ${1:// try block}\n} catch (${2:error}) {\n  ${3:// error handling}\n}'
        },
        typescript: {
            'interface': 'interface ${1:Name} {\n  ${2:property}: ${3:type};\n}',
            'type': 'type ${1:Name} = ${2:type};',
            'func': 'function ${1:name}(${2:params}): ${3:ReturnType} {\n  ${4:// body}\n}',
        },
        python: {
            'def': 'def ${1:function_name}(${2:params}):\n    ${3:pass}',
            'class': 'class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}',
            'if': 'if ${1:condition}:\n    ${2:pass}',
            'for': 'for ${1:item} in ${2:items}:\n    ${3:pass}',
            'try': 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}'
        }
    };

    if (!language || !snippets[language]) return null;

    const languageSnippets = snippets[language];
    const words = text.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];

    return languageSnippets[lastWord] || null;
}

/**
 * Process keyboard input with smart enhancements
 */
export function processKeyboardInput(
    key: string,
    text: string,
    cursorPosition: number,
    language: string | null
): {
    shouldPreventDefault: boolean;
    newText?: string;
    newCursorPosition?: number;
    action?: 'insert' | 'replace' | 'indent';
} {
    // Handle Enter key for auto-indentation
    if (key === 'Enter') {
        const { indentation, shouldIncreaseIndent } = calculateIndentation(text, cursorPosition);

        const beforeCursor = text.slice(0, cursorPosition);
        const afterCursor = text.slice(cursorPosition);

        // Check if we're between matching brackets
        const charBefore = beforeCursor.slice(-1);
        const charAfter = afterCursor.slice(0, 1);
        const isBetweenBrackets =
            (charBefore === '{' && charAfter === '}') ||
            (charBefore === '[' && charAfter === ']') ||
            (charBefore === '(' && charAfter === ')');

        let newText: string;
        let newCursorPosition: number;

        if (isBetweenBrackets) {
            // Insert newline with proper indentation, plus closing bracket indentation
            const closingIndent = indentation.slice(0, -2); // Remove one level for closing bracket
            newText = beforeCursor + '\n' + indentation + '\n' + closingIndent + afterCursor;
            newCursorPosition = cursorPosition + 1 + indentation.length;
        } else {
            // Regular newline with indentation
            newText = beforeCursor + '\n' + indentation + afterCursor;
            newCursorPosition = cursorPosition + 1 + indentation.length;
        }

        return {
            shouldPreventDefault: true,
            newText,
            newCursorPosition,
            action: 'indent'
        };
    }

    // Handle Tab key for indentation
    if (key === 'Tab') {
        const beforeCursor = text.slice(0, cursorPosition);
        const afterCursor = text.slice(cursorPosition);
        const newText = beforeCursor + '  ' + afterCursor; // Insert 2 spaces
        const newCursorPosition = cursorPosition + 2;

        return {
            shouldPreventDefault: true,
            newText,
            newCursorPosition,
            action: 'insert'
        };
    }

    // Handle bracket auto-completion
    const matchingBracket = getMatchingBracket(key);
    if (matchingBracket && key !== matchingBracket) { // Don't auto-close quotes immediately
        const beforeCursor = text.slice(0, cursorPosition);
        const afterCursor = text.slice(cursorPosition);
        const newText = beforeCursor + key + matchingBracket + afterCursor;
        const newCursorPosition = cursorPosition + 1; // Position cursor between brackets

        return {
            shouldPreventDefault: true,
            newText,
            newCursorPosition,
            action: 'insert'
        };
    }

    // Handle closing bracket - skip if next character is the same
    if (['}', ')', ']'].includes(key)) {
        const nextChar = text.slice(cursorPosition, cursorPosition + 1);
        if (nextChar === key) {
            return {
                shouldPreventDefault: true,
                newText: text,
                newCursorPosition: cursorPosition + 1,
                action: 'insert'
            };
        }
    }

    return { shouldPreventDefault: false };
}

/**
 * Clean up malformed or incomplete code structures
 */
export function cleanupCodeStructure(text: string): string {
    let cleaned = text;

    // Fix common JavaScript/TypeScript issues
    cleaned = cleaned
        // Fix missing semicolons at line ends (but not inside strings)
        .replace(/([a-zA-Z0-9_\]\)])\s*\n/g, (match, p1) => {
            // Don't add semicolon if it's already there or if it's a control structure
            if (p1.match(/[;{}]/)) return match;
            return p1 + ';\n';
        })
        // Fix spacing around operators
        .replace(/([a-zA-Z0-9_])([=+\-*/<>!])([a-zA-Z0-9_])/g, '$1 $2 $3')
        // Fix spacing after commas
        .replace(/,([^\s])/g, ', $1')
        // Fix spacing around colons in objects
        .replace(/([a-zA-Z0-9_"'])\s*:\s*([^\s])/g, '$1: $2');

    return cleaned;
}

/**
 * Advanced text analysis for better code detection
 */
export function analyzeCodeStructure(text: string): {
    hasProperIndentation: boolean;
    hasBalancedBrackets: boolean;
    codeBlockCount: number;
    averageLineLength: number;
    complexityScore: number;
} {
    const lines = text.split('\n');

    // Analyze indentation
    const indentedLines = lines.filter(line => /^\s{2,}/.test(line));
    const hasProperIndentation = indentedLines.length / lines.length > 0.2;

    // Check bracket balance
    const hasBalancedBrackets = areBracketsBalanced(text);

    // Count potential code blocks
    const codeBlockCount = (text.match(/\{[\s\S]*?\}/g) || []).length;

    // Calculate average line length
    const averageLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

    // Calculate complexity score based on various factors
    const operatorCount = (text.match(/[=+\-*/<>!&|]/g) || []).length;
    const keywordCount = PROGRAMMING_KEYWORDS.filter(keyword =>
        text.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    const complexityScore = (operatorCount * 2) + (keywordCount * 5) + (codeBlockCount * 10);

    return {
        hasProperIndentation,
        hasBalancedBrackets,
        codeBlockCount,
        averageLineLength,
        complexityScore
    };
} 