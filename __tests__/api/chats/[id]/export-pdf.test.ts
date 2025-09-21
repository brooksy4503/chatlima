import { NextRequest } from 'next/server';
import { getChatById } from '@/lib/chat-store';
import { auth } from '@/lib/auth';
import { createPDF, addWrappedText, setTypography, addPageIfNeeded, addFooter, addHeaderBranding } from '@/lib/pdf-utils';

// Mock dependencies
jest.mock('@/lib/chat-store', () => ({
    getChatById: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: jest.fn(),
        },
    },
}));

jest.mock('@/lib/pdf-utils', () => ({
    createPDF: jest.fn(),
    addWrappedText: jest.fn(),
    setTypography: jest.fn(),
    addPageIfNeeded: jest.fn(),
    addFooter: jest.fn(),
    addHeaderBranding: jest.fn(),
}));

// Mock jsPDF
jest.mock('jspdf', () => {
    return jest.fn().mockImplementation(() => ({
        setFontSize: jest.fn(),
        setFont: jest.fn(),
        text: jest.fn(),
        splitTextToSize: jest.fn(),
        addPage: jest.fn(),
        output: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
    }));
});

// Import the route handler after mocking
import { GET } from '@/app/api/chats/[id]/export-pdf/route';

describe('/api/chats/[id]/export-pdf', () => {
    const mockGetChatById = getChatById as jest.MockedFunction<typeof getChatById>;
    const mockAuthGetSession = auth.api.getSession as jest.MockedFunction<typeof auth.api.getSession>;
    const mockCreatePDF = createPDF as jest.MockedFunction<typeof createPDF>;
    const mockAddWrappedText = addWrappedText as jest.MockedFunction<typeof addWrappedText>;
    const mockSetTypography = setTypography as jest.MockedFunction<typeof setTypography>;
    const mockAddPageIfNeeded = addPageIfNeeded as jest.MockedFunction<typeof addPageIfNeeded>;
    const mockAddFooter = addFooter as jest.MockedFunction<typeof addFooter>;
    const mockAddHeaderBranding = addHeaderBranding as jest.MockedFunction<typeof addHeaderBranding>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Authentication', () => {
        it('should return 401 when user is not authenticated', async () => {
            mockAuthGetSession.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Authentication required');
        });

        it('should return 401 when session has no user', async () => {
            mockAuthGetSession.mockResolvedValue({ user: null } as any);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Authentication required');
        });
    });

    describe('Chat Access', () => {
        beforeEach(() => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
        });

        it('should return 404 when chat is not found', async () => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            mockGetChatById.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data.error).toBe('Chat not found or access denied');
        });

        it('should return 404 when user does not own the chat', async () => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            mockGetChatById.mockResolvedValue(null); // Simulates access denied

            const request = new NextRequest('http://localhost:3000/api/chats/chat-456/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-456' }) });

            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data.error).toBe('Chat not found or access denied');
        });
    });

    describe('PDF Generation', () => {
        const mockChat = {
            id: 'chat-123',
            title: 'Test Chat',
            userId: 'user-123',
            createdAt: new Date('2024-01-01T10:00:00Z'),
            updatedAt: new Date('2024-01-01T10:00:00Z'),
            messages: [
                {
                    id: 'msg-1',
                    role: 'user',
                    content: [{ type: 'text', text: 'Hello, how are you?' }],
                    createdAt: new Date(),
                },
                {
                    id: 'msg-2',
                    role: 'assistant',
                    content: [{ type: 'text', text: 'I am doing well, thank you!' }],
                    createdAt: new Date(),
                },
            ],
        } as any;

        const mockDoc = {
            setFontSize: jest.fn(),
            setFont: jest.fn(),
            text: jest.fn(),
            splitTextToSize: jest.fn(),
            addPage: jest.fn(),
            output: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
        };

        const mockDoc2 = {
            setFontSize: jest.fn(),
            setFont: jest.fn(),
            text: jest.fn(),
            splitTextToSize: jest.fn(),
            addPage: jest.fn(),
            output: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
        };

        beforeEach(() => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            mockGetChatById.mockResolvedValue(mockChat);
            mockCreatePDF.mockReturnValue(mockDoc as any);
            mockAddWrappedText.mockReturnValue(50);
        });

        it('should successfully generate and return PDF for valid chat', async () => {
            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Type')).toBe('application/pdf');
            expect(response.headers.get('Content-Disposition')).toContain('attachment');
            expect(response.headers.get('Content-Disposition')).toContain('chat-Test_Chat-chat-123');
            expect(response.headers.get('Content-Length')).toBe('1024');
        });

        it('should call PDF utilities with correct parameters', async () => {
            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(mockCreatePDF).toHaveBeenCalledWith({ format: 'a4' });
            expect(mockSetTypography).toHaveBeenCalledWith(mockDoc, 12, 'helvetica');
        });

        it('should handle chat with no title', async () => {
            const chatWithoutTitle = { ...mockChat, title: null };
            mockGetChatById.mockResolvedValue(chatWithoutTitle);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Disposition')).toContain('chat-Untitled_Chat-chat-123');
        });

        it('should handle chat with empty messages array', async () => {
            const chatWithNoMessages = { ...mockChat, messages: [] };
            mockGetChatById.mockResolvedValue(chatWithNoMessages);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(200);
            expect(mockDoc.text).toHaveBeenCalledWith('No messages found in this chat.', 20, expect.any(Number));
        });

        it('should handle chat with null messages', async () => {
            const chatWithNullMessages = { ...mockChat, messages: null };
            mockGetChatById.mockResolvedValue(chatWithNullMessages);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(200);
            expect(mockDoc.text).toHaveBeenCalledWith('No messages found in this chat.', 20, expect.any(Number));
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
        });

        it('should return 500 when PDF generation fails', async () => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            const mockChat = {
                id: 'chat-123',
                title: 'Test Chat',
                userId: 'user-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: [],
            } as any;

            mockGetChatById.mockResolvedValue(mockChat);
            mockCreatePDF.mockImplementation(() => {
                throw new Error('PDF generation failed');
            });

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toBe('Failed to generate PDF');
        });

        it('should return 500 when getChatById throws error', async () => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            mockGetChatById.mockRejectedValue(new Error('Database error'));

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toBe('Internal server error');
        });

        it('should return 500 when auth.getSession throws error', async () => {
            mockAuthGetSession.mockRejectedValue(new Error('Auth error'));

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data.error).toBe('Internal server error');
        });

        it('should handle messages with empty content', async () => {
            const mockDoc3 = {
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                text: jest.fn(),
                splitTextToSize: jest.fn(),
                addPage: jest.fn(),
                output: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
            };

            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            const chatWithEmptyMessage = {
                messages: [
                    {
                        id: 'msg-1',
                        role: 'user',
                        content: [{ type: 'text', text: '' }],
                        createdAt: new Date(),
                    },
                ],
                id: 'chat-123',
                title: 'Test Chat',
                userId: 'user-123',
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any;

            mockGetChatById.mockResolvedValue(chatWithEmptyMessage);
            mockCreatePDF.mockReturnValue(mockDoc3 as any);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(200);
            expect(mockAddWrappedText).toHaveBeenCalledWith(
                mockDoc3,
                '[No text content]',
                30,
                expect.any(Number),
                150,
                6
            );
        });
    });

    describe('Message Processing', () => {
        const mockChat = {
            id: 'chat-123',
            title: 'Test Chat',
            userId: 'user-123',
            createdAt: new Date('2024-01-01T10:00:00Z'),
            updatedAt: new Date('2024-01-01T10:00:00Z'),
            messages: [
                {
                    id: 'msg-1',
                    role: 'user',
                    content: [{ type: 'text', text: 'User message' }],
                    createdAt: new Date(),
                },
                {
                    id: 'msg-2',
                    role: 'assistant',
                    content: [{ type: 'text', text: 'Assistant message' }],
                    createdAt: new Date(),
                },
            ],
        } as any;

        const mockDoc = {
            setFontSize: jest.fn(),
            setFont: jest.fn(),
            text: jest.fn(),
            splitTextToSize: jest.fn(),
            addPage: jest.fn(),
            output: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
        };

        beforeEach(() => {
            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            mockGetChatById.mockResolvedValue(mockChat);
            mockCreatePDF.mockReturnValue(mockDoc as any);
            mockAddWrappedText.mockReturnValue(50);
        });

        it('should format user messages correctly', async () => {
            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(mockDoc.setFont).toHaveBeenCalledWith('helvetica', 'bold');
            expect(mockDoc.text).toHaveBeenCalledWith('User:', 20, expect.any(Number));
            expect(mockDoc.setFont).toHaveBeenCalledWith('helvetica', 'normal');
        });

        it('should format assistant messages correctly', async () => {
            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(mockDoc.setFont).toHaveBeenCalledWith('helvetica', 'bold');
            expect(mockDoc.text).toHaveBeenCalledWith('Assistant:', 20, expect.any(Number));
            expect(mockDoc.setFont).toHaveBeenCalledWith('helvetica', 'normal');
        });

        it('should handle messages with empty content', async () => {
            const chatWithEmptyMessage = {
                ...mockChat,
                messages: [
                    {
                        id: 'msg-1',
                        role: 'user',
                        content: [{ type: 'text', text: '' }],
                        createdAt: new Date(),
                    },
                ],
            };

            mockGetChatById.mockResolvedValue(chatWithEmptyMessage);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(mockAddWrappedText).toHaveBeenCalledWith(
                mockDoc,
                '[No text content]',
                30,
                expect.any(Number),
                150,
                6
            );
        });
    });

    describe('Performance and Edge Cases', () => {
        it('should handle very long chat titles', async () => {
            const longTitle = 'A'.repeat(200);
            const mockChat = {
                id: 'chat-123',
                title: longTitle,
                userId: 'user-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: [],
            } as any;

            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            mockGetChatById.mockResolvedValue(mockChat);

            const mockDoc = {
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                text: jest.fn(),
                splitTextToSize: jest.fn(),
                addPage: jest.fn(),
                output: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
            };

            mockCreatePDF.mockReturnValue(mockDoc as any);
            mockAddWrappedText.mockReturnValue(50);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(200);
            // Should handle long titles without crashing
        });

        it('should handle special characters in chat titles', async () => {
            const specialTitle = 'Test: Chat@#$%^&*()';
            const mockChat = {
                id: 'chat-123',
                title: specialTitle,
                userId: 'user-123',
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: [],
            } as any;

            mockAuthGetSession.mockResolvedValue({
                user: {
                    id: 'user-123',
                    name: 'Test User',
                    email: 'user@example.com',
                    emailVerified: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    image: null,
                    isAnonymous: false
                }
            } as any);
            mockGetChatById.mockResolvedValue(mockChat);

            const mockDoc = {
                setFontSize: jest.fn(),
                setFont: jest.fn(),
                text: jest.fn(),
                splitTextToSize: jest.fn(),
                addPage: jest.fn(),
                output: jest.fn().mockReturnValue(new ArrayBuffer(1024)),
            };

            mockCreatePDF.mockReturnValue(mockDoc as any);
            mockAddWrappedText.mockReturnValue(50);

            const request = new NextRequest('http://localhost:3000/api/chats/chat-123/export-pdf');
            const response = await GET(request, { params: Promise.resolve({ id: 'chat-123' }) });

            expect(response.status).toBe(200);
            expect(response.headers.get('Content-Disposition')).toContain('Test__Chat________');
        });
    });
});