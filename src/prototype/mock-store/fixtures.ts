import type { Caso } from "@/shared/types/caso";

import type { MockEntityRecord } from "./mock-store";

export type Fixtures = {
  datasetVersion: number;
  entities: Record<string, MockEntityRecord[]>;
};

/**
 * Datos sintéticos, deterministas y revisables en PR. Sin Math.random(),
 * Date.now() ni new Date(). Contexto chileno (es-CL, teléfonos +56, fechas
 * ISO, CLP entero, correos example.com).
 *
 * Sin casos de ejemplo por decisión de diseño (2026-08-24): las pestañas
 * "En evaluación" y "Resueltos" arrancan vacías para recorrer ese estado.
 * Los 10 casos de referencia de readme-logica-res.md §9 (cubrían los 4 tipos
 * de caso, los 3 subflujos y varios casos límite) quedan documentados ahí
 * si se necesitan de vuelta.
 */
const casos: Caso[] = [];

export const fixtures: Fixtures = {
  datasetVersion: 3,
  entities: {
    caso: casos as unknown as MockEntityRecord[],
  },
};
