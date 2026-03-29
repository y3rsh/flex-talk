import { HttpClient } from "../src/http";
import { ProtocolsResource } from "../src/resources/ProtocolsResource";

function mockJsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test("upload sends multipart form with files field", async () => {
  global.fetch = jest.fn(async () =>
    mockJsonResponse(200, {
      data: {
        id: "proto-1",
        createdAt: "2026-03-29T00:00:00Z",
        files: [],
        protocolType: "python",
        robotType: "OT-3 Standard",
        metadata: {},
        analyses: [],
        analysisSummaries: [],
      },
    })
  ) as typeof fetch;

  const resource = new ProtocolsResource(new HttpClient("http://robot:31950"));
  const protocol = await resource.upload("print('hello')", "demo.py");

  expect(protocol.id).toBe("proto-1");
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
    string,
    RequestInit
  ];
  expect(init.body).toBeInstanceOf(FormData);
});

test("list returns protocols", async () => {
  global.fetch = jest.fn(async () =>
    mockJsonResponse(200, {
      data: [
        {
          id: "proto-1",
          createdAt: "2026-03-29T00:00:00Z",
          files: [],
          protocolType: "python",
          robotType: "OT-3 Standard",
          metadata: {},
          analyses: [],
          analysisSummaries: [],
        },
      ],
    })
  ) as typeof fetch;

  const resource = new ProtocolsResource(new HttpClient("http://robot:31950"));
  const list = await resource.list();

  expect(list).toHaveLength(1);
  expect(list[0]?.id).toBe("proto-1");
});

test("delete hits protocol endpoint", async () => {
  global.fetch = jest.fn(async () => new Response(null, { status: 204 })) as typeof fetch;

  const resource = new ProtocolsResource(new HttpClient("http://robot:31950"));
  await resource.delete("proto-9");

  expect(global.fetch).toHaveBeenCalledWith(
    "http://robot:31950/protocols/proto-9",
    expect.objectContaining({ method: "DELETE" })
  );
});

test("analyze polls until completed", async () => {
  const responses = [
    mockJsonResponse(200, { data: { id: "a1", status: "pending" } }),
    mockJsonResponse(200, { data: { id: "a1", status: "completed", result: "ok" } }),
  ];
  global.fetch = jest.fn(async () => responses.shift() ?? responses[1]) as typeof fetch;

  jest.useFakeTimers();
  const sleepSpy = jest.spyOn(global, "setTimeout");

  const resource = new ProtocolsResource(new HttpClient("http://robot:31950"));
  const promise = resource.analyze("proto-1");
  await jest.runAllTimersAsync();
  const result = await promise;

  expect(result.status).toBe("completed");
  expect(sleepSpy).toHaveBeenCalled();

  jest.useRealTimers();
  sleepSpy.mockRestore();
});
