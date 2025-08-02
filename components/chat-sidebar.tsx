"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, PlusCircle, Trash2, ServerIcon, Settings, Sparkles, ChevronsUpDown, Copy, Github, Key, LogOut, Globe, BookOpen, Activity } from "lucide-react";
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
import { ProviderHealthDashboard } from "./provider-health-dashboard";
import { MiniChatTokenSummary } from "./token-metrics/ChatTokenSummary";
import { useQuery } from "@tanstack/react-query";
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
import { useAuth, signOut } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Sun } from "lucide-react";
import { useWebSearch } from "@/lib/context/web-search-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClientMount } from "@/lib/hooks/use-client-mount";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatList } from "./chat-list";

// Token Usage Summary component for the sidebar
function TokenUsageSummary({ userId }: { userId: string | null }) {
    const { data: tokenData, isLoading, error, refetch } = useQuery({
        queryKey: ['user-token-usage', userId],
        queryFn: async ({ queryKey }) => {
            const [_, userId] = queryKey;
            if (!userId) return null;
            
            try {
                const response = await fetch(`/api/token-usage?userId=${userId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to load token usage data');
                }
                
                const data = await response.json();
                return data.data;
            } catch (error) {
                console.error('Error loading user token usage:', error);
                throw error;
            }
        },
        enabled: !!userId,
        retry: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false
    });

    if (!userId) {
        return null;
    }

    return (
        <MiniChatTokenSummary
            totalInputTokens={tokenData?.totalInputTokens || 0}
            totalOutputTokens={tokenData?.totalOutputTokens || 0}
            totalTokens={tokenData?.totalTokens || 0}
            totalEstimatedCost={tokenData?.totalEstimatedCost || 0}
            totalActualCost={tokenData?.totalActualCost || 0}
            messageCount={tokenData?.messageCount || 0}
            currency={tokenData?.currency || 'USD'}
            isLoading={isLoading}
            error={error?.message || null}
        />
    );
}

export function ChatSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [userId, setUserId] = useState<string | null>(null);
    const [mcpSettingsOpen, setMcpSettingsOpen] = useState(false);
    const [apiKeySettingsOpen, setApiKeySettingsOpen] = useState(false);
    const [providerHealthOpen, setProviderHealthOpen] = useState(false);
    const isMounted = useClientMount();
    const { state, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed";
    // On mobile, always show expanded layout
    const isLayoutCollapsed = isCollapsed && !isMobile;

    const { session, isPending: isSessionLoading } = useAuth();
    const authenticatedUserId = session?.user?.id;
    const previousSessionRef = useRef(session);
    const invalidationRef = useRef(false);

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

        // Prevent multiple rapid invalidations
        if (invalidationRef.current) {
            previousSessionRef.current = currentSession;
            return;
        }

        if (!previousSession?.user && currentSession?.user?.id) {
            const authenticatedUserId = currentSession.user.id;
            console.log('User logged in (ID):', authenticatedUserId);
            // Log the entire user object for inspection
            console.log('Session User Object:', currentSession.user);
            
            setUserId(authenticatedUserId);
            
            // Debounce query invalidations to prevent cascade
            invalidationRef.current = true;
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['chats'] });
                queryClient.invalidateQueries({ queryKey: ['chat'] });
                invalidationRef.current = false;
            }, 100);
            
        } else if (previousSession?.user && !currentSession?.user) {
            console.log('User logged out.');
            setUserId(null);
            router.push('/');
            
            // Debounce query invalidations to prevent cascade
            invalidationRef.current = true;
            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['chats'] });
                queryClient.invalidateQueries({ queryKey: ['chat'] });
                invalidationRef.current = false;
            }, 100);
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


    const { chats, isLoading: isChatsLoading, deleteChat, refreshChats, updateChatTitle, isUpdatingChatTitle, loadMoreChats, hasMoreChats, isLoadingMore } = useChats();
    const isLoading = !isMounted || isSessionLoading || isChatsLoading;

    const handleNewChat = () => {
        // Close mobile sidebar when navigating to new chat
        if (openMobile) {
            setOpenMobile(false);
        }
        
        // Use window.location for more reliable navigation
        window.location.href = '/';
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
            window.location.href = '/';
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
                        <SidebarGroupContent className="pt-2">
                           <SidebarMenu>
                                <SidebarMenuItem>
                                    <div className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 rounded-md"
                                    )}>
                                        <Skeleton className="h-4 w-4 rounded-md flex-shrink-0" />
                                        {!isLayoutCollapsed && (
                                            <>
                                                <Skeleton className="h-4 flex-grow max-w-[80px]" />
                                                <Skeleton className="h-3 w-3 rounded-md ml-auto" />
                                            </>
                                        )}
                                    </div>
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
                            onLoadMoreChats={loadMoreChats}
                            hasMoreChats={hasMoreChats}
                            isLoadingMore={isLoadingMore}
                        />
                    </SidebarGroup>
                    
                    {/* Token Usage Summary - only show when not collapsed */}
                    {!isLayoutCollapsed && (
                        <div className="px-3 py-2">
                            <TokenUsageSummary userId={userId} />
                        </div>
                    )}
                    
                    <div className="relative my-0">
                        <div className="absolute inset-x-0">
                            <Separator className="w-full h-px bg-border/40" />
                        </div>
                    </div>

                    <SidebarGroup className="flex-shrink-0">
                        <SidebarGroupContent className="pt-2">
                           <SidebarMenu>
                                <SidebarMenuItem>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuButton
                                                className="w-full flex items-center gap-2 transition-all"
                                                tooltip={isCollapsed ? "Settings" : undefined}
                                            >
                                                <Settings className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                                {!isCollapsed && (
                                                    <>
                                                        <span className="flex-grow text-sm text-foreground/80 text-left">Settings</span>
                                                        <ChevronsUpDown className="h-3 w-3 text-muted-foreground ml-auto" />
                                                    </>
                                                )}
                                            </SidebarMenuButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                            align="end" 
                                            side={isCollapsed ? "right" : "bottom"} 
                                            sideOffset={8} 
                                            className="min-w-[200px]"
                                        >
                                            <DropdownMenuItem onClick={() => setMcpSettingsOpen(true)}>
                                                <ServerIcon className={cn(
                                                    "h-4 w-4 mr-2",
                                                    activeServersCount > 0 ? "text-primary" : "text-muted-foreground"
                                                )} />
                                                MCP Servers
                                                {activeServersCount > 0 && (
                                                    <Badge 
                                                        variant="secondary" 
                                                        className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-secondary/80"
                                                    >
                                                        {activeServersCount}
                                                    </Badge>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setApiKeySettingsOpen(true)}>
                                                <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                                                API Keys
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setProviderHealthOpen(true)}>
                                                <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                                                Provider Health
                                            </DropdownMenuItem>
                                            {isMounted && webSearchEnabled && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-xs">Web Search</DropdownMenuLabel>
                                                    <DropdownMenuItem 
                                                        onClick={() => setWebSearchContextSize('low')}
                                                        className={cn(webSearchContextSize === 'low' && "bg-secondary")}
                                                    >
                                                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Context: Low
                                                        {webSearchContextSize === 'low' && <span className="ml-auto text-xs">✓</span>}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setWebSearchContextSize('medium')}
                                                        className={cn(webSearchContextSize === 'medium' && "bg-secondary")}
                                                    >
                                                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Context: Medium
                                                        {webSearchContextSize === 'medium' && <span className="ml-auto text-xs">✓</span>}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setWebSearchContextSize('high')}
                                                        className={cn(webSearchContextSize === 'high' && "bg-secondary")}
                                                    >
                                                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        Context: High
                                                        {webSearchContextSize === 'high' && <span className="ml-auto text-xs">✓</span>}
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
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

                        <ThemeToggle
                            className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 hover:text-muted-foreground transition-colors rounded-md hover:bg-secondary/50"
                            showLabel={false}
                        />
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

            <Dialog open={providerHealthOpen} onOpenChange={setProviderHealthOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-xl lg:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                            Provider Health Dashboard
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Monitor the status and availability of AI model providers
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto">
                        <ProviderHealthDashboard dialogMode={true} compact={false} showRefreshButton={true} />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}