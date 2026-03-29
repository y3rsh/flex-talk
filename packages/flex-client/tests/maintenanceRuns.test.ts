import { HttpClient } from "../src/http";
import { MaintenanceRunsResource } from "../src/resources/MaintenanceRunsResource";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test("create returns maintenance run", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: {
        id: "m1",
        createdAt: "2026-03-29T00:00:00Z",
        status: "idle",
        current: true,
      },
    })
  ) as typeof fetch;

  const maintenance = new MaintenanceRunsResource(new HttpClient("http://robot:31950"));
  const run = await maintenance.create();
  expect(run.id).toBe("m1");
});

test("getCurrent returns null when no maintenance run exists", async () => {
  global.fetch = jest.fn(async () => json(200, { data: [] })) as typeof fetch;

  const maintenance = new MaintenanceRunsResource(new HttpClient("http://robot:31950"));
  const run = await maintenance.getCurrent();
  expect(run).toBeNull();
});

test("enqueueCommand defaults waitUntilComplete to true", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: {
        id: "c1",
        key: "k1",
        commandType: "moveToWell",
        status: "succeeded",
        createdAt: "2026-03-29T00:00:00Z",
        params: {},
      },
    })
  ) as typeof fetch;

  const maintenance = new MaintenanceRunsResource(new HttpClient("http://robot:31950"));
  await maintenance.enqueueCommand("m1", {
    data: {
      commandType: "moveToWell",
      params: { pipetteId: "p1" },
    },
  });

  const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
  const body = JSON.parse(String(init.body)) as { waitUntilComplete?: boolean };
  expect(body.waitUntilComplete).toBe(true);
});
