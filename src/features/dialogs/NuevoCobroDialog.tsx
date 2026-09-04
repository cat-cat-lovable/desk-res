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
import { Textarea } from "@/shared/components/base/Textarea";
import { toast } from "@/shared/components/base/Toaster";
import { useResetOnOpen } from "@/shared/hooks/useResetOnOpen";
import { actualizarCaso } from "@/shared/lib/caso-write";
import { CUOTAS_PRUEBA, MONTO_PRUEBA } from "@/shared/lib/utils/datosPrueba";
import { normalizarMonto } from "@/shared/lib/utils/format";
import type { Caso } from "@/shared/types/caso";

import { CobroAnteriorSummary } from "../CobroAnteriorSummary";
import { ContextoDerivacionSummary } from "../ContextoDerivacionSummary";

export interface NuevoCobroDialogProps {
  caso: Caso | null;
  casos: Caso[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

/**
 * Define el nuevo cobro y lo manda a Apio de una vez (sin selector de
 * "Estado" ni pasos intermedios de "definido"/"confirmado" — se sacaron a
 * pedido del diseñador). Al confirmar, el caso queda "En evaluación"
 * esperando que el cliente acepte el cobro en Apio; recién ahí (fuera de
 * esta app) el caso pasa a "Resuelto" — no hay simulación de esa
 * aceptación acá, mismo criterio que "Agregar nuevo acreedor"
 * (`GenerarNuevoCobroDialog`). Una vez que `nuevoCobro.estado` queda en
 * `"esperando-cliente"`, `accionPrincipal` ya no ofrece ninguna acción
 * sobre este caso.
 */
export function NuevoCobroDialog({
  caso,
  casos,
  open,
  onOpenChange,
  onSaved,
}: NuevoCobroDialogProps) {
  const [valor, setValor] = React.useState("");
  const [cuotas, setCuotas] = React.useState("");
  const [observaciones, setObservaciones] = React.useState("");

  useResetOnOpen(open && caso ? caso.id : null, () => {
    setValor(caso?.nuevoCobro?.valor ? String(caso.nuevoCobro.valor) : MONTO_PRUEBA);
    setCuotas(caso?.nuevoCobro?.cuotas ? String(caso.nuevoCobro.cuotas) : CUOTAS_PRUEBA);
    setObservaciones(caso?.nuevoCobro?.observaciones ?? "Observación de prueba para el flujo.");
  });

  if (!caso) return null;

  const vecesDerivado = caso.actaDerivacion
    ? casos.filter((c) => c.cliente.correo === caso.cliente.correo && c.actaDerivacion).length
    : 0;

  const puedeConfirmar = Boolean(valor) && Boolean(cuotas);

  const handleConfirm = async () => {
    await actualizarCaso(
      caso.id,
      {
        nuevoCobro: {
          estado: "esperando-cliente",
          aplica: true,
          valor: normalizarMonto(valor),
          cuotas: Number(cuotas),
          observaciones: observaciones || undefined,
          fechaDefinicion: caso.fechaGestion,
        },
        estadoProceso: "en-evaluacion",
        cerrado: false,
      },
      "nuevoCobroGenerado",
      {
        description: "Se genera el nuevo cobro en Apio",
        trigger: "Diálogo de nuevo cobro",
        fields: ["nuevoCobro", "estadoProceso", "cerrado"],
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
      title="Definir nuevo cobro"
      description={`Caso de ${caso.cliente.nombre}. Se crea en Apio y queda esperando que el cliente lo acepte.`}
      confirmLabel="Definir nuevo cobro"
      confirmDisabled={!puedeConfirmar}
      onConfirm={handleConfirm}
    >
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
            <Label htmlFor="nuevo-cobro-valor">Valor contrato</Label>
            <Input
              id="nuevo-cobro-valor"
              inputMode="numeric"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="$0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nuevo-cobro-cuotas">Cuotas</Label>
            <Input
              id="nuevo-cobro-cuotas"
              type="number"
              min={1}
              value={cuotas}
              onChange={(e) => setCuotas(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nuevo-cobro-observaciones">Observaciones</Label>
          <Textarea
            id="nuevo-cobro-observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
      </div>
    </AppDialog>
  );
}
