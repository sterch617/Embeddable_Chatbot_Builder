import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { getUsage } from "@/lib/usage";
import { getPlan, PLANS, PLAN_ORDER } from "@/lib/plans";
import { PlanCard } from "@/components/plan-card";
import { PlanCta } from "@/components/billing/mock-checkout";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Plan & usage" };

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const user = await requireUser();
  const db = await getDb();
  const usage = await getUsage(db, user.id);
  const plan = getPlan(user.plan);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Plan &amp; usage</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You&apos;re on the{" "}
        <span className="font-medium text-foreground">{plan.name}</span> plan.
      </p>

      <Card className="mt-6 space-y-4 p-6">
        <h2 className="font-medium">This month</h2>
        <UsageBar label="Chatbots" used={usage.bots} limit={plan.limits.bots} />
        <UsageBar
          label="Pages of knowledge"
          used={usage.pages}
          limit={plan.limits.pages}
        />
        <UsageBar
          label="Messages"
          used={usage.messages}
          limit={plan.limits.messagesPerMonth}
        />
      </Card>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Plans</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((id) => (
            <PlanCard
              key={id}
              plan={PLANS[id]}
              cta={
                <PlanCta
                  planId={id}
                  planName={PLANS[id].name}
                  price={PLANS[id].priceMonthly}
                  currentPlanId={plan.id}
                  order={PLAN_ORDER}
                />
              }
            />
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo mode — mock checkout, no real payment is processed.
        </p>
      </div>
    </div>
  );
}
