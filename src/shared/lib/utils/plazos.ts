// Plazos sugeridos por tipo de gestión.
// Ver readme-logica-res.md §5.

import type { Caso } from "@/shared/types/caso";

export type TipoGestion =
  "derivacion" | "baja" | "acreedor" | "mal-vendido" | "reembolso" | "nuevo-cobro";

export function tipoGestionDeCaso(caso: Caso): TipoGestion {
  if (caso.tipoCaso === "reembolso") return "reembolso";
  if (caso.tipoCaso === "modificacion-contrato") return "acreedor";
  if (caso.tipoCaso === "derivacion") return "derivacion";
  if (caso.motivo === "Posible mal vendido") return "mal-vendido";
  if (caso.motivo === "Cambio de servicio") return "derivacion";
  return "baja";
}

const RANGOS_PLAZO: Record<Exclude<TipoGestion, "nuevo-cobro">, readonly [number, number]> = {
  derivacion: [5, 7],
  baja: [3, 3],
  acreedor: [3, 5],
  "mal-vendido": [3, 5],
  reembolso: [2, 5],
};

const esDiaHabil = (fecha: Date): boolean => {
  const dia = fecha.getDay();
  return dia !== 0 && dia !== 6;
};

const sumarDiasHabiles = (base: Date, dias: number): Date => {
  const fecha = new Date(base);
  let restantes = dias;
  while (restantes > 0) {
    fecha.setDate(fecha.getDate() + 1);
    if (esDiaHabil(fecha)) restantes -= 1;
  }
  return fecha;
};

const toIsoDate = (fecha: Date): string => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Suma días hábiles (excluye sábado/domingo) al extremo superior del rango, desde hoy. */
export function fechaSugerida(tipo: Exclude<TipoGestion, "nuevo-cobro">, hoy = new Date()): string {
  const [, max] = RANGOS_PLAZO[tipo];
  return toIsoDate(sumarDiasHabiles(hoy, max));
}

export function textoPlazoSugerido(tipo: Exclude<TipoGestion, "nuevo-cobro">): string {
  const [min, max] = RANGOS_PLAZO[tipo];
  return `Sugerido: ${min} a ${max} días hábiles para resolver`;
}
