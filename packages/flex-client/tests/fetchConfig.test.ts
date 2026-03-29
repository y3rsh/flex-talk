import { HttpClient, type FetchLike } from "../src/http";

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

test("uses injected fetch implementation when provided", async () => {
  const injectedFetch: FetchLike = jest.fn(async () => response({ data: { ok: true } }));
  const globalSpy = jest.spyOn(global, "fetch");

  const http = new HttpClient("http://robot:31950", injectedFetch);
  const result = await http.get<{ data: { ok: boolean } }>("/health");

  expect(result.data.ok).toBe(true);
  expect(injectedFetch).toHaveBeenCalledTimes(1);
  expect(globalSpy).not.toHaveBeenCalled();
  globalSpy.mockRestore();
});
