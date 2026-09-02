import { Upload, X } from "lucide-react";
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
import { toast } from "@/shared/components/base/Toaster";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { comprobantePrueba, CUOTAS_PRUEBA, MONTO_PRUEBA } from "@/shared/lib/utils/datosPrueba";
import { archivoADocumento } from "@/shared/lib/utils/documentos";
import { formatMonto, normalizarMonto } from "@/shared/lib/utils/format";
import type { Caso } from "@/shared/types/caso";

import { CobroAnteriorSummary } from "../CobroAnteriorSummary";

export interface ConfirmarReembolsoBajaDialogProps {
  caso: Caso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="min-w-0">
      <p className="type-meta text-muted-foreground">{label}</p>
      <p className="type-body truncate text-foreground">{value}</p>
    </div>
  );
}

export function ConfirmarReembolsoBajaDialog({
  caso,
  open,
  onOpenChange,
  onSaved,
}: ConfirmarReembolsoBajaDialogProps) {
  const [monto, setMonto] = React.useState("");
  const [cuotas, setCuotas] = React.useState("");
  const [comprobantes, setComprobantes] = React.useState<File[]>([]);
  const inputComprobanteRef = React.useRef<HTMLInputElement>(null);

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setMonto(caso?.montoReembolso ? String(caso.montoReembolso) : MONTO_PRUEBA);
    setCuotas(caso?.cuotasReembolso ? String(caso.cuotasReembolso) : CUOTAS_PRUEBA);
    setComprobantes([comprobantePrueba()]);
  });

  if (!caso) return null;

  const puedeConfirmar = Boolean(monto) && comprobantes.length > 0;

  const agregarComprobantes = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setComprobantes((prev) => [...prev, ...Array.from(files)]);
  };

  const quitarComprobante = (index: number) => {
    setComprobantes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    await actualizarCaso(
      caso.id,
      {
        montoReembolso: normalizarMonto(monto),
        cuotasReembolso: cuotas ? Number(cuotas) : caso.cuotasReembolso,
        reembolsoConfirmacionBaja: { estado: "confirmado" },
        pendienteConfirmacion: undefined,
        estadoProceso: "resuelto",
        cerrado: true,
        documentos: [...(caso.documentos ?? []), ...comprobantes.map(archivoADocumento)],
        detalleResolucion: `Depósito confirmado por ${formatMonto(normalizarMonto(monto))}. Comprobante adjunto: ${comprobantes.map((f) => f.name).join(", ")}.`,
      },
      "reembolsoBajaConfirmado",
      {
        description: "Se confirma el depósito del reembolso o de la baja",
        trigger: "Diálogo de confirmar depósito",
        fields: [
          "montoReembolso",
          "cuotasReembolso",
          "reembolsoConfirmacionBaja",
          "pendienteConfirmacion",
          "estadoProceso",
          "cerrado",
          "documentos",
        ],
      },
    );
    toast.success("Depósito confirmado: caso resuelto", {
      description: `Caso de ${caso.cliente.nombre}`,
    });
    onSaved();
  };

  const tieneDatosTransferencia = Boolean(
    caso.cuentaBanco || caso.cuentaNumero || caso.montoReembolso,
  );

  return (
    <AppDialog
      trigger={<span className="hidden" />}
      open={open}
      onOpenChange={onOpenChange}
      title="Confirmar depósito"
      description={`Caso de ${caso.cliente.nombre}. Cierra el caso al confirmar.`}
      confirmLabel="Confirmar depósito"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
    >
      <div className="space-y-4">
        {tieneDatosTransferencia && (
          <Accordion
            type="single"
            collapsible
            defaultValue="datos-transferencia"
            className="rounded-control border border-border-subtle bg-muted/40 px-3"
          >
            <AccordionItem value="datos-transferencia" className="border-none">
              <AccordionTrigger iconPosition="start">Datos para transferir</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Campo label="Titular" value={caso.cuentaTitular} />
                  <Campo label="Banco" value={caso.cuentaBanco} />
                  <Campo label="Tipo de cuenta" value={caso.cuentaTipo} />
                  <Campo label="Número de cuenta" value={caso.cuentaNumero} />
                  <Campo
                    label="Monto a transferir"
                    value={caso.montoReembolso && formatMonto(caso.montoReembolso)}
                  />
                  <Campo label="Cuotas" value={caso.cuotasReembolso} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        <CobroAnteriorSummary cobro={caso.cobroAnterior} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="deposito-monto">Monto depositado</Label>
            <Input
              id="deposito-monto"
              inputMode="numeric"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deposito-cuotas">Cuotas reembolsadas</Label>
            <Input
              id="deposito-cuotas"
              type="number"
              min={1}
              value={cuotas}
              onChange={(e) => setCuotas(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="deposito-comprobante" required>
            Comprobante de depósito
          </Label>
          <input
            ref={inputComprobanteRef}
            id="deposito-comprobante"
            type="file"
            multiple
            accept=".pdf,image/*"
            className="hidden"
            onChange={(e) => {
              agregarComprobantes(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputComprobanteRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 type-supporting text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Upload className="size-(--icon-size-inline)" aria-hidden="true" />
            Adjuntar comprobante (PDF o imagen)
          </button>
          {comprobantes.length > 0 && (
            <ul className="space-y-1 pt-1">
              {comprobantes.map((archivo, i) => (
                <li
                  key={`${archivo.name}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-control bg-muted px-2.5 py-1.5"
                >
                  <span className="truncate type-supporting text-foreground">{archivo.name}</span>
                  <button
                    type="button"
                    aria-label={`Quitar ${archivo.name}`}
                    onClick={() => quitarComprobante(i)}
                    className="shrink-0 rounded-control p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <X className="size-(--icon-size-inline)" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppDialog>
  );
}
