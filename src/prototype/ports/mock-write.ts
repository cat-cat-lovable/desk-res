import { designerActivity } from "../designer-panel/designer-activity";
import { type JsonValue, mockStore } from "../mock-store/mock-store";
import { catalog } from "./catalog";
import { type EventReceipt, type LexyWritePort, type WriteMeta, writeMetaSchema } from "./types";

const isPlainObject = (value: unknown): value is Record<string, JsonValue> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

let publicationSequence = 0;

export const mockWrite: LexyWritePort = {
  async publish(eventId: string, payload: unknown, rawMeta: WriteMeta = {}): Promise<EventReceipt> {
    const parsed = writeMetaSchema.safeParse(rawMeta);
    if (!parsed.success) {
      console.warn(
        '[lexy] Metadata de evento inválida para "' + eventId + '":',
        parsed.error.flatten().fieldErrors,
      );
    }
    const meta: WriteMeta = parsed.success ? parsed.data : {};

    const entityId = meta.writes?.entities?.[0];
    const fields = isPlainObject(payload) ? payload : {};
    let created = false;

    if (entityId) {
      mockStore.transact((draft) => {
        const records = (draft.entities[entityId] ??= []);
        const targetId = fields.id;
        const existing =
          targetId === undefined || targetId === null
            ? undefined
            : records.find((record) => String(record.id) === String(targetId));

        if (existing) {
          // Fusiona: los campos que el evento no trae se conservan.
          Object.assign(existing, fields);
          return;
        }

        const nextId = draft.entitySequences[entityId] ?? records.length + 1;
        records.push({ id: String(nextId), ...fields });
        draft.entitySequences[entityId] = nextId + 1;
        created = true;
      });
    }

    publicationSequence += 1;
    const receipt: EventReceipt = {
      eventId: eventId + "_" + publicationSequence,
      // 201 solo si de verdad nació un registro; 200 si actualizó o si el evento
      // no declara entidad. El receipt es lo único que dice qué tipo de
      // escritura ocurrió, y el panel lo muestra.
      status: created ? 201 : 200,
    };
    catalog.recordEvent(eventId, payload, meta, receipt);
    designerActivity.record({
      kind: "event",
      label: meta.description ?? eventId,
      technicalId: eventId,
      triggerId: meta.trigger,
      input: payload,
    });
    return receipt;
  },
};
