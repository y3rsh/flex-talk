import { HttpClient } from "../src/http";
import { ModulesResource } from "../src/resources/ModulesResource";

function mockJsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  jest.resetAllMocks();
});

test("list returns attached modules", async () => {
  global.fetch = jest.fn(async () =>
    mockJsonResponse(200, {
      data: [
        {
          id: "mod-1",
          serialNumber: "M123",
          firmwareVersion: "2.1.0",
          hardwareRevision: "A",
          hasAvailableUpdate: false,
          moduleType: "temperatureModuleType",
          moduleModel: "temperatureModuleV2",
          slotName: "D1",
          data: {},
          usbPort: { port: 1, path: "/dev/tty.usbmodem1" },
        },
      ],
    })
  ) as typeof fetch;

  const resource = new ModulesResource(new HttpClient("http://robot:31950"));
  const modules = await resource.list();

  expect(modules).toHaveLength(1);
  expect(modules[0]?.id).toBe("mod-1");
});

test("get fetches module by id", async () => {
  global.fetch = jest.fn(async () =>
    mockJsonResponse(200, {
      data: {
        id: "mod-2",
        serialNumber: "M456",
        firmwareVersion: "3.0.0",
        hardwareRevision: "B",
        hasAvailableUpdate: true,
        moduleType: "heaterShakerModuleType",
        moduleModel: "heaterShakerModuleV1",
        slotName: "C2",
        data: { targetTemperature: 37 },
        usbPort: { port: 2, path: "/dev/tty.usbmodem2" },
      },
    })
  ) as typeof fetch;

  const resource = new ModulesResource(new HttpClient("http://robot:31950"));
  const module = await resource.get("mod-2");

  expect(module.moduleModel).toBe("heaterShakerModuleV1");
  expect(global.fetch).toHaveBeenCalledWith(
    "http://robot:31950/modules/mod-2",
    expect.objectContaining({ method: "GET" })
  );
});
