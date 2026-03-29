export interface Env {
  ASSETS: Fetcher;
}

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json(
        {
          ok: true,
          service: "flex-agentic-tools-skill",
          skill: "/skill.md",
          metadata: "/skill.json",
        },
        { headers: jsonHeaders }
      );
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
