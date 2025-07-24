"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, PlusCircle, Trash2, ServerIcon, Settings, Sparkles, ChevronsUpDown, Copy, Github, Key, LogOut, Globe, BookOpen } from "lucide-react";
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
import { SignInButton } from "@/components/auth/SignInButton";
import { UserAccountMenu } from "@/components/auth/UserAccountMenu";
import { useSession, signOut } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Sun } from "lucide-react";
import { useWebSearch } from "@/lib/context/web-search-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatList } from "./chat-list";

export function ChatSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [userId, setUserId] = useState<string | null>(null);
    const [mcpSettingsOpen, setMcpSettingsOpen] = useState(false);
    const [apiKeySettingsOpen, setApiKeySettingsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { state, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed";
    // On mobile, always show expanded layout
    const isLayoutCollapsed = isCollapsed && !isMobile;

    const { data: session, isPending: isSessionLoading } = useSession();
    const authenticatedUserId = session?.user?.id;
    const previousSessionRef = useRef(session);

    const queryClient = useQueryClient();

    const { mcpServers, setMcpServers, selectedMcpServers, setSelectedMcpServers } = useMCP();
    const { webSearchContextSize, setWebSearchContextSize, webSearchEnabled } = useWebSearch();
    const isAnyOpenRouterModelSelected = true;

    const renderChatSkeletons = () => {
        return Array(3).fill(0).map((_, index) => (
            <SidebarMenuItem key={`skeleton-${index}`} className="px-0">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 w-full",
                    isCollapsed ? "justify-center" : "pr-10"
                )}>
                    <Skeleton className="h-4 w-4 rounded-md flex-shrink-0" />
                    {!isCollapsed && (
                        <>
                            <Skeleton className="h-4 flex-grow max-w-[160px]" />
                            <div className="ml-auto flex items-center gap-1">
                                <Skeleton className="h-4 w-4 rounded-md" />
                                <Skeleton className="h-4 w-4 rounded-md" />
                            </div>
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
                setUserId(null);
            }
        }
    }, [authenticatedUserId, isSessionLoading]);

    useEffect(() => {
        const currentSession = session;
        const previousSession = previousSessionRef.current;

        if (!previousSession?.user && currentSession?.user?.id) {
            const authenticatedUserId = currentSession.user.id;
            console.log('User logged in (ID):', authenticatedUserId);
            // Log the entire user object for inspection
            console.log('Session User Object:', currentSession.user);
            
            setUserId(authenticatedUserId);
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
        } else if (previousSession?.user && !currentSession?.user) {
            console.log('User logged out.');
            setUserId(null);
            router.push('/');
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            queryClient.invalidateQueries({ queryKey: ['chat'] });
        }

        previousSessionRef.current = currentSession;
    }, [session, queryClient, router]);
    
    useEffect(() => {
        // Log anonymous user ID and email for debugging purposes if the user is flagged as anonymous.
        if (!isSessionLoading && session?.user?.isAnonymous === true) {
            // This log will only appear in the developer console.
            //console.log('Anonymous User (for debugging): ID=', session.user.id, ', Email=', session.user.email);
        }
    }, [session, isSessionLoading]);

    // Fix hydration error by ensuring consistent initial state
    useEffect(() => {
        setMounted(true);
    }, []);

    const { chats, isLoading: isChatsLoading, deleteChat, refreshChats, updateChatTitle, isUpdatingChatTitle } = useChats();
    const isLoading = !mounted || isSessionLoading || isChatsLoading;

    const handleNewChat = () => {
        // Invalidate chat queries to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['chat'] });
        
        router.push('/');
        // Close mobile sidebar when navigating to new chat
        if (openMobile) {
            setOpenMobile(false);
        }
    };

    const handleNavigateToChat = (chatId: string) => {
        // Close mobile sidebar when navigating to a chat
        if (openMobile) {
            setOpenMobile(false);
        }
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

    if (isLoading) {
        return (
            <>
                <Sidebar className="shadow-sm bg-background/80 dark:bg-background/40 backdrop-blur-md" collapsible="icon">
                    <SidebarHeader className="p-4 border-b border-border/40 h-[72px]">
                        <div className="flex items-center justify-between">
                            <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isLayoutCollapsed ? "justify-center w-full" : ""}`}>
                                <div className={`flex items-center justify-center rounded-full bg-primary ${isLayoutCollapsed ? 'h-6 w-6 flex-shrink-0' : 'h-8 w-8'}`}>
                                    <Image src="/logo.png" alt="ChatLima logo" width={32} height={32} className={`${isLayoutCollapsed ? 'h-4 w-4' : 'h-6 w-6'}`} />
                                </div>
                                {!isLayoutCollapsed && (
                                    <div className="font-semibold text-lg text-foreground/90">ChatLima</div>
                                )}
                            </Link>
                        </div>
                    </SidebarHeader>
                
                <SidebarContent className="flex flex-col h-[calc(100vh-8rem)]">
                    <SidebarGroup className="flex-1 min-h-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isLayoutCollapsed ? "sr-only" : ""
                        )}>
                            Chats
                        </SidebarGroupLabel>
                        {!isLayoutCollapsed && (
                            <div className="px-3 pt-1 pb-2 border-b border-border/40">
                                <Skeleton className="h-9 w-full mb-2" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        )}
                        <SidebarGroupContent className={cn(
                            "overflow-y-auto pt-1",
                            isLayoutCollapsed ? "overflow-x-hidden overflow-y-hidden" : ""
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
                            isLayoutCollapsed ? "sr-only" : ""
                        )}>
                            MCP Servers
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        onClick={() => setMcpSettingsOpen(true)}
                                        className={cn(
                                            "w-full flex items-center gap-2 transition-all"
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
                    
                    <div className={cn(
                        "flex items-center justify-center py-2",
                        isLayoutCollapsed ? "flex-col gap-2" : "gap-3"
                    )}>
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                </SidebarFooter>
            </Sidebar>
            </>
        );
    }

    const displayUserId = userId ?? '...';
    const isUserAuthenticated = !!authenticatedUserId;

    return (
        <>
            <Sidebar className="shadow-sm bg-background/80 dark:bg-background/40 backdrop-blur-md" collapsible="icon">
                <SidebarHeader className="p-4 border-b border-border/40 h-[72px]">
                    <div className="flex items-center justify-between">
                        <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${isLayoutCollapsed ? "justify-center w-full" : ""}`}>
                            <div className={`flex items-center justify-center rounded-full bg-primary ${isLayoutCollapsed ? 'h-6 w-6 flex-shrink-0' : 'h-8 w-8'}`}>
                                <Image src="/logo.png" alt="ChatLima logo" width={32} height={32} className={`${isLayoutCollapsed ? 'h-4 w-4' : 'h-6 w-6'}`} />
                            </div>
                            {!isLayoutCollapsed && (
                                <div className="font-semibold text-lg text-foreground/90">ChatLima</div>
                            )}
                        </Link>

                    </div>
                </SidebarHeader>
                
                <SidebarContent className="flex flex-col h-[calc(100vh-8rem)]">
                    <SidebarGroup className="flex-1 min-h-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isLayoutCollapsed ? "sr-only" : ""
                        )}>
                            Chats
                        </SidebarGroupLabel>
                        <ChatList
                            chats={chats ?? []}
                            isLoading={isChatsLoading} 
                            isCollapsed={isLayoutCollapsed}
                            isUpdatingChatTitle={isUpdatingChatTitle}
                            onNewChat={handleNewChat}
                            onDeleteChat={handleDeleteChat}
                            onUpdateChatTitle={updateChatTitle}
                            onNavigateToChat={handleNavigateToChat}
                        />
                    </SidebarGroup>
                    
                    <div className="relative my-0">
                        <div className="absolute inset-x-0">
                            <Separator className="w-full h-px bg-border/40" />
                        </div>
                    </div>

                    <SidebarGroup className="flex-shrink-0">
                        <SidebarGroupLabel className={cn(
                            "px-4 pt-2 text-xs font-medium text-muted-foreground/80 uppercase tracking-wider",
                            isLayoutCollapsed ? "sr-only" : ""
                        )}>
                            Settings
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                           <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        onClick={() => setMcpSettingsOpen(true)}
                                        className={cn(
                                            "w-full flex items-center gap-2 transition-all"
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
                                <SidebarMenuItem>
                                    <SidebarMenuButton 
                                        onClick={() => setApiKeySettingsOpen(true)}
                                        className={cn(
                                            "w-full flex items-center gap-2 transition-all"
                                        )}
                                        tooltip={isCollapsed ? "API Keys" : undefined}
                                    >
                                        <Key className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                        {!isCollapsed && (
                                            <span className="flex-grow text-sm text-foreground/80 text-left">API Keys</span>
                                        )}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <ThemeToggle
                                            className={cn(
                                                "w-full flex items-center gap-2 transition-all text-sm text-foreground/80",
                                                isCollapsed ? "justify-center" : "justify-start"
                                            )}
                                            showLabel={!isCollapsed}
                                            labelText={<span className="flex-grow text-left">Theme</span>}
                                        />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {webSearchEnabled && (
                                    <SidebarMenuItem>
                                        <DropdownMenu>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <DropdownMenuTrigger asChild>
                                                        <TooltipTrigger asChild>
                                                            <SidebarMenuButton
                                                                className={cn(
                                                                    "w-full flex items-center gap-2 transition-all",
                                                                    "hover:bg-secondary/50 active:bg-secondary/70",
                                                                    isCollapsed ? "justify-center" : ""
                                                                )}
                                                            >
                                                                <Globe className={cn(
                                                                    "h-4 w-4 flex-shrink-0",
                                                                    webSearchEnabled ? "text-primary" : "text-muted-foreground"
                                                                )} />
                                                                {!isCollapsed && (
                                                                    <span className="text-sm text-foreground/80 flex-grow text-left">
                                                                        Search Context ({webSearchContextSize.charAt(0).toUpperCase() + webSearchContextSize.slice(1)}) 
                                                                    </span>
                                                                )}
                                                            </SidebarMenuButton>
                                                        </TooltipTrigger>
                                                    </DropdownMenuTrigger>
                                                    {isCollapsed && (
                                                        <TooltipContent side="right" sideOffset={5}>
                                                            Web Search Context: {webSearchContextSize.charAt(0).toUpperCase() + webSearchContextSize.slice(1)}
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </TooltipProvider>
                                            <DropdownMenuContent 
                                                align="end" 
                                                side={isCollapsed ? "right" : "bottom"} 
                                                sideOffset={8} 
                                                className="min-w-[120px]"
                                            >
                                                <DropdownMenuLabel>Search Context Size</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => setWebSearchContextSize('low')}
                                                    className={cn(webSearchContextSize === 'low' && "bg-secondary")}
                                                >
                                                    Low
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => setWebSearchContextSize('medium')}
                                                    className={cn(webSearchContextSize === 'medium' && "bg-secondary")}
                                                >
                                                    Medium
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => setWebSearchContextSize('high')}
                                                    className={cn(webSearchContextSize === 'high' && "bg-secondary")}
                                                >
                                                    High
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuItem>
                                )}
                           </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                
                <SidebarFooter className="flex flex-col gap-2 p-3 border-t border-border/40">
                    

                    {isSessionLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2 mt-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            {!isLayoutCollapsed && <Skeleton className="h-4 w-24" />}
                        </div>
                    ) : session?.user?.isAnonymous === true ? (
                        <div className={cn(
                            "flex items-center mt-2", 
                            isLayoutCollapsed ? "justify-center px-1 py-2" : "px-3 py-2 gap-2" 
                        )}>
                            <SignInButton isCollapsed={isLayoutCollapsed} />
                        </div>
                    ) : (
                        <div className={cn(
                            "flex items-center mt-2", 
                            isLayoutCollapsed ? "justify-center px-1 py-2" : "px-3 py-2" 
                        )}>
                            <UserAccountMenu />
                        </div>
                    )}

                    <div className={cn(
                        "flex items-center justify-center py-2",
                        isLayoutCollapsed ? "flex-col gap-2" : "gap-3"
                    )}>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="https://chatlima-docs.netlify.app/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-8 h-8 text-muted-foreground/70 hover:text-muted-foreground transition-colors rounded-md hover:bg-secondary/50"
                                    >
                                        <BookOpen className="h-4 w-4" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={5}>
                                    Documentation
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link 
                                        href="https://github.com/brooksy4503/chatlima" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-8 h-8 text-muted-foreground/70 hover:text-muted-foreground transition-colors rounded-md hover:bg-secondary/50"
                                    >
                                        <Github className="h-4 w-4" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={5}>
                                    ChatLima on GitHub
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>


                    </div>
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

            <ApiKeyManager
                open={apiKeySettingsOpen}
                onOpenChange={setApiKeySettingsOpen}
            />
        </>
    );
}