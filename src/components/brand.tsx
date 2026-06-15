import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** The product wordmark. Pass href={null} to render without a link. */
export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground">
        <MessagesSquare className="size-4" />
      </span>
      <span className="text-lg">{APP_NAME}</span>
    </span>
  );
  return href === null ? inner : <Link href={href}>{inner}</Link>;
}
