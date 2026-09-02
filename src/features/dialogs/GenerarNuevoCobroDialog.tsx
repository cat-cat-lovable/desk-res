import * as React from "react";

import { AppDialog } from "@/shared/components/base/AppDialog";
import { Input } from "@/shared/components/base/Input";
import { Label } from "@/shared/components/base/Label";
import { toast } from "@/shared/components/base/Toaster";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { normalizarMonto } from "@/shared/lib/utils/format";
import type { Caso } from "@/shared/types/caso";

export interface GenerarNuevoCobroDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

/**
 * Modificación de contrato · "Agregar nuevo acreedor": el caso siempre
 * procede, así que este diálogo reemplaza la pregunta "¿procede o no
 * procede?" — confirma los datos del acreedor y genera el cobro en Apio de
 * una vez. Después de generarlo no hay más acción en la app: el caso queda
 * en "En evaluación" hasta que el cliente lo acepte en Apio, que es lo que
 * lo pasa a "Resuelto" (fuera de este prototipo).
 */
export function GenerarNuevoCobroDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: GenerarNuevoCobroDialogProps) {
  const [nombreAcreedor, setNombreAcreedor] = React.useState("");
  const [montoNuevoContrato, setMontoNuevoContrato] = React.useState("");
  const [cuotas, setCuotas] = React.useState("");
  const [valorPrimeraCuota, setValorPrimeraCuota] = React.useState("");

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setNombreAcreedor(caso?.acreedor?.nombre ?? "");
    setMontoNuevoContrato(caso?.acreedor ? String(caso.acreedor.montoContratoActual) : "");
    setCuotas(caso?.acreedor ? String(caso.acreedor.cuotas) : "");
    setValorPrimeraCuota(caso?.acreedor ? String(caso.acreedor.valorPrimeraCuota) : "");
  });

  if (!caso) return null;

  const puedeConfirmar =
    nombreAcreedor.trim() !== "" &&
    montoNuevoContrato !== "" &&
    cuotas !== "" &&
    valorPrimeraCuota !== "";

  const handleConfirm = async () => {
    await actualizarCaso(
      caso.id,
      {
        acreedor: {
          ...caso.acreedor,
          nombre: nombreAcreedor.trim(),
          montoContratoActual: normalizarMonto(montoNuevoContrato),
          cuotas: Number(cuotas),
          valorPrimeraCuota: normalizarMonto(valorPrimeraCuota),
        },
        nuevoCobro: {
          estado: "esperando-cliente",
          aplica: true,
          valor: normalizarMonto(montoNuevoContrato),
        },
        estadoProceso: "en-evaluacion",
        cerrado: false,
      },
      "nuevoCobroGenerado",
      {
        description: "Se genera el nuevo cobro en Apio para el acreedor",
        trigger: "Botón «Generar nuevo cobro»",
        fields: ["acreedor", "nuevoCobro", "estadoProceso"],
      },
    );
    toast.success("Nuevo cobro generado", {
      description: `Caso de ${caso.cliente.nombre}. Queda esperando que el cliente lo acepte en Apio.`,
    });
    onSaved();
  };

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Generar nuevo cobro"
      description={`Caso de ${caso.cliente.nombre}. Se crea en Apio y queda esperando que el cliente lo acepte.`}
      confirmLabel="Generar nuevo cobro"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="generar-cobro-nombre-acreedor" required>
            Nombre del acreedor
          </Label>
          <Input
            id="generar-cobro-nombre-acreedor"
            value={nombreAcreedor}
            onChange={(e) => setNombreAcreedor(e.target.value)}
            placeholder="Ej: CMR Falabella"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="generar-cobro-monto" required>
            Monto nuevo contrato
          </Label>
          <Input
            id="generar-cobro-monto"
            inputMode="numeric"
            value={montoNuevoContrato}
            onChange={(e) => setMontoNuevoContrato(e.target.value)}
            placeholder="$0"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="generar-cobro-cuotas" required>
              Número de cuotas
            </Label>
            <Input
              id="generar-cobro-cuotas"
              inputMode="numeric"
              value={cuotas}
              onChange={(e) => setCuotas(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="generar-cobro-valor-primera-cuota" required>
              Valor primera cuota
            </Label>
            <Input
              id="generar-cobro-valor-primera-cuota"
              inputMode="numeric"
              value={valorPrimeraCuota}
              onChange={(e) => setValorPrimeraCuota(e.target.value)}
              placeholder="$0"
            />
          </div>
        </div>
      </div>
    </AppDialog>
  );
}
