import { DatePicker } from "@/shared/components/base/DatePicker";
import { Label } from "@/shared/components/base/Label";
import { dateToIso, isoToDate } from "@/shared/lib/utils/format";
import { textoPlazoSugerido, type TipoGestion } from "@/shared/lib/utils/plazos";

export interface GestionFieldsProps {
  fecha: string;
  setFecha: (fecha: string) => void;
  tipo?: Exclude<TipoGestion, "nuevo-cobro">;
  idPrefix: string;
}

/** Campo de fecha de gestión que se repite dentro de cada diálogo de gestión. */
export function GestionFields({ fecha, setFecha, tipo, idPrefix }: GestionFieldsProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`${idPrefix}-fecha`}>Plazo de gestión</Label>
      <DatePicker
        id={`${idPrefix}-fecha`}
        className="w-full"
        value={isoToDate(fecha)}
        onChange={(d) => setFecha(dateToIso(d))}
      />
      {tipo && <p className="type-meta text-muted-foreground">{textoPlazoSugerido(tipo)}</p>}
    </div>
  );
}
