import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

const buttonVariants = cva(
  "type-action-label inline-flex cursor-pointer select-none items-center justify-center gap-related whitespace-nowrap rounded-button transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:transform-none [&_svg]:pointer-events-none [&_svg]:size-(--icon-size-inline) [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-cta text-primary-foreground hover:bg-cta-hover active:scale-[0.97] active:bg-cta-active",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.97] active:bg-destructive/80",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted active:scale-[0.97] active:bg-muted",
        secondary:
          "border border-border bg-background text-secondary-foreground hover:bg-muted active:scale-[0.97] active:bg-muted",
        ghost: "text-secondary-foreground hover:bg-muted active:scale-[0.97] active:bg-muted",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
      },
      size: {
        default: "h-[var(--control-height)] px-3.5 py-1.5",
        sm: "h-[var(--control-height-sm)] px-3",
        lg: "h-[var(--control-height-lg)] px-4",
        icon: "size-[var(--control-height)] p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Renderiza el hijo como el elemento raíz (patrón Slot de Radix): `<Button asChild><Link …/></Button>`. */
  asChild?: boolean;
  /** Mantiene el botón en su lugar, bloquea nuevas activaciones y muestra progreso. */
  loading?: boolean;
  /** Etiqueta temporal durante loading. Si se omite, conserva el texto original. */
  loadingLabel?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingLabel,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const showLoading = loading && !asChild;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "disabled:data-[loading=true]:cursor-wait disabled:data-[loading=true]:opacity-100",
        )}
        ref={ref}
        aria-busy={showLoading || undefined}
        data-loading={showLoading ? "true" : undefined}
        disabled={asChild ? undefined : disabled || showLoading}
        {...props}
      >
        {showLoading ? (
          <>
            <span
              aria-hidden="true"
              className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
            />
            {loadingLabel ?? children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
