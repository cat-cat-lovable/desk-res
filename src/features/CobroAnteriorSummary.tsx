import { formatFechaCorta, formatMonto } from "@/shared/lib/utils/format";
import type { CobroAnterior } from "@/shared/types/caso";

interface CobroAnteriorSummaryProps {
  cobro: CobroAnterior | undefined;
  /** Omite el título y el recuadro propio — para embeber dentro de un acordeón que ya trae su propio trigger/chrome (ver `NuevoCobroDialog`). */
  hideTitle?: boolean;
}

export function CobroAnteriorSummary({ cobro, hideTitle = false }: CobroAnteriorSummaryProps) {
  if (!cobro) return null;

  const grid = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Campo label="Valor contrato" value={formatMonto(cobro.montoTotal)} />
      <Campo label="Número de cuotas" value={cobro.cuotas} />
      <Campo label="Valor cuota" value={formatMonto(cobro.montoPrimeraCuota)} />
      <Campo label="Fecha cuota" value={formatFechaCorta(cobro.fechaInicio)} />
      <Campo label="Estado pago" value={cobro.pagoPrimeraCuota} />
    </div>
  );

  if (hideTitle) return grid;

  return (
    <section className="space-y-3 rounded-lg border border-border-subtle bg-muted/40 p-3">
      <h3 className="type-item-title text-foreground">Cobro anterior (post venta)</h3>
      {grid}
    </section>
  );
}

function Campo({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0 rounded-md border border-border-subtle bg-background px-2.5 py-1.5">
      <p className="type-supporting font-semibold text-foreground">{label}</p>
      <p className="type-meta truncate text-muted-foreground">{value}</p>
    </div>
  );
}
