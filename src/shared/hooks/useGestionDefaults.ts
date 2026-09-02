import { useState } from "react";

import { fechaSugerida, tipoGestionDeCaso } from "@/shared/lib/utils/plazos";
import type { Caso } from "@/shared/types/caso";

/**
 * Precarga la fecha sugerida al abrir un diálogo de gestión o cambiar de
 * caso. Todos los diálogos de gestión lo usan (readme-logica-res.md §5).
 *
 * Sincroniza durante el render (patrón "ajustar estado" de React) en vez de
 * en un efecto, para no encadenar un render extra cada vez que se abre.
 */
export function useGestionDefaults(caso: Caso | null, open: boolean) {
  const [fecha, setFecha] = useState("");
  const [syncKey, setSyncKey] = useState<string | null>(null);

  const key = `${open}:${caso?.id ?? ""}`;
  if (key !== syncKey) {
    setSyncKey(key);
    if (open && caso) {
      const tipo = tipoGestionDeCaso(caso);
      setFecha(tipo === "nuevo-cobro" ? "" : fechaSugerida(tipo));
    }
  }

  return { fecha, setFecha };
}
