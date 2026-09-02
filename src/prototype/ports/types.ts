import { z } from "zod";

/**
 * Referencia a un campo del contrato de datos: entidad.campo en camelCase.
 * Declararlo así deja explícito
 * qué datos reales sostiene cada pantalla — es lo que Desarrollo necesita para
 * escribir la consulta, no solo de qué entidad se lee.
 */
const dataFieldReferenceSchema = z
  .string()
  .regex(
    /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/,
    "Debe referenciar un campo como entidad.campo usando camelCase.",
  );

/** Metadata de una carga de datos (GET): describe qué lee y qué la detona. */
export const readMetaSchema = z
  .object({
    description: z.string().optional(),
    trigger: z.string().optional(),
    reads: z
      .object({
        entities: z.array(z.string()).optional(),
        fields: z.array(dataFieldReferenceSchema).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type ReadMeta = z.infer<typeof readMetaSchema>;

/** Metadata de un evento publicado (POST): describe qué escribe y qué lo detona. */
export const writeMetaSchema = z
  .object({
    description: z.string().optional(),
    trigger: z.string().optional(),
    writes: z
      .object({
        entities: z.array(z.string()).optional(),
        fields: z.array(dataFieldReferenceSchema).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type WriteMeta = z.infer<typeof writeMetaSchema>;

/** Lo que devuelve publish(): el id del hecho creado y el código HTTP. */
export const eventReceiptSchema = z.object({
  eventId: z.string(),
  status: z.number().int().min(100).max(599),
});

export type EventReceipt = z.infer<typeof eventReceiptSchema>;

/** Lectura (GET): resuelve y devuelve datos; un error se lanza como excepción. */
export interface LexyReadPort {
  load<T = unknown>(loadId: string, params?: unknown, meta?: ReadMeta): Promise<T>;
}

/** Escritura (POST): registra un hecho y devuelve su receipt. */
export interface LexyWritePort {
  publish(eventId: string, payload: unknown, meta?: WriteMeta): Promise<EventReceipt>;
}
