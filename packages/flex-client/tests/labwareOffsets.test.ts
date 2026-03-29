import { HttpClient } from "../src/http";
import { LabwareOffsetsResource } from "../src/resources/LabwareOffsetsResource";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test("store posts offsets and returns saved data", async () => {
  global.fetch = jest.fn(async () =>
    json(200, {
      data: [
        {
          id: "off-1",
          createdAt: "2026-03-29T00:00:00Z",
          definitionUri: "opentrons/opentrons_96_tiprack_300ul/1",
          location: { slotName: "D1" },
          vector: { x: 0, y: 0, z: 0.5 },
        },
      ],
    })
  ) as typeof fetch;

  const offsets = new LabwareOffsetsResource(new HttpClient("http://robot:31950"));
  const saved = await offsets.store([
    {
      definitionUri: "opentrons/opentrons_96_tiprack_300ul/1",
      location: { slotName: "D1" },
      vector: { x: 0, y: 0, z: 0.5 },
    },
  ]);

  expect(saved).toHaveLength(1);
  expect(saved[0]?.id).toBe("off-1");
});

test("search encodes filter query parameters", async () => {
  global.fetch = jest.fn(async () => json(200, { data: [] })) as typeof fetch;

  const offsets = new LabwareOffsetsResource(new HttpClient("http://robot:31950"));
  await offsets.search({
    definitionUri: "uri-1",
    location: { slotName: "C2", moduleModel: "temperatureModuleV2" },
  });

  const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string];
  expect(url).toContain("/labware_offsets?");
  expect(url).toContain("definitionUri=uri-1");
  expect(url).toContain("location.slotName=C2");
  expect(url).toContain("location.moduleModel=temperatureModuleV2");
});

test("deleteAll calls collection endpoint", async () => {
  global.fetch = jest.fn(async () => new Response(null, { status: 204 })) as typeof fetch;

  const offsets = new LabwareOffsetsResource(new HttpClient("http://robot:31950"));
  await offsets.deleteAll();

  expect(global.fetch).toHaveBeenCalledWith(
    "http://robot:31950/labware_offsets",
    expect.objectContaining({ method: "DELETE" })
  );
});
