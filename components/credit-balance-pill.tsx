"use client";

import { useAuth } from "@/hooks/useAuth";
import { MONTHLY_CREDIT_ALLOWANCE, YEARLY_CREDIT_ALLOWANCE } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

function SubscribedCreditBalance({
  remaining,
  allowance,
  className,
}: {
  remaining: number;
  allowance: number;
  className?: string;
}) {
  const { remaining: clampedRemaining, used, usedPercent } = getSubscribedCreditUsage(
    remaining,
    allowance,
  );

  return (
    <div className={cn("px-1 py-1", className)}>
      <p className="text-xs font-medium text-foreground">
        {formatCredits(clampedRemaining)} remaining · {formatCredits(used)} used of{" "}
        {formatCredits(allowance)} credits
      </p>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getUsedBarColorClass(usedPercent))}
          style={{ width: `${Math.min(100, usedPercent)}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">{Math.round(usedPercent)}% used</p>
    </div>
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
    return (
      <SubscribedCreditBalance
        remaining={credits}
        allowance={SUBSCRIPTION_ALLOWANCES[subscriptionType]}
        className={className}
      />
    );
  }

  const limit = usageData?.limit ?? user?.messageLimit ?? 10;
  const remaining = usageData?.remaining ?? user?.messageRemaining ?? limit;
  const used = Math.max(0, limit - remaining);

  return (
    <div className={cn("px-1 py-1", className)}>
      <p className="text-xs text-muted-foreground">
        {used}/{limit} msgs today
      </p>
    </div>
  );
}
