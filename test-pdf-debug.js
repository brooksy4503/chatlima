// Test script to debug PDF generation with long messages
const { generateChatPDF } = require('./app/api/chats/[id]/export-pdf/route.ts');

// Create a test chat with long messages
const testChat = {
    id: 'test-chat-123',
    title: 'Test Chat with Long Messages',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
        {
            id: 'msg-1',
            role: 'user',
            content: [{ type: 'text', text: 'This is a very long user message that should cause text wrapping and potentially page breaks. '.repeat(50) }],
            createdAt: new Date(),
        },
        {
            id: 'msg-2',
            role: 'assistant',
            content: [{ type: 'text', text: 'This is an even longer assistant response that will definitely require multiple lines and might span across pages. '.repeat(100) }],
            createdAt: new Date(),
        },
        {
            id: 'msg-3',
            role: 'user',
            content: [{ type: 'text', text: 'Another long message to test page breaks. '.repeat(80) }],
            createdAt: new Date(),
        },
        {
            id: 'msg-4',
            role: 'assistant',
            content: [{ type: 'text', text: 'Final long message to ensure we see multiple page breaks. '.repeat(120) }],
            createdAt: new Date(),
        },
    ],
};

console.log('Starting PDF generation test...');
try {
    const pdfBuffer = generateChatPDF(testChat);
    console.log(`PDF generated successfully! Size: ${pdfBuffer.length} bytes`);
} catch (error) {
    console.error('Error generating PDF:', error);
}