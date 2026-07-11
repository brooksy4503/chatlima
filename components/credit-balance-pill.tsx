"use client";

import { useAuth } from "@/hooks/useAuth";
import { MONTHLY_CREDIT_ALLOWANCE, YEARLY_CREDIT_ALLOWANCE } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CreditBalancePillProps = {
  className?: string;
};

function formatCredits(value: number) {
  return value.toLocaleString();
}

export function CreditBalancePill({ className }: CreditBalancePillProps) {
  const { usageData, user, isLoading } = useAuth();

  if (isLoading || !user) {
    return null;
  }

  const subscriptionType = usageData?.subscriptionType ?? null;
  const credits = usageData?.credits ?? user?.credits ?? 0;

  if (subscriptionType === "monthly") {
    return (
      <div className={cn("px-1 py-1", className)}>
        <p className="text-xs font-medium text-foreground">
          {formatCredits(credits)} / {formatCredits(MONTHLY_CREDIT_ALLOWANCE)} credits
        </p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, (credits / MONTHLY_CREDIT_ALLOWANCE) * 100))}%`,
            }}
          />
        </div>
      </div>
    );
  }

  if (subscriptionType === "yearly") {
    return (
      <div className={cn("px-1 py-1", className)}>
        <p className="text-xs font-medium text-foreground">
          {formatCredits(credits)} / {formatCredits(YEARLY_CREDIT_ALLOWANCE)} credits
        </p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, (credits / YEARLY_CREDIT_ALLOWANCE) * 100))}%`,
            }}
          />
        </div>
      </div>
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
