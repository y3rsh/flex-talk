import { HttpClient } from "../src/http";
import { InstrumentsResource } from "../src/resources/InstrumentsResource";

function mockJsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function setFetchBody(body: unknown): void {
  global.fetch = jest.fn(async () => mockJsonResponse(200, body)) as typeof fetch;
}

afterEach(() => {
  jest.resetAllMocks();
});

test("list returns all attached instruments", async () => {
  setFetchBody({
    data: [
      {
        id: "pipette-1",
        instrumentType: "pipette",
        mount: "left",
        serialNumber: "P123",
        firmwareVersion: "1.0.0",
        instrumentName: "flex_1channel_1000",
        instrumentModel: "v1",
        data: { channels: 1, min_volume: 1, max_volume: 1000 },
        ok: true,
      },
      {
        id: "gripper-1",
        instrumentType: "gripper",
        mount: "extension",
        serialNumber: "G123",
        firmwareVersion: "1.0.0",
        instrumentName: "gripperV1",
        data: { jawState: "open" },
        ok: true,
      },
    ],
  });

  const resource = new InstrumentsResource(new HttpClient("http://robot:31950"));
  const instruments = await resource.list();

  expect(instruments).toHaveLength(2);
});

test("pipettes filters gripper out", async () => {
  setFetchBody({
    data: [
      {
        id: "pipette-1",
        instrumentType: "pipette",
        mount: "left",
        serialNumber: "P123",
        firmwareVersion: "1.0.0",
        instrumentName: "flex_1channel_1000",
        instrumentModel: "v1",
        data: { channels: 1, min_volume: 1, max_volume: 1000 },
        ok: true,
      },
      {
        id: "gripper-1",
        instrumentType: "gripper",
        mount: "extension",
        serialNumber: "G123",
        firmwareVersion: "1.0.0",
        instrumentName: "gripperV1",
        data: { jawState: "open" },
        ok: true,
      },
    ],
  });

  const resource = new InstrumentsResource(new HttpClient("http://robot:31950"));
  const pipettes = await resource.pipettes();

  expect(pipettes).toHaveLength(1);
  expect(pipettes[0]?.instrumentType).toBe("pipette");
});

test("gripper returns null when no gripper exists", async () => {
  setFetchBody({
    data: [
      {
        id: "pipette-1",
        instrumentType: "pipette",
        mount: "right",
        serialNumber: "P456",
        firmwareVersion: "1.0.0",
        instrumentName: "flex_8channel_1000",
        instrumentModel: "v1",
        data: { channels: 8, min_volume: 1, max_volume: 1000 },
        ok: true,
      },
    ],
  });

  const resource = new InstrumentsResource(new HttpClient("http://robot:31950"));
  const gripper = await resource.gripper();

  expect(gripper).toBeNull();
});
