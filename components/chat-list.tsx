"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent, FocusEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, PlusCircle, Trash2, CheckIcon, XIcon, Loader2, Pencil, Share2 } from "lucide-react";
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
                                                                <div className="flex items-center w-full min-w-0">
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
                                                                    <div className="ml-2 flex items-center gap-1 opacity-0 group-hover/menu-item:opacity-100 group-focus-within/menu-item:opacity-100 transition-opacity duration-150">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 hover:text-green-500"
                                                                            onClick={(e) => handleStartShare(chat.id, chat.title, e)}
                                                                            title="Share chat"
                                                                        >
                                                                            <Share2 className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 hover:text-blue-500"
                                                                            onClick={(e) => handleStartEdit(chat.id, chat.title, e)}
                                                                            title="Edit title"
                                                                        >
                                                                            <Pencil className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-6 w-6 hover:text-red-500"
                                                                            onClick={(e) => onDeleteChat(chat.id, e)}
                                                                            title="Delete chat"
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
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