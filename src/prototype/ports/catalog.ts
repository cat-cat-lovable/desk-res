import type { EventReceipt, ReadMeta, WriteMeta } from "./types";

export type CatalogEvent = {
  kind: "event";
  technicalId: string;
  description: string;
  trigger: string;
  writes: { entities: string[]; fields: string[] };
  lastPayload: unknown;
  lastReceipt: EventReceipt | null;
};

export type CatalogLoad = {
  kind: "load";
  technicalId: string;
  description: string;
  trigger: string;
  reads: { entities: string[]; fields: string[] };
  lastParams: unknown;
};

export type CatalogEntry = CatalogEvent | CatalogLoad;

type CatalogMessage =
  | { type: "entry"; entry: CatalogEntry }
  | { type: "syncRequest" }
  | { type: "sync"; entries: CatalogEntry[] };

const createCatalog = () => {
  const store = new Map<string, CatalogEntry>();
  const listeners = new Set<() => void>();
  let snapshot: CatalogEntry[] = [];
  let synced = false;

  const channel =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("lexy-ports-catalog") : null;

  const key = (entry: CatalogEntry) => entry.kind + ":" + entry.technicalId;

  const notify = () => {
    snapshot = Array.from(store.values());
    for (const l of listeners) l();
  };

  const apply = (entry: CatalogEntry) => {
    store.set(key(entry), entry);
    notify();
  };

  if (channel) {
    channel.onmessage = (ev: MessageEvent<CatalogMessage>) => {
      const msg = ev.data;
      if (msg.type === "entry") apply(msg.entry);
      else if (msg.type === "syncRequest")
        channel.postMessage({ type: "sync", entries: Array.from(store.values()) });
      else if (msg.type === "sync" && !synced && store.size === 0) {
        synced = true;
        for (const entry of msg.entries) store.set(key(entry), entry);
        notify();
      }
    };
    channel.postMessage({ type: "syncRequest" });
  }

  const publishEntry = (entry: CatalogEntry) => {
    store.set(key(entry), entry);
    notify();
    channel?.postMessage({ type: "entry", entry });
  };

  return {
    recordEvent(technicalId: string, payload: unknown, meta: WriteMeta, receipt: EventReceipt) {
      const existing = store.get("event:" + technicalId);
      const prev = existing?.kind === "event" ? existing : undefined;
      publishEntry({
        kind: "event",
        technicalId,
        description: meta.description ?? prev?.description ?? "",
        trigger: meta.trigger ?? prev?.trigger ?? "",
        writes: {
          entities: meta.writes?.entities ?? prev?.writes.entities ?? [],
          fields: meta.writes?.fields ?? prev?.writes.fields ?? [],
        },
        lastPayload: payload,
        lastReceipt: receipt,
      });
    },
    recordLoad(technicalId: string, params: unknown, meta: ReadMeta) {
      const existing = store.get("load:" + technicalId);
      const prev = existing?.kind === "load" ? existing : undefined;
      publishEntry({
        kind: "load",
        technicalId,
        description: meta.description ?? prev?.description ?? "",
        trigger: meta.trigger ?? prev?.trigger ?? "",
        reads: {
          entities: meta.reads?.entities ?? prev?.reads.entities ?? [],
          fields: meta.reads?.fields ?? prev?.reads.fields ?? [],
        },
        lastParams: params,
      });
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSnapshot: () => snapshot,
  };
};

export const catalog = createCatalog();
