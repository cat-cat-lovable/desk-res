// Formato de montos y fechas en español chileno (es-CL). Ver readme-logica-res.md §9.

const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

/** 350000 → "$350.000" */
export function formatMonto(monto: number): string {
  return clpFormatter.format(monto);
}

/** "$350.000" o "350.000" → 350000 */
export function normalizarMonto(valor: string): number {
  const digitos = valor.replace(/[^0-9]/g, "");
  return digitos ? Number.parseInt(digitos, 10) : 0;
}

const fechaLargaFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const fechaCortaFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const parseFechaIso = (fechaIso: string): Date => {
  const [year, month, day] = fechaIso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** "2025-10-08" → "8 de octubre de 2025" */
export function formatFechaLarga(fechaIso: string): string {
  return fechaLargaFormatter.format(parseFechaIso(fechaIso));
}

/** "2026-06-30" → "30 jun 2026" */
export function formatFechaCorta(fechaIso: string): string {
  return fechaCortaFormatter.format(parseFechaIso(fechaIso)).replace(".", "");
}

/** "2026-06-30" → Date (para DatePicker). Cadena vacía → undefined. */
export function isoToDate(fechaIso: string | undefined): Date | undefined {
  return fechaIso ? parseFechaIso(fechaIso) : undefined;
}

/** Date (de DatePicker) → "2026-06-30". */
export function dateToIso(fecha: Date | undefined): string {
  if (!fecha) return "";
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Fecha de hoy en ISO, para sellar el momento de una acción del usuario. */
export function hoyIso(): string {
  return dateToIso(new Date());
}
