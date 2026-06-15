import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan } from "@/lib/plans";

// Presentational plan card, reused on the pricing section and the billing page.
export function PlanCard({ plan, cta }: { plan: Plan; cta: React.ReactNode }) {
  return (
    <Card
      className={cn(
        "flex flex-col p-6",
        plan.highlighted && "border-primary ring-1 ring-primary",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{plan.name}</h3>
        {plan.highlighted && <Badge>Most popular</Badge>}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight">
          ${plan.priceMonthly}
        </span>
        <span className="text-muted-foreground">/mo</span>
      </div>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </Card>
  );
}
