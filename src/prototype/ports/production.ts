import type { LexyReadPort, LexyWritePort } from "./types";

export const productionRead: LexyReadPort = {
  async load<T = unknown>(loadId: string): Promise<T> {
    throw new Error(
      '[lexy] productionRead.load("' + loadId + '") sin implementar: conéctalo al GET de tu API.',
    );
  },
};

export const productionWrite: LexyWritePort = {
  async publish(eventId: string) {
    throw new Error(
      '[lexy] productionWrite.publish("' + eventId + '") sin implementar: encólalo en el worker.',
    );
  },
};
