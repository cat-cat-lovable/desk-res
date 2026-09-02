import * as React from "react";

import { AppDialog } from "@/shared/components/base/AppDialog";
import { Label } from "@/shared/components/base/Label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/base/RadioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/base/Select";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import {
  type Caso,
  type MotivoRechazoRecepcion,
  MOTIVOS_RECHAZO_RECEPCION,
} from "@/shared/types/caso";

export interface RecepcionDerivacionDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

type Decision = "aceptada" | "rechazada";

/**
 * El capitán receptor decide en base al Acta de derivación — pero el acta
 * completa (y el cobro anterior de post-venta) se ven en el desplegable de
 * `CasoCard`, no acá: esta modal es solo para la acción de aprobar o
 * rechazar la recepción, sin mostrar esa información de contexto.
 *
 * Si rechaza, el caso se cierra ahí mismo con una justificación
 * obligatoria. "Indicar opción" (`rechazoRecepcionMotivo`) es solo una
 * **sugerencia** de cómo seguir con el caso —no una decisión definitiva—,
 * mismo criterio que el "camino sugerido" de `RevisionMalVendidoDialog`:
 * por eso es un `Select` simple, no tarjetas seleccionables, y no
 * determina ningún `resultado`. El capitán de origen retoma el caso por
 * fuera de la app en base a la nota.
 */
export function RecepcionDerivacionDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: RecepcionDerivacionDialogProps) {
  const [decision, setDecision] = React.useState<Decision>("aceptada");
  const [rechazoMotivo, setRechazoMotivo] = React.useState<MotivoRechazoRecepcion | "">("");
  const [rechazoJustificacion, setRechazoJustificacion] = React.useState("");

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setDecision("aceptada");
    setRechazoMotivo("");
    setRechazoJustificacion("");
  });

  if (!caso) return null;

  const requiereNuevoCobro = Boolean(caso.requiereNuevoCobro);
  const puedeConfirmar =
    decision === "aceptada" || (rechazoMotivo !== "" && rechazoJustificacion.trim() !== "");

  const handleConfirm = async () => {
    if (decision === "aceptada") {
      await actualizarCaso(
        caso.id,
        {
          recepcionDerivacion: { estado: "aceptada" },
          pasoDerivacion: requiereNuevoCobro ? "cobro" : undefined,
          resultado: requiereNuevoCobro ? caso.resultado : "Derivación a otro servicio",
          estadoProceso: requiereNuevoCobro ? "en-evaluacion" : "resuelto",
          cerrado: !requiereNuevoCobro,
          detalleResolucion: requiereNuevoCobro
            ? caso.detalleResolucion
            : "Derivación aceptada, sin nuevo cobro asociado.",
        },
        "recepcionDerivacionAceptada",
        {
          description: "El capitán receptor acepta recibir el caso",
          trigger: "Diálogo de recepción de derivación",
          fields: ["recepcionDerivacion", "pasoDerivacion", "estadoProceso", "cerrado"],
        },
      );
      toast.success("Recepción aceptada", { description: `Caso de ${caso.cliente.nombre}` });
    } else {
      if (!rechazoMotivo) return;
      await actualizarCaso(
        caso.id,
        {
          recepcionDerivacion: { estado: "rechazada" },
          rechazoRecepcionMotivo: rechazoMotivo,
          rechazoRecepcionJustificacion: rechazoJustificacion,
          pasoDerivacion: undefined,
          resultado: undefined,
          cerrado: true,
          estadoProceso: "resuelto",
        },
        "recepcionDerivacionRechazada",
        {
          description: "El capitán receptor rechaza recibir el caso",
          trigger: "Diálogo de recepción de derivación",
          fields: [
            "recepcionDerivacion",
            "rechazoRecepcionMotivo",
            "rechazoRecepcionJustificacion",
            "pasoDerivacion",
            "resultado",
            "cerrado",
            "estadoProceso",
          ],
        },
      );
      toast.success("Caso resuelto", {
        description: `Caso de ${caso.cliente.nombre}. El capitán de origen queda notificado.`,
      });
    }
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Recepción de derivación"
      description={`Caso de ${caso.cliente.nombre}. Servicio destino: ${caso.servicioDestino ?? caso.servicio}.`}
      confirmLabel={decision === "aceptada" ? "Aceptar recepción" : "Rechazar recepción"}
      confirmVariant={decision === "aceptada" ? "default" : "destructive"}
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <RadioGroup
          value={decision}
          onValueChange={(v) => setDecision(v as Decision)}
          className="gap-3"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="aceptada" id="recepcion-aceptada" />
            <Label htmlFor="recepcion-aceptada">Aceptar recepción</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="rechazada" id="recepcion-rechazada" />
            <Label htmlFor="recepcion-rechazada">Rechazar recepción</Label>
          </div>
        </RadioGroup>

        {decision === "aceptada" ? (
          <div className="space-y-4">
            <p className="type-supporting rounded-control bg-muted p-3 text-muted-foreground">
              {requiereNuevoCobro
                ? "El acta de derivación indica que este caso requiere un nuevo cobro en Apio."
                : "El acta de derivación indica que este caso no requiere un nuevo cobro en Apio."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rechazo-recepcion-motivo" required>
                Indicar opción
              </Label>
              <Select
                value={rechazoMotivo}
                onValueChange={(v) => setRechazoMotivo(v as MotivoRechazoRecepcion)}
              >
                <SelectTrigger id="rechazo-recepcion-motivo">
                  <SelectValue placeholder="Selecciona una sugerencia" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVOS_RECHAZO_RECEPCION.map((motivo) => (
                    <SelectItem key={motivo} value={motivo}>
                      {motivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="type-meta text-muted-foreground">
                Es solo una sugerencia de cómo seguir con el caso: el capitán de origen decide y
                ejecuta el camino real por fuera de este flujo.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rechazo-justificacion" required>
                Justificación
              </Label>
              <Textarea
                id="rechazo-justificacion"
                value={rechazoJustificacion}
                onChange={(e) => setRechazoJustificacion(e.target.value)}
                placeholder="¿Por qué el servicio receptor no puede recibir este caso? ¿Qué corresponde hacer ahora?"
              />
            </div>
          </div>
        )}
      </div>
    </AppDialog>
  );
}
