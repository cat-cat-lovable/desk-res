import { useState } from "react";

/**
 * Corre `reset()` cada vez que `key` cambia a un valor no nulo — típicamente
 * cuando un diálogo se abre (`open ? caso.id : null`, o `open ? "nuevo" :
 * null` para un diálogo de creación). Ajusta estado durante el render en vez
 * de en un efecto, para no encadenar un render extra.
 */
export function useResetOnOpen(key: string | null, reset: () => void) {
  const [syncKey, setSyncKey] = useState<string | null>(null);
  if (key !== syncKey) {
    setSyncKey(key);
    if (key !== null) reset();
  }
}
