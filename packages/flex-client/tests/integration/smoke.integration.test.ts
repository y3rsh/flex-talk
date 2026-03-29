import { FlexClient } from "../../src";

const host = process.env.FLEX_HOST;
const maybeDescribe = host ? describe : describe.skip;

maybeDescribe("integration smoke", () => {
  test("health endpoint is reachable", async () => {
    const robot = new FlexClient({ host: host as string });
    const health = await robot.health.get();
    expect(health.robotSerial).toBeTruthy();
  });
});
