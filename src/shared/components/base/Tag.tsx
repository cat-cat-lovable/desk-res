import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

const tagVariants = cva("inline-flex select-none items-center gap-1 border font-medium", {
  variants: {
    tone: {
      gray: "border-border bg-secondary text-secondary-foreground",
      brand: "border-primary/20 bg-primary/10 text-primary",
      success: "border-success/30 bg-success/10 text-success-strong",
      warning: "border-warning/30 bg-warning/10 text-warning-strong",
      danger: "border-destructive/20 bg-destructive/10 text-destructive",
    },
    shape: {
      square: "rounded",
      rounded: "rounded-full",
    },
    size: {
      sm: "h-6 px-2 type-meta",
      md: "h-7 px-2.5 type-supporting",
      lg: "h-8 px-3 type-body",
    },
  },
  defaultVariants: { tone: "gray", shape: "square", size: "sm" },
});

export interface TagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">, VariantProps<typeof tagVariants> {
  removable?: boolean;
  onRemove?: () => void;
}

const Tag = React.forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone, shape, size, removable, onRemove, children, className, ...props },
  ref,
) {
  return (
    <span ref={ref} className={cn(tagVariants({ tone, shape, size }), className)} {...props}>
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Quitar"
          className="-mr-0.5 inline-flex cursor-pointer items-center justify-center rounded-button opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
        >
          <svg
            className="h-3 w-3"
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
    </span>
  );
});
Tag.displayName = "Tag";

export { Tag, tagVariants };
