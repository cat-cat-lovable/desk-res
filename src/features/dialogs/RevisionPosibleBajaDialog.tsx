import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/base/Accordion";
import { AppDialog } from "@/shared/components/base/AppDialog";
import { Label } from "@/shared/components/base/Label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/base/RadioGroup";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useGestionDefaults } from "@/shared/hooks/useGestionDefaults";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { cn } from "@/shared/lib/utils/cn";
import { tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import type { Caso } from "@/shared/types/caso";

import { GestionFields } from "./GestionFields";

export interface RevisionPosibleBajaDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const TONO_TEXT = {
  destructive: "text-destructive",
  success: "text-success-strong",
  neutral: "text-muted-foreground",
} as const;

const OPCIONES_DECISION_BAJA = [
  {
    valor: "aprueba" as const,
    titulo: "Se aprueba baja",
    descripcion: "El cliente queda dado de baja del servicio.",
    tono: "destructive" as const,
  },
  {
    valor: "rechaza" as const,
    titulo: "Se rechaza baja",
    descripcion: "El cliente se mantiene en el servicio.",
    tono: "success" as const,
  },
  {
    valor: "falta-informacion" as const,
    titulo: "Falta información",
    descripcion: `El caso queda pendiente en "En evaluación" hasta completar los datos.`,
    tono: "neutral" as const,
  },
] as const;

const COMENTARIO_BAJA_LABEL: Record<(typeof OPCIONES_DECISION_BAJA)[number]["valor"], string> = {
  aprueba: "¿Por qué se aprueba la baja?",
  rechaza: "¿Por qué no se da de baja al cliente?",
  "falta-informacion": "¿Qué información falta por completar?",
};

/**
 * Reevaluación · motivo "Posible baja", turno de la líder de operaciones:
 * "Resolver" va directo a esta decisión — no pasa por las 3 opciones
 * genéricas (Se mantiene / Derivación / Dar de baja) de
 * `DecisionCierreDialog`, porque el caso ya nació como una posible baja.
 *
 * "Falta información" no cierra el caso: pasa el turno al capitán
 * (`turnoPosibleBaja = "capitan"`), que ve y responde ese pedido en
 * `CompletarInformacionBajaDialog`. Cuando el capitán guarda, el turno
 * vuelve acá (`accionPrincipal` vuelve a mostrar "Resolver") y este diálogo
 * muestra arriba de todo lo que la líder pidió y lo que el capitán
 * respondió, antes de repetir la misma decisión de 3 opciones.
 */
export function RevisionPosibleBajaDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: RevisionPosibleBajaDialogProps) {
  const [decisionBaja, setDecisionBaja] = React.useState<
    "aprueba" | "rechaza" | "falta-informacion" | ""
  >("");
  const [comentarioBaja, setComentarioBaja] = React.useState("");
  const { fecha, setFecha } = useGestionDefaults(caso, open);

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setDecisionBaja("");
    setComentarioBaja("Comentario de prueba para la decisión de baja.");
  });

  if (!caso) return null;

  const tipoGestion = tipoGestionDeCaso(caso);
  const puedeConfirmar = decisionBaja !== "" && comentarioBaja.trim() !== "";

  const handleConfirm = async () => {
    const base = { fechaGestion: fecha || caso.fechaGestion };

    if (decisionBaja === "falta-informacion") {
      await actualizarCaso(
        caso.id,
        {
          ...base,
          comentarioBaja,
          respuestaBaja: undefined,
          turnoPosibleBaja: "capitan",
          cerrado: false,
          estadoProceso: "en-evaluacion",
        },
        "decisionCierreFaltaInformacion",
        {
          description: "Falta información para decidir la baja",
          trigger: "Diálogo de posible baja",
          fields: ["comentarioBaja", "respuestaBaja", "turnoPosibleBaja", "estadoProceso"],
        },
      );
      toast.success("Caso actualizado: falta información", {
        description: `Caso de ${caso.cliente.nombre}`,
      });
      onSaved();
      return;
    }

    if (decisionBaja === "rechaza") {
      await actualizarCaso(
        caso.id,
        {
          ...base,
          resultado: "Se mantiene",
          comentarioBaja,
          detalleResolucion: comentarioBaja,
          cerrado: true,
          estadoProceso: "resuelto",
        },
        "decisionCierreResuelta",
        {
          description: "Se rechaza la baja: el cliente se mantiene en el servicio",
          trigger: "Diálogo de posible baja",
          fields: ["resultado", "comentarioBaja", "detalleResolucion", "cerrado", "estadoProceso"],
        },
      );
    } else if (decisionBaja === "aprueba") {
      await actualizarCaso(
        caso.id,
        {
          ...base,
          resultado: "Dar de baja",
          comentarioBaja,
          detalleResolucion: comentarioBaja,
          cerrado: true,
          estadoProceso: "resuelto",
        },
        "decisionCierreResuelta",
        {
          description: "Se aprueba la baja",
          trigger: "Diálogo de posible baja",
          fields: ["resultado", "comentarioBaja", "detalleResolucion", "cerrado", "estadoProceso"],
        },
      );
    }

    toast.success("Caso resuelto", { description: `Caso de ${caso.cliente.nombre}` });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Posible baja"
      description={`Caso de ${caso.cliente.nombre}`}
      confirmLabel="Guardar resolución"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        {caso.respuestaBaja && !caso.resultado && (
          <Accordion
            type="single"
            collapsible
            defaultValue="solicitud-respuesta"
            className="rounded-control border border-border-subtle bg-muted/40 px-3"
          >
            <AccordionItem value="solicitud-respuesta" className="border-none">
              <AccordionTrigger iconPosition="start">Solicitud y respuesta</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                    Lo solicitado
                  </p>
                  <p className="mt-1 type-supporting text-foreground">{caso.comentarioBaja}</p>
                </div>
                <div>
                  <p className="type-meta font-medium uppercase tracking-wide text-muted-foreground">
                    Respuesta
                  </p>
                  <p className="mt-1 type-supporting text-foreground">{caso.respuestaBaja}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <div className="space-y-1.5">
          <Label required>¿Se aprueba la baja?</Label>
          <RadioGroup
            value={decisionBaja}
            onValueChange={(v) => setDecisionBaja(v as typeof decisionBaja)}
            className="gap-2.5"
          >
            {OPCIONES_DECISION_BAJA.map((op) => (
              <Label
                key={op.valor}
                htmlFor={`posible-baja-${op.valor}`}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-control border p-3 transition-colors hover:bg-muted/40",
                  decisionBaja === op.valor ? "border-primary bg-accent" : "border-border-subtle",
                )}
              >
                <RadioGroupItem
                  value={op.valor}
                  id={`posible-baja-${op.valor}`}
                  className="mt-0.5 shrink-0"
                />
                <div className="space-y-0.5">
                  <p className="type-item-title text-foreground">{op.titulo}</p>
                  <p className={cn("type-supporting", TONO_TEXT[op.tono])}>{op.descripcion}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {decisionBaja !== "" && (
          <div className="space-y-1.5">
            <Label htmlFor="posible-baja-comentario" required>
              {COMENTARIO_BAJA_LABEL[decisionBaja]}
            </Label>
            <Textarea
              id="posible-baja-comentario"
              value={comentarioBaja}
              onChange={(e) => setComentarioBaja(e.target.value)}
              placeholder="Detalla el motivo de la decisión."
            />
          </div>
        )}

        <GestionFields
          idPrefix="posible-baja"
          fecha={fecha}
          setFecha={setFecha}
          tipo={tipoGestion === "nuevo-cobro" ? undefined : tipoGestion}
        />
      </div>
    </AppDialog>
  );
}
