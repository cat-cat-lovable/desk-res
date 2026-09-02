import { formatFechaCorta, formatMonto } from "@/shared/lib/utils/format";
import type { ActaDerivacion } from "@/shared/types/caso";

interface ContextoDerivacionSummaryProps {
  acta: ActaDerivacion | undefined;
  estrategia: string | undefined;
  tacticas: string | undefined;
  vecesDerivado: number;
}

/**
 * Contexto para quien genera el nuevo cobro de un caso derivado (motivo
 * "Cambio de servicio"): motivo del cambio, derivaciones anteriores, datos
 * del caso y cuántas veces ya fue derivado (dentro de este Desk).
 * Estrategia y tácticas ya no viven en el acta —son campos scrapeados que
 * existen para todo tipo de caso, ver `AgregarCasoDialog`— así que se
 * reciben aparte. Se muestra junto a `CobroAnteriorSummary` (cuánto se le
 * cobró y cuánto ha pagado del cobro activo) al abrir `NuevoCobroDialog`.
 */
export function ContextoDerivacionSummary({
  acta,
  estrategia,
  tacticas,
  vecesDerivado,
}: ContextoDerivacionSummaryProps) {
  if (!acta) return null;

  return (
    <section className="space-y-3 rounded-control border border-border-subtle bg-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="type-item-title text-foreground">Contexto de la derivación</h3>
        <span className="type-meta text-muted-foreground">
          {vecesDerivado <= 1 ? "Primera derivación" : `Derivación N.º ${vecesDerivado}`}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Campo label="Monto deuda a contratar" value={formatMonto(acta.montoDeuda)} />
        <Campo label="Acreedor" value={acta.acreedores} />
        <Campo
          label="Fecha pago primera cuota"
          value={acta.fechaPagoPrimeraCuota ? formatFechaCorta(acta.fechaPagoPrimeraCuota) : "—"}
        />
      </div>
      <Campo label="Motivo del cambio de servicio" value={acta.resumen} />
      <Campo
        label="Derivaciones realizadas"
        value={
          acta.huboDerivacionAnterior
            ? (acta.derivacionAnteriorServicio ?? "Ha sido derivado antes")
            : "Ninguna"
        }
      />
      {acta.huboDerivacionAnterior && acta.derivacionAnteriorMotivo && (
        <Campo label="Motivo de la derivación anterior" value={acta.derivacionAnteriorMotivo} />
      )}
      <Campo label="Estrategia" value={estrategia} />
      <Campo label="Tácticas" value={tacticas} />
    </section>
  );
}

function Campo({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <p className="type-meta text-muted-foreground">{label}</p>
      <p className="type-body text-foreground">{value}</p>
    </div>
  );
}
