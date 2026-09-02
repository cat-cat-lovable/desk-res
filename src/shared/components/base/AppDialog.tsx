import * as React from "react";

import { cn } from "@/shared/lib/utils/cn";

import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./Dialog";

export interface AppDialogProps extends Omit<
  React.ComponentPropsWithoutRef<typeof DialogContent>,
  "title" | "children"
> {
  /** Elemento que dispara el diálogo (botón, enlace, etc.). */
  trigger: React.ReactNode;
  /** Icono opcional arriba del título (sin fondo, centrado). */
  icon?: React.ReactNode;
  /** Título del diálogo. Usa la escala compacta 22/28. */
  title: string;
  /** Descripción o texto de soporte. Consume el rol `type-supporting`. */
  description?: string;
  /** Contenido principal del diálogo (formularios, texto, etc.). */
  children?: React.ReactNode;
  /** Texto del botón de acción principal (derecha). */
  confirmLabel?: string;
  /** Texto del botón de cancelar (izquierda). */
  cancelLabel?: string;
  /** Variante del botón de confirmar. */
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Deshabilita el botón de confirmar. */
  confirmDisabled?: boolean;
  /** Callback al confirmar. Si devuelve `false`, el diálogo no se cierra. */
  onConfirm?: () => boolean | void | Promise<boolean | void>;
  /** Callback al cancelar o cerrar. */
  onCancel?: () => void;
  /** Alineación de los botones de acción. */
  actionsAlignment?: "right" | "center" | "left" | "space-between";
  /** Controla el estado abierto/cerrado (modo controlado). */
  open?: boolean;
  /** Callback cuando cambia el estado abierto. */
  onOpenChange?: (open: boolean) => void;
  /** Clase adicional para el contenido del diálogo. */
  className?: string;
  /** Si es `true`, oculta el footer con los botones de acción. */
  hideFooter?: boolean;
}

/**
 * Diálogo de aplicación al estilo Material 3.
 *
 * Estructura canónica (sin dividers):
 * 1. Icono opcional (sin fondo, centrado)
 * 2. Título compacto (`type-subsection-title`, 22/28)
 * 3. Supporting text (`type-supporting`)
 * 4. Content area (scrollable si es necesario)
 * 5. Action area (botones, sin divider, alineación configurable)
 *
 * Si hay `icon`, el headline se centra. Si no hay icono, el headline se alinea
 * a la izquierda. Supporting text y acciones usan roles distintos aunque
 * compartan 14/20: regular para lectura y medium para intención de acción.
 *
 * Wrapper ergonómico sobre el Dialog compuesto: las props extra (`aria-*`,
 * `onEscapeKeyDown`…) pasan al DialogContent y el `ref` apunta a ese nodo.
 * Para estructuras distintas, usa Dialog/DialogContent/DialogFooter directo.
 */
const AppDialog = React.forwardRef<React.ElementRef<typeof DialogContent>, AppDialogProps>(
  function AppDialog(
    {
      trigger,
      icon,
      title,
      description,
      children,
      confirmLabel = "Confirmar",
      cancelLabel = "Cancelar",
      confirmVariant = "default",
      confirmDisabled,
      onConfirm,
      onCancel,
      actionsAlignment = "right",
      open,
      onOpenChange,
      className,
      hideFooter,
      ...props
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const handleOpenChange = (next: boolean) => {
      if (!next) {
        onCancel?.();
      }
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    };

    const handleConfirm = async () => {
      const result = onConfirm?.();
      const shouldClose = result instanceof Promise ? await result : result;
      if (shouldClose !== false) {
        handleOpenChange(false);
      }
    };

    const alignmentClasses = {
      right: "justify-end",
      center: "justify-center",
      left: "justify-start",
      "space-between": "justify-between",
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent ref={ref} className={cn("sm:max-w-md", className)} {...props}>
          {/* Icono opcional (sin fondo, centrado) */}
          {icon && (
            <div className="flex justify-center">
              <div className="text-foreground">{icon}</div>
            </div>
          )}

          {/* Headline + Supporting text */}
          <div className={cn("flex flex-col gap-related", icon ? "text-center" : "text-left")}>
            <DialogTitle scale="compact" className={cn("text-foreground", icon && "text-center")}>
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className={cn("text-muted-foreground", icon && "text-center")}>
                {description}
              </DialogDescription>
            )}
          </div>

          {/* Content area */}
          {children && <div className="max-h-[60vh] overflow-y-auto">{children}</div>}

          {/* Action area (sin dividers). `gap-related` une las acciones y el
            `gap-grouped` de DialogContent separa las regiones del overlay. */}
          {!hideFooter && (
            <div
              className={cn(
                "flex flex-col-reverse gap-related sm:flex-row",
                alignmentClasses[actionsAlignment],
              )}
            >
              <Button variant="ghost" onClick={() => handleOpenChange(false)}>
                {cancelLabel}
              </Button>
              <Button variant={confirmVariant} disabled={confirmDisabled} onClick={handleConfirm}>
                {confirmLabel}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);
AppDialog.displayName = "AppDialog";

export { AppDialog };
