export type DesignerActivityRecordInput = {
  kind: "load" | "event";
  label?: string;
  technicalId?: string;
  triggerId?: string;
  input?: unknown;
};

export type DesignerActivityRecord = {
  id: string;
  occurredAt: string;
  kind: "load" | "event";
  label: string;
  technicalId?: string;
  triggerId?: string;
  inputPreview?: string;
};

export type DesignerActivityRecorder = {
  record(input: DesignerActivityRecordInput): void;
};

export type DesignerActivityStore = DesignerActivityRecorder & {
  getSnapshot(): readonly DesignerActivityRecord[];
  subscribe(listener: () => void): () => void;
  clear(): void;
};

const preview = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "[no serializable]";
  }
};

const tabId = Math.random().toString(36).slice(2, 8);

type ChannelMessage =
  | { type: "record"; record: DesignerActivityRecord }
  | { type: "clear" }
  | { type: "syncRequest" }
  | { type: "sync"; records: DesignerActivityRecord[] };

export const createDesignerActivityStore = (maxItems = 80): DesignerActivityStore => {
  const listeners = new Set<() => void>();
  let records: DesignerActivityRecord[] = [];
  let sequence = 0;
  let synced = false;

  const channel =
    typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("lexy-designer-activity") : null;

  const notify = () => {
    for (const listener of listeners) listener();
  };

  const addRecord = (record: DesignerActivityRecord) => {
    records = [record, ...records].slice(0, maxItems);
    notify();
  };

  if (channel) {
    channel.onmessage = (event: MessageEvent<ChannelMessage>) => {
      const message = event.data;
      if (message.type === "record") addRecord(message.record);
      else if (message.type === "clear") {
        records = [];
        notify();
      } else if (message.type === "syncRequest") {
        channel.postMessage({ type: "sync", records });
      } else if (message.type === "sync" && !synced && records.length === 0) {
        synced = true;
        records = message.records.slice(0, maxItems);
        notify();
      }
    };
    channel.postMessage({ type: "syncRequest" });
  }

  return {
    getSnapshot: () => records,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    record: (input) => {
      sequence += 1;
      const record: DesignerActivityRecord = {
        id: tabId + "_" + sequence,
        occurredAt: new Date().toISOString(),
        kind: input.kind,
        label: input.label ?? input.technicalId ?? "evento",
        ...(input.technicalId ? { technicalId: input.technicalId } : {}),
        ...(input.triggerId ? { triggerId: input.triggerId } : {}),
        ...(preview(input.input) ? { inputPreview: preview(input.input) } : {}),
      };
      addRecord(record);
      channel?.postMessage({ type: "record", record });
    },
    clear: () => {
      records = [];
      notify();
      channel?.postMessage({ type: "clear" });
    },
  };
};

export const designerActivity = createDesignerActivityStore();
