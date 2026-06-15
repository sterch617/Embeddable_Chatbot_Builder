"use client";

import { CreditCard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { changePlanAction } from "@/lib/billing/actions";
import type { PlanId } from "@/lib/types";

interface PlanCtaProps {
  planId: PlanId;
  planName: string;
  price: number;
  currentPlanId: PlanId;
  order: PlanId[];
}

export function PlanCta({ planId, planName, price, currentPlanId, order }: PlanCtaProps) {
  if (planId === currentPlanId) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  const isUpgrade = order.indexOf(planId) > order.indexOf(currentPlanId);
  const label = isUpgrade ? `Upgrade to ${planName}` : `Switch to ${planName}`;

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant={isUpgrade ? "default" : "outline"} className="w-full" />}
      >
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm your plan</DialogTitle>
          <DialogDescription>
            Docent is in demo mode — this is a mock checkout and no card is charged.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          <div className="flex justify-between">
            <span>{planName} plan</span>
            <span className="font-medium">${price}/mo</span>
          </div>
          <div className="mt-1 flex justify-between text-muted-foreground">
            <span>Due today (test mode)</span>
            <span>$0.00</span>
          </div>
        </div>
        <DialogFooter>
          <form action={changePlanAction.bind(null, planId)} className="w-full">
            <Button type="submit" className="w-full">
              <CreditCard className="size-4" /> Confirm — switch to {planName}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
