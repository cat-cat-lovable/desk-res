import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "type-supporting flex min-h-20 w-full resize-y rounded-control border border-input bg-background px-3 py-2.5 text-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none",
          "placeholder:text-muted-foreground",
          "hover:border-muted-foreground/40",
          "focus-visible:border-primary",
          "aria-invalid:border-destructive aria-invalid:hover:border-destructive aria-invalid:focus-visible:border-destructive",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
