import { HttpClient } from "../src/http";
import { HealthResource } from "../src/resources/HealthResource";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test("get supports wrapped health response", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: {
        name: "FlexA",
        robotModel: "OT-3 Standard",
        apiVersion: "8.0.0",
        firmwareVersion: "66",
        systemVersion: "v0.9.10",
        robotSerial: "FLEX123",
        links: {},
      },
    })
  ) as typeof fetch;

  const health = new HealthResource(new HttpClient("http://robot:31950"));
  const result = await health.get();
  expect(result.robotSerial).toBe("FLEX123");
});

test("get supports raw health response from robot", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      name: "FlexB",
      robotModel: "OT-3 Standard",
      apiVersion: "8.0.0",
      firmwareVersion: "66",
      systemVersion: "v0.9.10",
      robotSerial: "FLEX456",
      links: {},
    })
  ) as typeof fetch;

  const health = new HealthResource(new HttpClient("http://robot:31950"));
  const result = await health.get();
  expect(result.robotSerial).toBe("FLEX456");
});
