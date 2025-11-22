"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface UpgradeButtonProps {
  isCollapsed?: boolean;
}

export function UpgradeButton({ isCollapsed }: UpgradeButtonProps) {
  const router = useRouter();
  const { usageData, user, isLoading } = useAuth();
  
  const handleUpgrade = () => {
    router.push('/upgrade');
  };

  // Get remaining messages (for anonymous users, this is typically 10)
  // Default to 10 for anonymous users if data isn't loaded yet
  const remaining = usageData?.remaining ?? user?.messageRemaining ?? 10;
  const limit = usageData?.limit ?? user?.messageLimit ?? 10;
  const used = Math.max(0, limit - remaining);
  
  // DEBUG: Log usage data to console
  if (typeof window !== 'undefined') {
    console.log('[UpgradeButton DEBUG]', {
      usageData,
      user: {
        messageRemaining: user?.messageRemaining,
        messageLimit: user?.messageLimit,
        isAnonymous: user?.isAnonymous
      },
      calculated: {
        remaining,
        limit,
        used,
        usagePercentage: limit > 0 ? (used / limit) * 100 : 0
      }
    });
  }
  
  // Determine messaging based on usage percentage (works for both anonymous and Google users)
  // Low: < 30% of limit, Medium: 30-70% of limit, High: > 70% of limit
  const usagePercentage = limit > 0 ? (used / limit) * 100 : 0;
  const isLowUsage = usagePercentage < 30; // Used less than 30% of limit
  const isMediumUsage = usagePercentage >= 30 && usagePercentage <= 70; // Used 30-70% of limit
  const isHighUsage = usagePercentage > 70; // Used more than 70% of limit

  // Dynamic copy based on usage
  const getButtonText = () => {
    if (isCollapsed) {
      return "Upgrade";
    }
    
    if (isHighUsage && remaining > 0) {
      return `Only ${remaining} left - Upgrade`;
    } else if (isHighUsage && remaining === 0) {
      return "Upgrade for unlimited";
    } else if (isMediumUsage) {
      return `Unlimited for $10/year`;
    } else {
      return `Upgrade - $10/year`;
    }
  };

  const getTooltipText = () => {
    if (isHighUsage && remaining > 0) {
      return `Only ${remaining} message${remaining === 1 ? '' : 's'} remaining. Upgrade to unlimited for $10/year`;
    } else if (isHighUsage && remaining === 0) {
      return "You've reached your limit. Upgrade to unlimited messages for $10/year";
    } else if (isMediumUsage) {
      return `Get unlimited messages for just $10/year`;
    } else {
      return `Upgrade to unlimited messages for $10/year`;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleUpgrade}
        className={cn(
          "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center gap-2 transition-colors duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
          isHighUsage && remaining <= 2 && "animate-pulse",
          isCollapsed ? "w-auto h-auto p-2 aspect-square rounded-lg" : "w-full py-2 px-4 rounded-lg"
        )}
        title={isCollapsed ? getTooltipText() : undefined}
        disabled={isLoading}
      >
        {isHighUsage ? (
          <ArrowUp className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
        ) : (
          <Sparkles className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4")} />
        )}
        {!isCollapsed && (
          <span className="truncate">{getButtonText()}</span>
        )}
      </Button>
      {/* DEBUG: Show usage values */}
      {!isCollapsed && (
        <div className="text-xs text-muted-foreground px-1">
          DEBUG: {used}/{limit} ({Math.round(usagePercentage)}%) - Remaining: {remaining}
        </div>
      )}
    </div>
  );
}
