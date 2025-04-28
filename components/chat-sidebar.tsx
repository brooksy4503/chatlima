"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, PlusCircle, Trash2, ServerIcon, Settings, Sparkles, ChevronsUpDown, Copy, Pencil, Github, Key, Bot, LogOut } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    useSidebar
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";
import { MCPServerManager } from "./mcp-server-manager";
import { ApiKeyManager } from "./api-key-manager";
import { ThemeToggle } from "./theme-toggle";
import { getUserId, updateUserId } from "@/lib/user-id";
import { useChats } from "@/lib/hooks/use-chats";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMCP } from "@/lib/context/mcp-context";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatePresence, motion } from "motion/react";
import { SignInButton } from "@/components/auth/SignInButton";
import { useSession, signOut } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";

const LOCAL_USER_ID_KEY = 'ai-chat-user-id';

export function ChatSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [userId, setUserId] = useState<string | null>(null);
    const [mcpSettingsOpen, setMcpSettingsOpen] = useState(false);
    const [apiKeySettingsOpen, setApiKeySettingsOpen] = useState(false);
    const { state, setOpen, openMobile, setOpenMobile } = useSidebar();
    const isCollapsed = state === "collapsed";
    const [editUserIdOpen, setEditUserIdOpen] = useState(false);
    const [newUserId, setNewUserId] = useState('');

    const { data: session, isPending: isSessionLoading } = useSession();
    const authenticatedUserId = session?.user?.id;
    const previousSessionRef = useRef(session);

    const queryClient = useQueryClient();

    const { mcpServers, setMcpServers, selectedMcpServers, setSelectedMcpServers } = useMCP();

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

    useEffect(() => {
        if (!isSessionLoading) {
            if (authenticatedUserId) {
                setUserId(authenticatedUserId);
            } else {
                setUserId(getUserId());
            }
        }
    }, [authenticatedUserId, isSessionLoading]);

    useEffect(() => {
        const currentSession = session;
        const previousSession = previousSessionRef.current;

        if (!previousSession?.user && currentSession?.user?.id) {
            const authenticatedUserId = currentSession.user.id;
            console.log('User logged in:', authenticatedUserId);
            
            const localUserId = localStorage.getItem(LOCAL_USER_ID_KEY);

            if (localUserId && localUserId !== authenticatedUserId) {
                console.log(`Found local user ID ${localUserId}, attempting migration...`);
                
                fetch('/api/chats/migrate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ localUserId }),
                })
                .then(async (res) => {
                    if (res.ok) {
                        const data = await res.json();
                        console.log(`Migration successful: Migrated ${data.migratedCount} chats.`);
                        localStorage.removeItem(LOCAL_USER_ID_KEY);
                    } else {
                        console.error('Chat migration failed:', res.status, await res.text());
                        toast.error("Failed to migrate local chats.");
                    }
                })
                .catch((error) => {
                    console.error('Error calling migration API:', error);
                    toast.error("Error migrating local chats.");
                })
                .finally(() => {
                    setUserId(authenticatedUserId);
                    queryClient.invalidateQueries({ queryKey: ['chats'] });
                    queryClient.invalidateQueries({ queryKey: ['chat'] }); 
                    console.log('Chat queries invalidated for new user ID.');
                });
            } else {
                setUserId(authenticatedUserId);
                queryClient.invalidateQueries({ queryKey: ['chats'] });
                queryClient.invalidateQueries({ queryKey: ['chat'] });
            }
        } else if (previousSession?.user && !currentSession?.user) {
            console.log('User logged out.');
            const localId = getUserId();
            setUserId(localId);
            router.push('/');
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
        }

        previousSessionRef.current = currentSession;
    }, [session, queryClient, router]);
    
    const { chats, isLoading: isChatsLoading, deleteChat, refreshChats } = useChats(userId ?? '');
    const isLoading = isSessionLoading || (userId === null) || isChatsLoading;

    const handleNewChat = () => {
        router.push('/');
        setOpenMobile(false);
    };

    const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        deleteChat(chatId);
        
        if (pathname === `/chat/${chatId}`) {
            router.push('/');
        }
    };

    const activeServersCount = selectedMcpServers.length;

    const handleUpdateUserId = () => {
        if (!newUserId.trim()) {
            toast.error("User ID cannot be empty");
            return;
        }
        if (authenticatedUserId) {
            toast.error("Cannot manually edit User ID while logged in.");
            setEditUserIdOpen(false);
            return;
        }

        updateUserId(newUserId.trim());
        setUserId(newUserId.trim());
        setEditUserIdOpen(false);
        toast.success("User ID updated successfully");
        
        queryClient.invalidateQueries({ queryKey: ['chats'] });
        queryClient.invalidateQueries({ queryKey: ['chat'] });
    };

    if (isLoading) {
        return (
            <Sidebar className="shadow-sm bg-background/80 dark:bg-background/40 backdrop-blur-md" collapsible="icon">
                <SidebarHeader className="p-4 border-b border-border/40">
                    <div className="flex items-center justify-start">
                        <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""}`}>
                            <div className={`relative rounded-full bg-primary/70 flex items-center justify-center ${isCollapsed ? "size-5 aspect-square" : "size-6"}`}>
                                <Bot className={`text-primary-foreground ${isCollapsed ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            </div>
                            {!isCollapsed && (
                                <div className="font-semibold text-lg text-foreground/90">Chatbot</div>
                            )}
                        </div>
                    </div>
                </SidebarHeader>
                
                <SidebarContent className="flex flex-col h-[calc(100vh-8rem)]">
                    <SidebarGroup className="flex-1 min-h-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isCollapsed ? "sr-only" : ""
                        )}>
                            Chats
                        </SidebarGroupLabel>
                        <SidebarGroupContent className={cn(
                            "overflow-y-auto pt-1",
                            isCollapsed ? "overflow-x-hidden overflow-y-hidden" : ""
                        )}>
                            <SidebarMenu>{renderChatSkeletons()}</SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    
                    <div className="relative my-0">
                        <div className="absolute inset-x-0">
                            <Separator className="w-full h-px bg-border/40" />
                        </div>
                    </div>
                    
                    <SidebarGroup className="flex-shrink-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 pt-0 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isCollapsed ? "sr-only" : ""
                        )}>
                            MCP Servers
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        onClick={() => setMcpSettingsOpen(true)}
                                        className={cn(
                                            "w-full flex items-center gap-2 transition-all",
                                            "hover:bg-secondary/50 active:bg-secondary/70"
                                        )}
                                        tooltip={isCollapsed ? "MCP Servers" : undefined}
                                    >
                                        <ServerIcon className={cn(
                                            "h-4 w-4 flex-shrink-0",
                                            activeServersCount > 0 ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        {!isCollapsed && (
                                            <span className="flex-grow text-sm text-foreground/80">MCP Servers</span>
                                        )}
                                        {activeServersCount > 0 && !isCollapsed ? (
                                            <Badge 
                                                variant="secondary" 
                                                className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/80"
                                            >
                                                {activeServersCount}
                                            </Badge>
                                        ) : activeServersCount > 0 && isCollapsed ? (
                                            <SidebarMenuBadge className="bg-secondary/80 text-secondary-foreground">
                                                {activeServersCount}
                                            </SidebarMenuBadge>
                                        ) : null}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                
                <SidebarFooter className="flex flex-col gap-2 p-3 border-t border-border/40">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </SidebarFooter>
            </Sidebar>
        );
    }

    const displayUserId = userId ?? '...';
    const isUserAuthenticated = !!authenticatedUserId;

    return (
        <>
            <Sidebar className="shadow-sm bg-background/80 dark:bg-background/40 backdrop-blur-md" collapsible="icon">
                <SidebarHeader className="p-4 border-b border-border/40">
                    <div className="flex items-center justify-start">
                        <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""}`}>
                            <div className={`relative rounded-full bg-primary/70 flex items-center justify-center ${isCollapsed ? "size-5 aspect-square" : "size-6"}`}>
                                <Bot className={`text-primary-foreground ${isCollapsed ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            </div>
                            {!isCollapsed && (
                                <div className="font-semibold text-lg text-foreground/90">Chatbot</div>
                            )}
                        </div>
                    </div>
                </SidebarHeader>
                
                <SidebarContent className="flex flex-col h-[calc(100vh-8rem)]">
                    <SidebarGroup className="flex-1 min-h-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isCollapsed ? "sr-only" : ""
                        )}>
                            Chats
                        </SidebarGroupLabel>
                        <SidebarGroupContent className={cn(
                            "overflow-y-auto pt-1",
                            isCollapsed ? "overflow-x-hidden overflow-y-hidden" : ""
                        )}>
                            <SidebarMenu>
                                {isLoading ? (
                                    renderChatSkeletons()
                                ) : chats.length === 0 ? (
                                    <div className={`flex items-center justify-center py-3 ${isCollapsed ? "" : "px-4"}`}>
                                        {isCollapsed ? (
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border/50 bg-background/50">
                                                <MessageSquare className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 w-full px-3 py-2 rounded-md border border-dashed border-border/50 bg-background/50">
                                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground font-normal">No conversations yet</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <AnimatePresence initial={false}>
                                        {chats.map((chat) => (
                                            <motion.div
                                                key={chat.id}
                                                initial={{ opacity: 0, height: 0, y: -10 }}
                                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <SidebarMenuItem>
                                                    <SidebarMenuButton 
                                                        asChild
                                                        tooltip={isCollapsed ? chat.title : undefined}
                                                        data-active={pathname === `/chat/${chat.id}`}
                                                        className={cn(
                                                            "transition-all hover:bg-primary/10 active:bg-primary/15",
                                                            pathname === `/chat/${chat.id}` ? "bg-secondary/60 hover:bg-secondary/60" : ""
                                                        )}
                                                    >
                                                        <Link
                                                            href={`/chat/${chat.id}`}
                                                            className="flex items-center justify-between w-full gap-1"
                                                            onClick={() => setOpenMobile(false)}
                                                        >
                                                            <div className="flex items-center min-w-0 overflow-hidden flex-1 pr-2">
                                                                <MessageSquare className={cn(
                                                                    "h-4 w-4 flex-shrink-0",
                                                                    pathname === `/chat/${chat.id}` ? "text-foreground" : "text-muted-foreground"
                                                                )} />
                                                                <span className={cn(
                                                                    "ml-2 truncate text-sm",
                                                                    pathname === `/chat/${chat.id}` ? "text-foreground font-medium" : "text-foreground/80"
                                                                )} title={chat.title}>
                                                                    {chat.title.length > 18 ? `${chat.title.slice(0, 18)}...` : chat.title}
                                                                </span>
                                                            </div>
                                                            {!isCollapsed && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
                                                                    onClick={(e) => handleDeleteChat(chat.id, e)}
                                                                    title="Delete chat"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    
                    <div className="relative my-0">
                        <div className="absolute inset-x-0">
                            <Separator className="w-full h-px bg-border/40" />
                        </div>
                    </div>
                    
                    <SidebarGroup className="flex-shrink-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 pt-0 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isCollapsed ? "sr-only" : ""
                        )}>
                            MCP Servers
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        onClick={() => setMcpSettingsOpen(true)}
                                        className={cn(
                                            "w-full flex items-center gap-2 transition-all",
                                            "hover:bg-secondary/50 active:bg-secondary/70"
                                        )}
                                        tooltip={isCollapsed ? "MCP Servers" : undefined}
                                    >
                                        <ServerIcon className={cn(
                                            "h-4 w-4 flex-shrink-0",
                                            activeServersCount > 0 ? "text-primary" : "text-muted-foreground"
                                        )} />
                                        {!isCollapsed && (
                                            <span className="flex-grow text-sm text-foreground/80">MCP Servers</span>
                                        )}
                                        {activeServersCount > 0 && !isCollapsed ? (
                                            <Badge 
                                                variant="secondary" 
                                                className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/80"
                                            >
                                                {activeServersCount}
                                            </Badge>
                                        ) : activeServersCount > 0 && isCollapsed ? (
                                            <SidebarMenuBadge className="bg-secondary/80 text-secondary-foreground">
                                                {activeServersCount}
                                            </SidebarMenuBadge>
                                        ) : null}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <div className="relative my-0">
                        <div className="absolute inset-x-0">
                            <Separator className="w-full h-px bg-border/40" />
                        </div>
                    </div>

                    <SidebarGroup className="flex-shrink-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 pt-2 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isCollapsed ? "sr-only" : ""
                        )}>
                            Settings
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                           <SidebarMenu>
                                <SidebarMenuItem>
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-2",
                                        isCollapsed ? "justify-center" : ""
                                    )}>
                                        <ThemeToggle className="h-4 w-4 p-0" />
                                        {!isCollapsed && <span className="text-sm text-foreground/80">Theme</span>}
                                    </div>
                                </SidebarMenuItem>
                           </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                
                <SidebarFooter className="flex flex-col gap-2 p-3 border-t border-border/40">
                    <SidebarMenu>
                        {/* Item removed */}
                    </SidebarMenu>
                    
                    <div className="relative my-0 pt-2">
                        <div className="absolute inset-x-0">
                            <Separator className="w-full h-px bg-border/40" />
                        </div>
                    </div>

                    {isSessionLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2 mt-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            {!isCollapsed && <Skeleton className="h-4 w-24" />}
                        </div>
                    ) : session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    className={cn(
                                        "flex items-center justify-start gap-2 px-3 py-2 mt-2 w-full h-auto focus-visible:ring-0",
                                        isCollapsed && "justify-center" 
                                    )}
                                >
                                    <Avatar className="h-8 w-8 rounded-full">
                                        <AvatarFallback>{session.user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {!isCollapsed && <span className="truncate">{session.user.name}</span>}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-[calc(var(--sidebar-width)-1.5rem)] ml-3 mb-1">
                                <DropdownMenuLabel className="truncate">{session.user.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-2 mt-2">
                            <SignInButton />
                        </div>
                    )}
                </SidebarFooter>
            </Sidebar>

            <MCPServerManager
                servers={mcpServers}
                onServersChange={setMcpServers}
                selectedServers={selectedMcpServers}
                onSelectedServersChange={setSelectedMcpServers}
                open={mcpSettingsOpen}
                onOpenChange={setMcpSettingsOpen}
            />

            <Dialog open={editUserIdOpen && !isUserAuthenticated} onOpenChange={(open) => {
                setEditUserIdOpen(open);
                if (open) {
                    setNewUserId(userId ?? '');
                }
            }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Edit User ID</DialogTitle>
                        <DialogDescription>
                            Update your user ID for chat synchronization. This will affect which chats are visible to you.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                value={newUserId}
                                onChange={(e) => setNewUserId(e.target.value)}
                                placeholder="Enter your user ID"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditUserIdOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateUserId}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}