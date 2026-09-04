import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/base/Accordion";
import { AppDialog } from "@/shared/components/base/AppDialog";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/base/RadioGroup";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { cn } from "@/shared/lib/utils/cn";
import { CUOTAS_PRUEBA, MONTO_PRUEBA } from "@/shared/lib/utils/datosPrueba";
import { normalizarMonto } from "@/shared/lib/utils/format";
import type { Caso, ProcedeModificacionContrato } from "@/shared/types/caso";

import { CobroAnteriorSummary } from "../CobroAnteriorSummary";
import { ContextoDerivacionSummary } from "../ContextoDerivacionSummary";

export interface AnalisisModificacionContratoDialogProps {
  caso: Caso | null;
  casos: Caso[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const OPCIONES = [
  {
    valor: "si" as const,
    titulo: "Procede",
    descripcion: "El caso requiere modificación de contrato: sigue a definir el nuevo cobro.",
  },
  {
    valor: "no" as const,
    titulo: "No procede",
    descripcion: "No se modifica el contrato. El caso queda igual derivado, sin nuevo cobro.",
  },
] as const;

/**
 * Paso previo a definir el nuevo cobro dentro del flujo de derivación: el
 * acta marcó "Análisis modificación contrato" al crear el caso y el equipo
 * receptor ya aceptó la recepción (`pasoDerivacion === "cobro"`). Acá la
 * capitana decide si procede o no la modificación de contrato:
 * - Procede → se completan los mismos datos que `NuevoCobroDialog` (valor y
 *   cuotas) y el cobro pasa directo a "esperando-cliente" en Apio.
 * - No procede → solo pide justificación; el caso queda igual derivado
 *   ("Derivación a otro servicio"), cerrado, sin nuevo cobro.
 */
export function AnalisisModificacionContratoDialog({
  caso,
  casos,
  open,
  onOpenChange,
  onSaved,
}: AnalisisModificacionContratoDialogProps) {
  const [procede, setProcede] = React.useState<ProcedeModificacionContrato | "">("");
  const [justificacion, setJustificacion] = React.useState("");
  const [valor, setValor] = React.useState("");
  const [cuotas, setCuotas] = React.useState("");

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setProcede("");
    setJustificacion("");
    setValor(caso?.nuevoCobro?.valor ? String(caso.nuevoCobro.valor) : MONTO_PRUEBA);
    setCuotas(caso?.nuevoCobro?.cuotas ? String(caso.nuevoCobro.cuotas) : CUOTAS_PRUEBA);
  });

  if (!caso) return null;

  const vecesDerivado = caso.actaDerivacion
    ? casos.filter((c) => c.cliente.correo === caso.cliente.correo && c.actaDerivacion).length
    : 0;

  const puedeConfirmar =
    procede === "si"
      ? Boolean(valor) && Boolean(cuotas)
      : procede === "no"
        ? justificacion.trim() !== ""
        : false;

  const handleConfirm = async () => {
    if (procede === "si") {
      await actualizarCaso(
        caso.id,
        {
          modificacionContratoProcede: "si",
          pasoDerivacion: undefined,
          nuevoCobro: {
            estado: "esperando-cliente",
            aplica: true,
            valor: normalizarMonto(valor),
            cuotas: Number(cuotas),
            fechaDefinicion: caso.fechaGestion,
          },
          estadoProceso: "en-evaluacion",
          cerrado: false,
        },
        "analisisModificacionContratoResuelto",
        {
          description:
            "La capitana confirma que procede la modificación de contrato y define el nuevo cobro",
          trigger: "Diálogo de análisis de modificación de contrato",
          fields: [
            "modificacionContratoProcede",
            "pasoDerivacion",
            "nuevoCobro",
            "estadoProceso",
            "cerrado",
          ],
        },
      );
      toast.success("Nuevo cobro generado", {
        description: `Caso de ${caso.cliente.nombre}. Queda esperando que el cliente lo acepte en Apio.`,
      });
    } else if (procede === "no") {
      await actualizarCaso(
        caso.id,
        {
          modificacionContratoProcede: "no",
          modificacionContratoJustificacion: justificacion,
          pasoDerivacion: undefined,
          resultado: "Derivación a otro servicio",
          detalleResolucion: `Modificación de contrato no procede: ${justificacion}`,
          estadoProceso: "resuelto",
          cerrado: true,
        },
        "analisisModificacionContratoResuelto",
        {
          description: "La capitana determina que no procede la modificación de contrato",
          trigger: "Diálogo de análisis de modificación de contrato",
          fields: [
            "modificacionContratoProcede",
            "modificacionContratoJustificacion",
            "pasoDerivacion",
            "resultado",
            "detalleResolucion",
            "estadoProceso",
            "cerrado",
          ],
        },
      );
      toast.success("Caso derivado sin nuevo cobro", {
        description: `Caso de ${caso.cliente.nombre}`,
      });
    } else {
      return;
    }
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Análisis de modificación de contrato"
      description={`Caso de ${caso.cliente.nombre}. El equipo receptor ya aceptó la derivación.`}
      confirmLabel={procede === "si" ? "Definir nuevo cobro" : "Guardar análisis"}
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label required>¿Procede la modificación de contrato?</Label>
          <RadioGroup
            value={procede}
            onValueChange={(v) => setProcede(v as ProcedeModificacionContrato)}
            className="gap-2.5"
          >
            {OPCIONES.map((op) => (
              <Label
                key={op.valor}
                htmlFor={`modificacion-contrato-${op.valor}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-control border p-3 transition-colors hover:bg-muted/40",
                  procede === op.valor ? "border-primary bg-accent" : "border-border-subtle",
                )}
              >
                <RadioGroupItem
                  value={op.valor}
                  id={`modificacion-contrato-${op.valor}`}
                  className="mt-0.5 shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="type-item-title text-foreground">{op.titulo}</p>
                  <p className="type-supporting text-muted-foreground">{op.descripcion}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {procede === "si" && (
          <div className="space-y-4">
            {caso.cobroAnterior && (
              <Accordion
                type="single"
                collapsible
                className="rounded-control border border-border-subtle bg-muted/40"
              >
                <AccordionItem value="cobro-anterior" className="border-none px-3">
                  <AccordionTrigger className="type-meta font-medium uppercase tracking-wide text-muted-foreground hover:no-underline">
                    Cobro anterior (post-venta)
                  </AccordionTrigger>
                  <AccordionContent>
                    <CobroAnteriorSummary cobro={caso.cobroAnterior} hideTitle />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <ContextoDerivacionSummary
              acta={caso.actaDerivacion}
              estrategia={caso.estrategia}
              tacticas={caso.tacticas}
              vecesDerivado={vecesDerivado}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="analisis-cobro-valor">Valor contrato</Label>
                <Input
                  id="analisis-cobro-valor"
                  inputMode="numeric"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="$0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="analisis-cobro-cuotas">Cuotas</Label>
                <Input
                  id="analisis-cobro-cuotas"
                  type="number"
                  min={1}
                  value={cuotas}
                  onChange={(e) => setCuotas(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {procede === "no" && (
          <div className="space-y-1.5">
            <Label htmlFor="analisis-justificacion" required>
              Justificación
            </Label>
            <Textarea
              id="analisis-justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="¿Por qué no procede la modificación de contrato?"
            />
          </div>
        )}
      </div>
    </AppDialog>
  );
}
