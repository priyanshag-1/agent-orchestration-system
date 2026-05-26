import { createId } from "../id.js";
import type { ModelProvider, ProviderRequest, ProviderResponse } from "../messages.js";

export function createStaticProvider(content: string): ModelProvider {
  return {
    name: "static",
    async complete(_request: ProviderRequest): Promise<ProviderResponse> {
      return {
        message: {
          id: createId("msg"),
          role: "assistant",
          content,
        },
      };
    },
  };
}

