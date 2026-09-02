import { fixtures } from "./fixtures";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type MockEntityRecord = Record<string, JsonValue>;

export type PrototypeMockState = {
  datasetVersion: number;
  entities: Record<string, MockEntityRecord[]>;
  entitySequences: Record<string, number>;
};

export type MockStorage = {
  read(): string | null;
  write(value: string): void;
  remove(): void;
};

export type PrototypeMockStore = {
  getSnapshot(): PrototypeMockState;
  subscribe(listener: () => void): () => void;
  transact(operation: (draft: PrototypeMockState) => void): PrototypeMockState;
  clearPersistence(): void;
};

const STORAGE_KEY = "lexy:prototype:mock-store:v1";

const clone = <T>(value: T): T => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
};

const buildSequences = (entities: Record<string, MockEntityRecord[]>) => {
  const sequences: Record<string, number> = {};
  for (const [entityId, records] of Object.entries(entities)) {
    sequences[entityId] = records.length + 1;
  }
  return sequences;
};

const stateFromFixtures = (): PrototypeMockState => {
  const entities = clone(fixtures.entities);
  return {
    datasetVersion: fixtures.datasetVersion,
    entities,
    entitySequences: buildSequences(entities),
  };
};

const isCompatible = (value: unknown): value is PrototypeMockState => {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<PrototypeMockState>;
  return (
    state.datasetVersion === fixtures.datasetVersion &&
    Boolean(state.entities && typeof state.entities === "object") &&
    Boolean(state.entitySequences && typeof state.entitySequences === "object")
  );
};

const createMemoryStorage = (): MockStorage => {
  let current: string | null = null;
  return {
    read: () => current,
    write: (value) => {
      current = value;
    },
    remove: () => {
      current = null;
    },
  };
};

const createLocalStorageStorage = (key: string): MockStorage => {
  const memory = createMemoryStorage();
  const getLocalStorage = () => {
    try {
      return globalThis.localStorage;
    } catch {
      return undefined;
    }
  };
  return {
    read: () => {
      try {
        return getLocalStorage()?.getItem(key) ?? memory.read();
      } catch {
        return memory.read();
      }
    },
    write: (value) => {
      memory.write(value);
      try {
        getLocalStorage()?.setItem(key, value);
      } catch {
        // fallback en memoria
      }
    },
    remove: () => {
      memory.remove();
      try {
        getLocalStorage()?.removeItem(key);
      } catch {
        // fallback en memoria
      }
    },
  };
};

export const createPrototypeMockStore = (
  storage: MockStorage = createLocalStorageStorage(STORAGE_KEY),
): PrototypeMockStore => {
  const listeners = new Set<() => void>();

  const hydrate = (): PrototypeMockState => {
    const persisted = storage.read();
    if (!persisted) return stateFromFixtures();
    try {
      const parsed = JSON.parse(persisted) as unknown;
      // Al cambiar fixtures se sube datasetVersion: el estado viejo se descarta.
      if (isCompatible(parsed)) return parsed;
    } catch {
      // estado corrupto: reinicia desde fixtures
    }
    return stateFromFixtures();
  };

  let snapshot = hydrate();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    transact: (operation) => {
      const draft = clone(snapshot);
      operation(draft);
      snapshot = draft;
      storage.write(JSON.stringify(snapshot));
      notify();
      return snapshot;
    },
    clearPersistence: () => storage.remove(),
  };
};

/** Instancia compartida que ven el adapter de lectura y el de escritura. */
export const mockStore = createPrototypeMockStore();

export const findRecordById = (
  records: readonly MockEntityRecord[],
  fieldId: string,
  id: JsonPrimitive,
) => records.find((record) => record[fieldId] === id);
