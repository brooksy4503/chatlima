"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent, FocusEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, PlusCircle, Trash2, CheckIcon, XIcon, Loader2, Pencil, Share2, Download, MoreVertical } from "lucide-react";
import {
    SidebarGroupContent,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarMenu } from "@/components/ui/sidebar";
import { ChatShareDialog } from "@/components/chat-share-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Chat {
    id: string;
    title: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    shareId?: string | null;
    sharePath?: string | null;
}

interface ChatListProps {
    chats: Chat[];
    isLoading: boolean;
    isCollapsed: boolean;
    isUpdatingChatTitle: boolean;
    userId?: string | null;
    onNewChat: () => void;
    onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
    onUpdateChatTitle: (params: { chatId: string, title: string }, options: { onSuccess: () => void, onError: () => void }) => void;
    onNavigateToChat?: (chatId: string) => void;
    onLoadMoreChats?: () => void;
    hasMoreChats?: boolean;
    isLoadingMore?: boolean;
}

export function ChatList({
    chats,
    isLoading,
    isCollapsed,
    isUpdatingChatTitle,
    userId,
    onNewChat,
    onDeleteChat,
    onUpdateChatTitle,
    onNavigateToChat,
    onLoadMoreChats,
    hasMoreChats = false,
    isLoadingMore = false,
}: ChatListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState("");
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [editingChatTitle, setEditingChatTitle] = useState<string>("");
    const [sharingChatId, setSharingChatId] = useState<string | null>(null);
    const [sharingChatTitle, setSharingChatTitle] = useState<string>("");
    const [downloadingChatId, setDownloadingChatId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredChats = chats?.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleStartEdit = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setEditingChatId(chatId);
        setEditingChatTitle(currentTitle);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };

    const handleCancelEdit = () => {
        setEditingChatId(null);
        setEditingChatTitle("");
    };

    const handleStartShare = (chatId: string, chatTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setSharingChatId(chatId);
        setSharingChatTitle(chatTitle);
    };

    const handleCloseShare = () => {
        setSharingChatId(null);
        setSharingChatTitle("");
    };

    const handleDownloadPDF = async (chatId: string, chatTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setDownloadingChatId(chatId);

        try {
            const response = await fetch(`/api/chats/${chatId}/export-pdf`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to export PDF (${response.status})`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element to trigger download
            const link = document.createElement('a');
            link.href = url;
            const sanitizedTitle = chatTitle
                .replace(/[^a-zA-Z0-9\s\-_]/g, '_') // Replace special chars with underscores
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .substring(0, 50) // Limit length
                .toLowerCase();
            link.download = `chat-${sanitizedTitle}-${chatId.slice(0, 8)}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL object
            window.URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to download PDF');
        } finally {
            setDownloadingChatId(null);
        }
    };

    const handleSaveEdit = () => {
        if (!editingChatId || editingChatTitle.trim() === "") {
            toast.error("Chat title cannot be empty.");
            inputRef.current?.focus();
            return;
        }

        onUpdateChatTitle(
            { chatId: editingChatId, title: editingChatTitle.trim() },
            {
                onSuccess: () => {
                    setEditingChatId(null);
                    setEditingChatTitle("");
                },
                onError: () => {
                    inputRef.current?.focus();
                    inputRef.current?.select();
                }
            }
        );
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEditingChatTitle(e.target.value);
    };

    const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEdit();
        }
    };

    const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (e.relatedTarget && (e.relatedTarget.id === `save-chat-${editingChatId}` || e.relatedTarget.id === `cancel-chat-${editingChatId}`)) {
            return;
        }
        setTimeout(() => {
            if (editingChatId && document.activeElement !== inputRef.current) {
                const activeElementId = document.activeElement?.id;
                if (activeElementId !== `save-chat-${editingChatId}` && activeElementId !== `cancel-chat-${editingChatId}`) {
                    handleCancelEdit();
                }
            }
        }, 100);
    };

    const renderChatSkeletons = () => {
        return Array(3).fill(0).map((_, index) => (
            <SidebarMenuItem key={`skeleton-${index}`}>
                <div className={`flex items-center gap-2 px-3 py-2 ${isCollapsed ? "justify-center" : ""}`}>
                    <Skeleton className="h-4 w-4 rounded-full" />
                    {!isCollapsed && (
                        <>
                            <Skeleton className="h-4 w-full max-w-[180px]" />
                            <Skeleton className="h-5 w-5 ml-auto rounded-md flex-shrink-0" />
                        </>
                    )}
                </div>
            </SidebarMenuItem>
        ));
    };

    return (
        <>
            {!isCollapsed && (
                <div className="px-3 pt-1 pb-2 border-b border-border/40">
                    <Button
                        variant="outline"
                        className="w-full mb-2"
                        onClick={onNewChat}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Chat
                    </Button>
                    <Input
                        type="search"
                        placeholder="Search chats..."
                        aria-label="Search chats by title"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
            )}
            <SidebarGroupContent className={cn(
                "overflow-y-auto",
                isCollapsed ? "overflow-x-hidden overflow-y-hidden" : ""
            )}>
                {isLoading ? (
                    renderChatSkeletons()
                ) : filteredChats && filteredChats.length > 0 ? (
                    <AnimatePresence initial={false}>
                        {filteredChats.map((chat) => {
                            const isActive = pathname === `/chat/${chat.id}`;
                            const isEditingThisChat = editingChatId === chat.id;
                            return (
                                <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden list-none"
                                >
                                    <SidebarMenuItem>
                                        {isEditingThisChat ? (
                                            <div className="flex items-center gap-2 px-3 py-2 w-full">
                                                <Input
                                                    ref={inputRef}
                                                    value={editingChatTitle}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleInputKeyDown}
                                                    onBlur={handleInputBlur}
                                                    className="h-7 flex-grow px-1 text-sm"
                                                    maxLength={100}
                                                />
                                                <Button
                                                    id={`save-chat-${chat.id}`}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-green-500 hover:text-green-600"
                                                    onClick={handleSaveEdit}
                                                    disabled={isUpdatingChatTitle}
                                                >
                                                    {isUpdatingChatTitle && editingChatId === chat.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckIcon className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    id={`cancel-chat-${chat.id}`}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-red-500 hover:text-red-600"
                                                    onClick={handleCancelEdit}
                                                    disabled={isUpdatingChatTitle}
                                                >
                                                    <XIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                {isCollapsed ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <SidebarMenuButton
                                                                onClick={() => {
                                                                    router.push(`/chat/${chat.id}`);
                                                                    onNavigateToChat?.(chat.id);
                                                                }}
                                                                isActive={isActive}
                                                                className={cn(
                                                                    "w-full flex justify-center",
                                                                    isActive && "bg-primary/10 dark:bg-primary/20 text-primary hover:text-primary"
                                                                )}
                                                            >
                                                                <MessageSquare className="h-4 w-4" />
                                                            </SidebarMenuButton>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" sideOffset={5}>
                                                            <p>
                                                                {chat.title}
                                                                {chat.sharePath && (
                                                                    <span className="ml-2 text-muted-foreground">• Shared</span>
                                                                )}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <SidebarMenuButton
                                                                asChild
                                                                isActive={isActive}
                                                                className={cn(
                                                                    "w-full flex items-center gap-2",
                                                                    isActive && "bg-primary/10 dark:bg-primary/20 text-primary hover:text-primary"
                                                                )}
                                                            >
                                                                <div className="relative flex items-center w-full min-w-0 pr-8" data-testid="chat-row">
                                                                    <Link
                                                                        href={`/chat/${chat.id}`}
                                                                        className="flex items-center min-w-0 flex-1 gap-2"
                                                                        onClick={() => onNavigateToChat?.(chat.id)}
                                                                    >
                                                                        <span className="min-w-0 flex-1 truncate">
                                                                            {chat.title || `Chat ${chat.id.substring(0, 8)}...`}
                                                                        </span>
                                                                        {chat.sharePath && (
                                                                            <Share2 className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />
                                                                        )}
                                                                    </Link>
                                                                    <div
                                                                        data-testid="chat-actions"
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-100 lg:opacity-0 lg:group-hover/menu-item:opacity-100 lg:group-focus-within/menu-item:opacity-100 transition-opacity duration-150">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-6 w-6 hover:text-foreground"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                    aria-label="Chat options"
                                                                                    title="Chat options"
                                                                                >
                                                                                    <MoreVertical className="h-4 w-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end" className="w-48">
                                                                                {userId === chat.userId && (
                                                                                    <>
                                                                                        <DropdownMenuItem
                                                                                            onClick={(e) => handleDownloadPDF(chat.id, chat.title, e)}
                                                                                            disabled={downloadingChatId === chat.id}
                                                                                        >
                                                                                            {downloadingChatId === chat.id ? (
                                                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                                            ) : (
                                                                                                <Download className="h-4 w-4 mr-2" />
                                                                                            )}
                                                                                            Download as PDF
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuSeparator />
                                                                                    </>
                                                                                )}
                                                                                <DropdownMenuItem
                                                                                    onClick={(e) => handleStartShare(chat.id, chat.title, e)}
                                                                                >
                                                                                    <Share2 className="h-4 w-4 mr-2" />
                                                                                    Share chat
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem
                                                                                    onClick={(e) => handleStartEdit(chat.id, chat.title, e)}
                                                                                >
                                                                                    <Pencil className="h-4 w-4 mr-2" />
                                                                                    Edit title
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem
                                                                                    onClick={(e) => onDeleteChat(chat.id, e)}
                                                                                    className="text-red-500 focus:text-red-600"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                                    Delete chat
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </div>
                                                                </div>
                                                            </SidebarMenuButton>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" sideOffset={5}>
                                                            <p>
                                                                {chat.title}
                                                                {chat.sharePath && (
                                                                    <span className="ml-2 text-muted-foreground">• Shared</span>
                                                                )}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {!isCollapsed && null}
                                            </>
                                        )}
                                    </SidebarMenuItem>
                                </motion.div>
                            );
                        })}
                        
                        {/* Load More Button */}
                        {!searchTerm && hasMoreChats && onLoadMoreChats && !isCollapsed && (
                            <SidebarMenuItem className="mt-2 list-none">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                                    onClick={onLoadMoreChats}
                                    disabled={isLoadingMore}
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading more chats...
                                        </>
                                    ) : (
                                        <>
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Load more chats
                                        </>
                                    )}
                                </Button>
                            </SidebarMenuItem>
                        )}
                    </AnimatePresence>
                ) : (
                    <SidebarMenu>
                        {searchTerm ? (
                            <SidebarMenuItem className="text-sm text-muted-foreground px-3 py-2 list-none">
                                {!isCollapsed && "No results found."}
                            </SidebarMenuItem>
                        ) : (
                            <SidebarMenuItem className="text-sm text-muted-foreground px-3 py-2 list-none">
                                {!isCollapsed && "No chats yet. Start a new one!"}
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                )}
            </SidebarGroupContent>
            
            {/* Share Dialog */}
            {sharingChatId && (
                <ChatShareDialog
                    isOpen={!!sharingChatId}
                    onOpenChange={(open) => {
                        if (!open) {
                            handleCloseShare();
                        }
                    }}
                    chatId={sharingChatId}
                    chatTitle={sharingChatTitle}
                />
            )}
        </>
    );
} 