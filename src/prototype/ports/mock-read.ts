import { designerActivity } from "../designer-panel/designer-activity";
import { type MockEntityRecord, mockStore } from "../mock-store/mock-store";
import { catalog } from "./catalog";
import { type LexyReadPort, type ReadMeta, readMetaSchema } from "./types";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const mockRead: LexyReadPort = {
  async load<T = unknown>(loadId: string, params?: unknown, rawMeta: ReadMeta = {}): Promise<T> {
    const parsed = readMetaSchema.safeParse(rawMeta);
    if (!parsed.success) {
      console.warn(
        '[lexy] Metadata de carga inválida para "' + loadId + '":',
        parsed.error.flatten().fieldErrors,
      );
    }
    const meta: ReadMeta = parsed.success ? parsed.data : {};
    catalog.recordLoad(loadId, params, meta);

    const entityId = meta.reads?.entities?.[0];
    const all = entityId ? (mockStore.getSnapshot().entities[entityId] ?? []) : [];
    // Filtro genérico: si params es un objeto, exige coincidencia exacta de sus campos.
    const data: MockEntityRecord[] = isPlainObject(params)
      ? all.filter((record) =>
          Object.entries(params).every(([field, value]) => record[field] === value),
        )
      : all;
    designerActivity.record({
      kind: "load",
      label: meta.description ?? loadId,
      technicalId: loadId,
      triggerId: meta.trigger,
      input: params,
    });
    return data as T;
  },
};
