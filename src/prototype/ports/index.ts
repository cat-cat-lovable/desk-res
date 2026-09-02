import { mockRead } from "./mock-read";
import { mockWrite } from "./mock-write";
import { productionRead, productionWrite } from "./production";
import type { LexyReadPort, LexyWritePort } from "./types";

// VITE_LEXY_PROTOTYPE=false → adapters reales. Sin la variable: prototipo.
const USE_MOCK = import.meta.env.VITE_LEXY_PROTOTYPE !== "false";

export const read: LexyReadPort = USE_MOCK ? mockRead : productionRead;
export const write: LexyWritePort = USE_MOCK ? mockWrite : productionWrite;

export type { EventReceipt, LexyReadPort, LexyWritePort, ReadMeta, WriteMeta } from "./types";
