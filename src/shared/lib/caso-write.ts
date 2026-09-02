import { read, write } from "@/prototype/ports";
import type { Caso } from "@/shared/types/caso";

/** Actualiza un caso existente (write.publish funde por id) y devuelve la lista recargada. */
export async function actualizarCaso(
  casoId: string,
  patch: Partial<Caso>,
  eventId: string,
  meta: { description: string; trigger: string; fields: string[] },
) {
  await write.publish(
    eventId,
    { id: casoId, ...patch },
    {
      description: meta.description,
      trigger: meta.trigger,
      writes: { entities: ["caso"], fields: meta.fields.map((f) => `caso.${f}`) },
    },
  );
}

export async function crearCaso(
  caso: Omit<Caso, "id">,
  eventId: string,
  meta: { description: string; trigger: string; fields: string[] },
) {
  await write.publish(eventId, caso, {
    description: meta.description,
    trigger: meta.trigger,
    writes: { entities: ["caso"], fields: meta.fields.map((f) => `caso.${f}`) },
  });
}

export async function recargarCasos(): Promise<Caso[]> {
  return read.load<Caso[]>(
    "casosDelDeskRes",
    {},
    {
      description: "Casos del Desk ReS",
      trigger: "Al recargar tras una gestión",
      reads: { entities: ["caso"], fields: ["caso.id", "caso.estadoProceso"] },
    },
  );
}
