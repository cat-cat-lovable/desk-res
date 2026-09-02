import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "type-supporting flex h-10 w-full rounded-control border border-input bg-background px-3 py-2 text-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none",
          "placeholder:text-muted-foreground",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
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
Input.displayName = "Input";

export { Input };
