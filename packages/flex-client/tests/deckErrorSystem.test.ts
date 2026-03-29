import { HttpClient } from "../src/http";
import { DeckResource } from "../src/resources/DeckResource";
import { ErrorRecoveryResource } from "../src/resources/ErrorRecoveryResource";
import { SystemResource } from "../src/resources/SystemResource";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test("deck getConfiguration returns fixture list", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: [{ cutoutId: "cutoutD3", cutoutFixtureId: "wasteChuteRightAdapterNoCover" }],
    })
  ) as typeof fetch;

  const deck = new DeckResource(new HttpClient("http://robot:31950"));
  const config = await deck.getConfiguration();
  expect(config.data[0]?.cutoutId).toBe("cutoutD3");
});

test("error recovery update patches settings", async () => {
  global.fetch = jest.fn(async () => json(200, { data: { enabled: true } })) as typeof fetch;

  const errorRecovery = new ErrorRecoveryResource(new HttpClient("http://robot:31950"));
  const updated = await errorRecovery.updateSettings({ enabled: true });
  expect(updated.enabled).toBe(true);
});

test("system setTime sends utcTime", async () => {
  global.fetch = jest.fn(async () =>
    json(200, { data: { utcTime: "2026-03-29T10:00:00Z" } })
  ) as typeof fetch;

  const system = new SystemResource(new HttpClient("http://robot:31950"));
  const time = await system.setTime("2026-03-29T10:00:00Z");
  expect(time.utcTime).toBe("2026-03-29T10:00:00Z");
});
