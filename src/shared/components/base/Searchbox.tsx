import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

export interface SearchboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  /** Cuando se define, muestra un botón (×) para limpiar el campo. */
  onClear?: () => void;
}

const Searchbox = React.forwardRef<HTMLInputElement, SearchboxProps>(
  ({ className, onClear, value, disabled, ...props }, ref) => {
    const hasValue = value !== undefined && String(value) !== "";
    const showClear = !!onClear && hasValue && !disabled;

    return (
      <div className={cn("relative flex w-full items-center", className)}>
        <svg
          className="pointer-events-none absolute left-3 size-(--icon-size-inline) text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={ref}
          type="search"
          role="searchbox"
          value={value}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-control border border-input bg-background pl-9 pr-9 type-supporting text-foreground outline-none transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none",
            "placeholder:text-muted-foreground",
            "hover:border-muted-foreground/40 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Limpiar"
            className="absolute right-3 flex size-(--icon-size-control) cursor-pointer items-center justify-center rounded-button text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              className="size-(--icon-size-control)"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
Searchbox.displayName = "Searchbox";

export { Searchbox };
