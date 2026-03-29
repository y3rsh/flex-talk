import { HttpClient } from "../src/http";
import { CameraResource } from "../src/resources/CameraResource";

afterEach(() => {
  jest.resetAllMocks();
});

test("getInfo returns camera information payload", async () => {
  global.fetch = jest.fn(async () =>
    new Response(JSON.stringify({ cameras: [{ id: "cam0", online: true }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  ) as typeof fetch;

  const camera = new CameraResource(new HttpClient("http://robot:31950"));
  const info = await camera.getInfo();

  expect(Array.isArray(info.cameras)).toBe(true);
});

test("takePicture returns binary image bytes and content type", async () => {
  const bytes = Uint8Array.from([255, 216, 255, 217]);
  global.fetch = jest.fn(async () =>
    new Response(bytes, {
      status: 200,
      headers: { "Content-Type": "image/jpg" },
    })
  ) as typeof fetch;

  const camera = new CameraResource(new HttpClient("http://robot:31950"));
  const image = await camera.takePicture();

  expect(image.contentType).toBe("image/jpg");
  expect(Array.from(image.data)).toEqual(Array.from(bytes));
});
