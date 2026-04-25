import { Langfuse } from "langfuse";

let _client: Langfuse | null = null;
let _warned = false;

export function isLangfuseEnabled(): boolean {
  return Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
}

function getClient(): Langfuse | null {
  if (!isLangfuseEnabled()) {
    if (!_warned) {
      console.info(
        "[langfuse] disabled — no LANGFUSE_PUBLIC_KEY/SECRET_KEY set; tracing is a no-op"
      );
      _warned = true;
    }
    return null;
  }
  if (!_client) {
    _client = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      baseUrl: process.env.LANGFUSE_BASEURL || "https://cloud.langfuse.com",
      flushAt: 1, // serverless: flush every event
    });
  }
  return _client;
}

export interface TraceLetterGenerationArgs {
  name: string; // e.g. "generateLetter"
  model: string;
  input: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface LetterGenerationTrace {
  end: (args: {
    output: unknown;
    usage?: unknown;
    statusMessage?: string;
    level?: "DEFAULT" | "ERROR" | "WARNING";
  }) => Promise<void>;
}

export function traceLetterGeneration(
  args: TraceLetterGenerationArgs
): LetterGenerationTrace {
  const client = getClient();
  if (!client) {
    return {
      end: async () => {
        /* no-op */
      },
    };
  }
  const trace = client.trace({ name: args.name, input: args.input, metadata: args.metadata });
  const generation = trace.generation({
    name: args.name,
    model: args.model,
    input: args.input,
  });
  return {
    end: async ({ output, usage, statusMessage, level }) => {
      try {
        // usage cast: Mistral returns { prompt_tokens, completion_tokens, total_tokens } which
        // is structurally compatible with Langfuse's OpenAIUsage; cast via unknown to avoid
        // coupling this wrapper to the Mistral SDK's type definitions.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        generation.end({ output, usage: usage as any, statusMessage, level });
        trace.update({ output });
        // Fire-and-forget flush — do NOT block the response.
        void client.flushAsync().catch((e) => console.warn("[langfuse] flush failed", e));
      } catch (e) {
        // Tracing must NEVER break the request.
        console.warn("[langfuse] trace end failed", e);
      }
    },
  };
}
