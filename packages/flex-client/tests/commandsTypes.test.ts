import { isKnownCommand, type Command } from "../src/types";

test("isKnownCommand narrows known command types", () => {
  const known: Command = {
    id: "c1",
    key: "k1",
    commandType: "aspirate",
    status: "succeeded",
    createdAt: "2026-03-29T00:00:00Z",
    params: {
      pipetteId: "p1",
      labwareId: "lw1",
      wellName: "A1",
      wellLocation: { origin: "top" },
      volume: 10,
      flowRate: 5,
    },
  };
  const unknown: Command = {
    id: "c2",
    key: "k2",
    commandType: "customCommand",
    status: "queued",
    createdAt: "2026-03-29T00:00:00Z",
    params: {},
  };

  expect(isKnownCommand(known)).toBe(true);
  expect(isKnownCommand(unknown)).toBe(false);
});
