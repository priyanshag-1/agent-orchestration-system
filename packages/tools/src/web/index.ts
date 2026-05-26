import { defineTool } from "@aos/tool-runtime";
import { z } from "zod";

export const webFetchTool = defineTool({
  name: "web_fetch",
  title: "Fetch URL",
  category: "web",
  permissions: ["network:fetch"],
  timeoutMs: 30_000,
  description: "Fetch a URL and return status, headers, and text content with a byte limit.",
  inputSchema: z.object({
    url: z.string().url(),
    method: z.string().default("GET"),
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
    maxBytes: z.number().int().positive().max(2_000_000).default(200_000),
  }),
  async execute(input, context) {
    const doFetch = context.runtime.fetch ?? fetch;
    const init: RequestInit = {
      method: input.method,
    };
    if (input.headers !== undefined) init.headers = input.headers;
    if (input.body !== undefined) init.body = input.body;
    if (context.signal !== undefined) init.signal = context.signal;
    const response = await doFetch(input.url, init);
    const text = await response.text();
    return {
      url: input.url,
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      text: text.slice(0, input.maxBytes),
      truncated: text.length > input.maxBytes,
    };
  },
});

export const webTools = [webFetchTool];
