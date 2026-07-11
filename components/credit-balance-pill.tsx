"use client";

import { useAuth } from "@/hooks/useAuth";
import { MONTHLY_CREDIT_ALLOWANCE, YEARLY_CREDIT_ALLOWANCE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CreditBalancePillProps = {
  className?: string;
};

type SubscriptionType = "monthly" | "yearly";

const SUBSCRIPTION_ALLOWANCES: Record<SubscriptionType, number> = {
  monthly: MONTHLY_CREDIT_ALLOWANCE,
  yearly: YEARLY_CREDIT_ALLOWANCE,
};

function formatCredits(value: number) {
  return value.toLocaleString();
}

function getSubscribedCreditUsage(remaining: number, allowance: number) {
  const clampedRemaining = Math.min(Math.max(0, remaining), allowance);
  const used = allowance - clampedRemaining;
  const usedPercent = allowance > 0 ? (used / allowance) * 100 : 0;

  return { remaining: clampedRemaining, used, allowance, usedPercent };
}

function getUsedBarColorClass(usedPercent: number) {
  if (usedPercent >= 80) return "bg-red-500";
  if (usedPercent >= 50) return "bg-amber-500";
  return "bg-emerald-500";
}

function UsageMeter({
  summary,
  detail,
  usedPercent,
  className,
}: {
  summary: string;
  detail: string;
  usedPercent: number;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn("px-1 py-1 cursor-default outline-none", className)}
          tabIndex={0}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">Usage</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {summary}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                getUsedBarColorClass(usedPercent),
              )}
              style={{ width: `${Math.min(100, usedPercent)}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {detail}
      </TooltipContent>
    </Tooltip>
  );
}

export function CreditBalancePill({ className }: CreditBalancePillProps) {
  const { usageData, user, isLoading } = useAuth();

  if (isLoading || !user) {
    return null;
  }

  const subscriptionType = usageData?.subscriptionType ?? null;
  const credits = usageData?.credits ?? user?.credits ?? 0;

  if (subscriptionType === "monthly" || subscriptionType === "yearly") {
    const { remaining, used, allowance, usedPercent } = getSubscribedCreditUsage(
      credits,
      SUBSCRIPTION_ALLOWANCES[subscriptionType],
    );

    return (
      <UsageMeter
        summary={`${Math.round(usedPercent)}%`}
        detail={`${formatCredits(remaining)} remaining · ${formatCredits(used)} used of ${formatCredits(allowance)} credits`}
        usedPercent={usedPercent}
        className={className}
      />
    );
  }

  const limit = usageData?.limit ?? user?.messageLimit ?? 10;
  const remaining = usageData?.remaining ?? user?.messageRemaining ?? limit;
  const used = Math.max(0, limit - remaining);
  const usedPercent = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <UsageMeter
      summary={`${used}/${limit}`}
      detail={`${used} used · ${remaining} remaining today`}
      usedPercent={usedPercent}
      className={className}
    />
  );
}
