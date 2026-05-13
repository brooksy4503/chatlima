"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, MessageSquareText, PlugZap, Sparkles, X } from "lucide-react";
import { SuggestedPrompts } from "./suggested-prompts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLocalStorageItem, setLocalStorageItem } from "@/lib/browser-storage";
import { STORAGE_KEYS } from "@/lib/constants";

const ONBOARDING_STORAGE_KEY = "chatlimaOnboarding";

/** Same source as useLocalStorage(STORAGE_KEYS.SHOW_WELCOME_SCREEN); avoids hydration mismatch with props. */
function readShowWelcomePreferenceFromStorage(): boolean {
  const raw = getLocalStorageItem(STORAGE_KEYS.SHOW_WELCOME_SCREEN);
  if (raw === null) {
    return true;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "boolean" ? parsed : true;
  } catch {
    return true;
  }
}

type OnboardingAction = "api-keys" | "mcp-servers" | "start-chatting";

type OnboardingState = {
  dismissedWelcome?: boolean;
  clickedApiKeysSetup?: boolean;
  clickedMcpSetup?: boolean;
  sentFirstMessage?: boolean;
  selectedModel?: boolean;
};

interface ProjectOverviewProps {
  sendMessage?: (input: string) => void;
  selectedModel?: string;
  showWelcomeOnboarding?: boolean;
  onShowWelcomeOnboardingChange?: (value: boolean) => void;
  showSuggestedPrompts?: boolean;
}

function readOnboardingState(): OnboardingState {
  const raw = getLocalStorageItem(ONBOARDING_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return {};
  }
}

function writeOnboardingState(state: OnboardingState) {
  setLocalStorageItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
}

function dispatchOnboardingAction(action: OnboardingAction) {
  window.dispatchEvent(
    new CustomEvent("chatlima:onboarding-action", {
      detail: { action },
    })
  );
}

export const ProjectOverview = ({
  sendMessage,
  selectedModel,
  showWelcomeOnboarding = true,
  onShowWelcomeOnboardingChange,
  showSuggestedPrompts = true,
}: ProjectOverviewProps) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({});
  const [hasLoadedOnboardingState, setHasLoadedOnboardingState] = useState(false);
  const previousShowWelcomeOnboarding = useRef(showWelcomeOnboarding);

  useEffect(() => {
    let loaded = readOnboardingState();
    // Preference must drive visibility: if welcome is enabled in settings but onboarding
    // was previously dismissed, clear dismissal so toggles match the UI (and hydration
    // uses the same LS read as the parent hook).
    if (readShowWelcomePreferenceFromStorage() && loaded.dismissedWelcome) {
      loaded = { ...loaded, dismissedWelcome: false };
      writeOnboardingState(loaded);
    }
    setOnboardingState(loaded);
    setHasLoadedOnboardingState(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedOnboardingState || !selectedModel || onboardingState.selectedModel) {
      return;
    }

    const nextState = { ...onboardingState, selectedModel: true };
    setOnboardingState(nextState);
    writeOnboardingState(nextState);
  }, [hasLoadedOnboardingState, onboardingState, selectedModel]);

  useEffect(() => {
    const wasJustTurnedOn = !previousShowWelcomeOnboarding.current && showWelcomeOnboarding;
    previousShowWelcomeOnboarding.current = showWelcomeOnboarding;

    if (!hasLoadedOnboardingState || !wasJustTurnedOn || !onboardingState.dismissedWelcome) {
      return;
    }

    const nextState = { ...onboardingState, dismissedWelcome: false };
    setOnboardingState(nextState);
    writeOnboardingState(nextState);
  }, [hasLoadedOnboardingState, onboardingState, showWelcomeOnboarding]);

  const updateOnboardingState = (updates: OnboardingState) => {
    const nextState = { ...onboardingState, ...updates };
    setOnboardingState(nextState);
    writeOnboardingState(nextState);
  };

  const handleSetupAction = (action: OnboardingAction) => {
    if (action === "api-keys") {
      updateOnboardingState({ clickedApiKeysSetup: true });
    }

    if (action === "mcp-servers") {
      updateOnboardingState({ clickedMcpSetup: true });
    }

    if (action === "start-chatting") {
      updateOnboardingState({ sentFirstMessage: true });
    }

    dispatchOnboardingAction(action);
  };

  const hideSetup = () => {
    updateOnboardingState({ dismissedWelcome: true });
    onShowWelcomeOnboardingChange?.(false);
  };

  const showOnboardingCards = showWelcomeOnboarding && !onboardingState.dismissedWelcome;
  const shouldShowSuggestedPrompts = Boolean(sendMessage) && showSuggestedPrompts && !showOnboardingCards;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-4">
      {/* Welcome hero - clear value and one primary action */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Multi-model AI chat with tools, web search, and BYO keys
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Get started with ChatLima
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          {showOnboardingCards
            ? "Start with one of the three cards below, then type your own message when you’re ready."
            : "Ask anything. Pick a prompt idea below or type your own—your AI assistant is ready."}
        </p>
      </div>

      {showOnboardingCards && (
        <section aria-label="Getting started" className="w-full max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">Quick setup</h2>
              <p className="text-xs text-muted-foreground">
                Three small steps to unlock ChatLima’s power-user features.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={hideSetup} aria-label="Hide setup">
              <X className="h-4 w-4" />
              Hide setup
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Card className="bg-card/80">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                  </div>
                  {selectedModel && <Badge variant="secondary">Recommended model</Badge>}
                </div>
                <CardTitle className="text-base">Start chatting</CardTitle>
                <CardDescription>
                  Use the selected model or type your own message to see responses stream in real time.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleSetupAction("start-chatting")}
                >
                  Start a chat
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader className="p-4 pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <KeyRound className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Bring your own API key</CardTitle>
                <CardDescription>
                  Add provider keys to use your own accounts and bypass ChatLima credit checks where supported.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleSetupAction("api-keys")}
                >
                  Add API key
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80">
              <CardHeader className="p-4 pb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <PlugZap className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base">Connect tools</CardTitle>
                <CardDescription>
                  Connect MCP servers for files, APIs, databases, automations, and richer assistant workflows.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleSetupAction("mcp-servers")}
                >
                  Connect MCP server
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Suggested prompts */}
      {shouldShowSuggestedPrompts && sendMessage && (
        <div className="w-full max-w-4xl mx-auto">
          <SuggestedPrompts 
            sendMessage={sendMessage}
            selectedModel={selectedModel}
            maxSuggestions={4}
            showCategories={true}
          />
        </div>
      )}
    </div>
  );
};
