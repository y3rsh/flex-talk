import { FlexDiscoveryClient } from "../src/discovery/FlexDiscoveryClient";

const okHealth = {
  name: "otie",
  api_version: "3.0.0",
  fw_version: "1.2.3",
  system_version: "7.1.0",
  robot_model: "Flex",
  robot_serial: "SER123",
};

function setFetchResolver(
  fn: (url: string) => { status: number; body: unknown } | null
): void {
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const resolved = fn(url);
    if (!resolved) {
      throw new Error("unreachable");
    }
    return new Response(JSON.stringify(resolved.body), {
      status: resolved.status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
}

afterEach(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

test("refresh discovers candidate robot", async () => {
  setFetchResolver((url) =>
    url.includes("192.168.1.42:31950/health")
      ? { status: 200, body: okHealth }
      : null
  );

  const discovery = new FlexDiscoveryClient({
    candidates: ["192.168.1.42"],
    pollIntervalMs: 1000,
  });

  const robots = await discovery.refresh();
  expect(robots).toHaveLength(1);
  expect(robots[0]?.name).toBe("otie");
  expect(robots[0]?.robotModel).toBe("Flex");
});

test("start emits update events", async () => {
  jest.useFakeTimers();
  setFetchResolver((url) =>
    url.includes("localhost:31950/health") ? { status: 200, body: okHealth } : null
  );

  const onUpdate = jest.fn();
  const discovery = new FlexDiscoveryClient({
    candidates: ["localhost"],
    pollIntervalMs: 50,
  });
  discovery.on("update", onUpdate);
  discovery.start();

  await jest.advanceTimersByTimeAsync(60);
  expect(onUpdate).toHaveBeenCalled();
  discovery.stop();
});

test("unreachable robot is removed after max missed polls", async () => {
  let online = true;
  setFetchResolver((url) => {
    if (!url.includes("10.0.0.2:31950/health")) return null;
    return online ? { status: 200, body: okHealth } : null;
  });

  const discovery = new FlexDiscoveryClient({
    candidates: ["10.0.0.2"],
    maxMissedPolls: 1,
  });

  await discovery.refresh();
  expect(discovery.getRobots()).toHaveLength(1);

  online = false;
  await discovery.refresh();
  expect(discovery.getRobots()).toHaveLength(1);
  await discovery.refresh();
  expect(discovery.getRobots()).toHaveLength(0);
});
