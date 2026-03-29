import { FlexRunFailedError, FlexTimeoutError } from "../src/errors";
import { HttpClient } from "../src/http";
import { RunsResource } from "../src/resources/RunsResource";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

test("start sends play action", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: {
        id: "action-1",
        createdAt: "2026-03-29T00:00:00Z",
        actionType: "play",
      },
    })
  ) as typeof fetch;

  const runs = new RunsResource(new HttpClient("http://robot:31950"));
  const action = await runs.start("run-1");

  expect(action.actionType).toBe("play");
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
  expect(url).toBe("http://robot:31950/runs/run-1/actions");
  expect(init.method).toBe("POST");
});

test("waitForCompletion returns terminal succeeded run", async () => {
  const responses = [
    json(200, {
      data: {
        id: "run-1",
        createdAt: "2026-03-29T00:00:00Z",
        status: "running",
        current: true,
        actions: [],
        errors: [],
        pipettes: [],
        labware: [],
        modules: [],
        liquids: [],
        labwareOffsets: [],
      },
    }),
    json(200, {
      data: {
        id: "run-1",
        createdAt: "2026-03-29T00:00:00Z",
        status: "succeeded",
        current: false,
        actions: [],
        errors: [],
        pipettes: [],
        labware: [],
        modules: [],
        liquids: [],
        labwareOffsets: [],
      },
    }),
  ];
  global.fetch = jest.fn(async () => responses.shift() ?? responses[0]) as typeof fetch;

  jest.useFakeTimers();
  const runs = new RunsResource(new HttpClient("http://robot:31950"));
  const promise = runs.waitForCompletion("run-1", { pollIntervalMs: 10 });
  await jest.runAllTimersAsync();
  const run = await promise;

  expect(run.status).toBe("succeeded");
});

test("waitForCompletion throws FlexRunFailedError on failed run", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: {
        id: "run-1",
        createdAt: "2026-03-29T00:00:00Z",
        status: "failed",
        current: false,
        actions: [],
        errors: [
          {
            id: "e1",
            createdAt: "2026-03-29T00:00:00Z",
            errorType: "execution",
            errorCode: "ERR",
            detail: "boom",
            errorInfo: {},
            wrappedErrors: [],
          },
        ],
        pipettes: [],
        labware: [],
        modules: [],
        liquids: [],
        labwareOffsets: [],
      },
    })
  ) as typeof fetch;

  const runs = new RunsResource(new HttpClient("http://robot:31950"));
  await expect(runs.waitForCompletion("run-1")).rejects.toBeInstanceOf(
    FlexRunFailedError
  );
});

test("waitForCompletion throws FlexTimeoutError on timeout", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: {
        id: "run-1",
        createdAt: "2026-03-29T00:00:00Z",
        status: "running",
        current: true,
        actions: [],
        errors: [],
        pipettes: [],
        labware: [],
        modules: [],
        liquids: [],
        labwareOffsets: [],
      },
    })
  ) as typeof fetch;

  jest.useFakeTimers();
  const runs = new RunsResource(new HttpClient("http://robot:31950"));
  const promise = runs.waitForCompletion("run-1", {
    pollIntervalMs: 10,
    timeoutMs: 5,
  });
  const assertion = expect(promise).rejects.toBeInstanceOf(FlexTimeoutError);
  await jest.advanceTimersByTimeAsync(20);

  await assertion;
});

test("getCommands paginates until total length reached", async () => {
  const first = json(200, {
    data: [
      {
        id: "c1",
        key: "k1",
        commandType: "aspirate",
        status: "succeeded",
        createdAt: "2026-03-29T00:00:00Z",
        params: {},
      },
    ],
    meta: { totalLength: 2 },
  });
  const second = json(200, {
    data: [
      {
        id: "c2",
        key: "k2",
        commandType: "dispense",
        status: "succeeded",
        createdAt: "2026-03-29T00:00:01Z",
        params: {},
      },
    ],
    meta: { totalLength: 2 },
  });

  const seq = [first, second];
  global.fetch = jest.fn(async () => seq.shift() ?? second) as typeof fetch;

  const runs = new RunsResource(new HttpClient("http://robot:31950"));
  const commands = await runs.getCommands("run-22");

  expect(commands).toHaveLength(2);
  expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
    "/runs/run-22/commands?pageLength=100"
  );
  expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain(
    "/runs/run-22/commands?pageLength=100&cursor=1"
  );
});
