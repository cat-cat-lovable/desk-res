import * as React from "react";

import { AppDialog } from "@/shared/components/base/AppDialog";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
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
import type { Caso, EstadoProceso, TipoCaso } from "@/shared/types/caso";

import { CobroAnteriorSummary } from "../CobroAnteriorSummary";

export interface EditarCasoDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const TIPO_CASO_LABEL: Record<TipoCaso, string> = {
  reevaluacion: "Reevaluación",
  reembolso: "Reembolso",
  "modificacion-contrato": "Modificación de contrato",
  derivacion: "Derivación",
};

const ESTADO_LABEL: Record<EstadoProceso, string> = {
  "por-evaluar": "Por evaluar",
  "en-evaluacion": "En evaluación",
  resuelto: "Resuelto",
};

export function EditarCasoDialog({ caso, open, onOpenChange, onSaved }: EditarCasoDialogProps) {
  const [tipoCaso, setTipoCaso] = React.useState<TipoCaso>("reevaluacion");
  const [estadoProceso, setEstadoProceso] = React.useState<EstadoProceso>("por-evaluar");
  const [resumenInterno, setResumenInterno] = React.useState("");
  const [etapaStreak, setEtapaStreak] = React.useState("");

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setTipoCaso(caso?.tipoCaso ?? "reevaluacion");
    setEstadoProceso(caso?.estadoProceso ?? "por-evaluar");
    setResumenInterno(caso?.notasEvaluacion ?? "");
    setEtapaStreak(caso?.etapaStreak ?? "");
  });

  if (!caso) return null;

  const handleConfirm = async () => {
    await actualizarCaso(
      caso.id,
      {
        tipoCaso,
        estadoProceso,
        notasEvaluacion: resumenInterno || undefined,
        etapaStreak: etapaStreak || undefined,
        cerrado: estadoProceso === "resuelto" ? caso.cerrado : false,
      },
      "casoEditado",
      {
        description: "Se edita el caso",
        trigger: "Acción editar",
        fields: ["tipoCaso", "estadoProceso", "notasEvaluacion", "etapaStreak"],
      },
    );
    toast.success("Caso actualizado", { description: `Caso de ${caso.cliente.nombre}` });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Editar caso"
      description={`Caso de ${caso.cliente.nombre}`}
      confirmLabel="Guardar cambios"
      onConfirm={handleConfirm}
    >
      <div className="space-y-4">
        <CobroAnteriorSummary cobro={caso.cobroAnterior} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="editar-tipo">Tipo</Label>
            <Select value={tipoCaso} onValueChange={(v) => setTipoCaso(v as TipoCaso)}>
              <SelectTrigger id="editar-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TIPO_CASO_LABEL) as [TipoCaso, string][]).map(([valor, label]) => (
                  <SelectItem key={valor} value={valor}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="editar-estado">Estado</Label>
            <Select
              value={estadoProceso}
              onValueChange={(v) => setEstadoProceso(v as EstadoProceso)}
            >
              <SelectTrigger id="editar-estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ESTADO_LABEL) as [EstadoProceso, string][]).map(
                  ([valor, label]) => (
                    <SelectItem key={valor} value={valor}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="editar-etapa-streak">Etapa</Label>
          <Input
            id="editar-etapa-streak"
            value={etapaStreak}
            onChange={(e) => setEtapaStreak(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="editar-resumen-interno">Resumen interno</Label>
          <Textarea
            id="editar-resumen-interno"
            value={resumenInterno}
            onChange={(e) => setResumenInterno(e.target.value)}
          />
        </div>
      </div>
    </AppDialog>
  );
}
