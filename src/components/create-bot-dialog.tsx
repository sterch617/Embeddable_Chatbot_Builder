"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBotAction } from "@/lib/bots/actions";

export function CreateBotDialog({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState(createBotAction, null);

  return (
    <Dialog>
      <DialogTrigger render={<Button disabled={disabled} />}>
        <Plus className="size-4" /> New chatbot
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a chatbot</DialogTitle>
          <DialogDescription>
            Give it a name — you&apos;ll add knowledge in the next step.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Support"
              maxLength={60}
              required
              autoFocus
            />
          </div>
          {state && "error" in state && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create chatbot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
