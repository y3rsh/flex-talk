import { FlexApiError } from "../src/errors";
import { HttpClient } from "../src/http";

interface MockResponseInit {
  status: number;
  body?: unknown;
}

function mockJsonResponse(init: MockResponseInit): Response {
  const text = init.body === undefined ? "" : JSON.stringify(init.body);
  return new Response(text, {
    status: init.status,
    headers: { "Content-Type": "application/json" },
  });
}

function setFetchImplementation(
  impl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
): void {
  global.fetch = jest.fn(impl) as typeof fetch;
}

afterEach(() => {
  jest.resetAllMocks();
});

test("get sends required opentrons header", async () => {
  setFetchImplementation(async () =>
    mockJsonResponse({ status: 200, body: { data: { ok: true } } })
  );

  const http = new HttpClient("http://127.0.0.1:31950");
  await http.get<{ data: { ok: boolean } }>("/health");

  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
    string,
    RequestInit
  ];

  const headers = new Headers(init.headers);
  expect(headers.get("opentrons-version")).toBe("*");
});

test("post serializes json and sets content type", async () => {
  setFetchImplementation(async () =>
    mockJsonResponse({ status: 200, body: { data: { id: "r1" } } })
  );

  const http = new HttpClient("http://127.0.0.1:31950");
  await http.post<{ data: { id: string } }>("/runs", { data: { foo: "bar" } });

  const [, init] = (global.fetch as jest.Mock).mock.calls[0] as [
    string,
    RequestInit
  ];
  const headers = new Headers(init.headers);

  expect(headers.get("Content-Type")).toBe("application/json");
  expect(init.body).toBe(JSON.stringify({ data: { foo: "bar" } }));
});

test("throws FlexApiError with parsed error fields", async () => {
  setFetchImplementation(async () =>
    mockJsonResponse({
      status: 422,
      body: {
        errors: [
          {
            id: "1",
            title: "Unprocessable",
            detail: "Bad field",
            errorCode: "VALIDATION_ERROR",
            meta: [{ bad: true }],
          },
        ],
      },
    })
  );

  const http = new HttpClient("http://127.0.0.1:31950");

  await expect(http.get("/runs")).rejects.toBeInstanceOf(FlexApiError);
  await expect(http.get("/runs")).rejects.toMatchObject({
    status: 422,
    errorCode: "VALIDATION_ERROR",
    message: "Bad field",
    wrappedErrors: [{ bad: true }],
  });
});
