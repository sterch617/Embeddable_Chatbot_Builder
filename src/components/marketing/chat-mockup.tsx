import { MessagesSquare, FileText } from "lucide-react";

// Static, decorative chat preview for the hero — mirrors the real widget look.
export function ChatMockup() {
  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border bg-background shadow-xl">
      <div className="flex items-center gap-2 bg-primary px-4 py-3 text-primary-foreground">
        <MessagesSquare className="size-5" />
        <span className="font-medium">Acme Support</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-sm">
            Hi! How can I help you today?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
            How do I reset my password?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-sm">
            Click “Forgot password” on the sign-in screen and enter your email.
            We&apos;ll send a secure reset link that&apos;s valid for one hour.
            <div className="mt-2 flex border-t pt-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border">
                <FileText className="size-3" /> Help Center
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t px-4 py-2.5 text-center text-[11px] text-muted-foreground">
        Powered by Docent
      </div>
    </div>
  );
}
