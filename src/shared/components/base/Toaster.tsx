import * as React from "react";
import { toast, Toaster as Sonner } from "sonner";

import { cn } from "@/shared/lib/utils/cn";

// Toaster de la app (Sonner) tematizado con tokens Lexy. Se monta UNA vez en
// el layout raíz; después se dispara imperativo desde cualquier parte:
//
//   toast.success("Cambios guardados");
//   toast.error("No pudimos guardar. Intenta de nuevo.");
//
// Los tipos success/error/warning/info colorean con los tokens semánticos del
// theme (--color-success, --color-destructive, --color-warning, --color-info)
// vía las CSS vars de Sonner, así que cambiar el theme re-tematiza los toasts.
//
// Defaults pensados para CRM (denso, escritorio): bottom-right, 4s, cola de 3.
// Para mundo cliente (flujos guiados, móvil) se recomienda position="top-center"
// y duration={6000} — ver criterio en Toaster.md.

export type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, style, toastOptions, ...props }: ToasterProps) => (
  <Sonner
    className={cn("toaster group", className)}
    position="bottom-right"
    duration={4000}
    visibleToasts={3}
    richColors
    style={
      {
        "--normal-bg": "var(--color-background)",
        "--normal-text": "var(--color-foreground)",
        "--normal-border": "var(--color-border)",
        "--success-bg": "var(--color-background)",
        "--success-text": "var(--color-success)",
        "--success-border": "color-mix(in oklab, var(--color-success) 30%, transparent)",
        "--error-bg": "var(--color-background)",
        "--error-text": "var(--color-destructive)",
        "--error-border": "color-mix(in oklab, var(--color-destructive) 30%, transparent)",
        "--warning-bg": "var(--color-background)",
        "--warning-text": "var(--color-warning)",
        "--warning-border": "color-mix(in oklab, var(--color-warning) 30%, transparent)",
        "--info-bg": "var(--color-background)",
        "--info-text": "var(--color-info)",
        "--info-border": "color-mix(in oklab, var(--color-info) 30%, transparent)",
        "--border-radius": "var(--radius-md)",
        ...style,
      } as React.CSSProperties
    }
    toastOptions={{
      ...toastOptions,
      classNames: {
        ...toastOptions?.classNames,
        // Capa flotante según el contrato de geometría: shadow-overlay.
        toast: cn("group toast !shadow-overlay", toastOptions?.classNames?.toast),
        description: cn("!text-muted-foreground", toastOptions?.classNames?.description),
        actionButton: cn(
          "!bg-primary !text-primary-foreground",
          toastOptions?.classNames?.actionButton,
        ),
        cancelButton: cn(
          "!bg-muted !text-muted-foreground",
          toastOptions?.classNames?.cancelButton,
        ),
      },
    }}
    {...props}
  />
);

export { toast, Toaster };
