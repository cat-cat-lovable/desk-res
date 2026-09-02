import * as React from "react";

import { AppDialog } from "@/shared/components/base/AppDialog";
import { Label } from "@/shared/components/base/Label";
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useGestionDefaults } from "@/shared/hooks/useGestionDefaults";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import type { Caso } from "@/shared/types/caso";

import { CobroAnteriorSummary } from "../CobroAnteriorSummary";
import { GestionFields } from "./GestionFields";

export interface IniciarEvaluacionDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function IniciarEvaluacionDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: IniciarEvaluacionDialogProps) {
  const [notas, setNotas] = React.useState("");
  const { fecha, setFecha } = useGestionDefaults(caso, open);
  useResetOnOpen(open && caso ? caso.id : null, () =>
    setNotas("Notas de evaluación de prueba para el flujo."),
  );

  if (!caso) return null;

  const tipoGestion = tipoGestionDeCaso(caso);

  const handleConfirm = async () => {
    await actualizarCaso(
      caso.id,
      {
        estadoProceso: "en-evaluacion",
        notasEvaluacion: notas,
        fechaGestion: fecha,
      },
      "iniciarEvaluacionCaso",
      {
        description: "Se inicia la evaluación del caso",
        trigger: "Botón «Iniciar evaluación»",
        fields: ["estadoProceso", "notasEvaluacion", "fechaGestion"],
      },
    );
    toast.success("Evaluación iniciada", { description: `Caso de ${caso.cliente.nombre}` });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Iniciar evaluación"
      description={`Caso de ${caso.cliente.nombre}. Se mueve a "En evaluación".`}
      confirmLabel="Iniciar evaluación"
      onConfirm={handleConfirm}
    >
      <div className="space-y-4">
        <CobroAnteriorSummary cobro={caso.cobroAnterior} />
        <div className="space-y-1.5">
          <Label htmlFor="notas-evaluacion">Notas de evaluación</Label>
          <Textarea
            id="notas-evaluacion"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Contexto relevante para empezar a evaluar este caso."
          />
        </div>
        <GestionFields
          idPrefix="iniciar-evaluacion"
          fecha={fecha}
          setFecha={setFecha}
          tipo={tipoGestion === "nuevo-cobro" ? undefined : tipoGestion}
        />
      </div>
    </AppDialog>
  );
}
