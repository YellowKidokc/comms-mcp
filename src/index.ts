import { createMcpHandler } from "@cloudflare/agents/mcp";
import { z } from "zod";
import { commsClient, type Env } from "./commsClient";

const toTextResult = (result: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
});

const withErrors = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Comms API request failed: ${message}`);
  }
};

export default {
  fetch: createMcpHandler((server) => {
    server.tool("read_pinned", "Read pinned messages", {}, async (_input, ctx) => {
      const result = await withErrors(() => commsClient.readPinned(ctx.env as Env));
      return toTextResult(result);
    });

    server.tool(
      "read_channel",
      "Read all messages in a channel",
      { channel: z.string().min(1) },
      async ({ channel }, ctx) => {
        const result = await withErrors(() => commsClient.readChannel(ctx.env as Env, channel));
        return toTextResult(result);
      },
    );

    server.tool("read_broadcast", "Read broadcast messages", {}, async (_input, ctx) => {
      const result = await withErrors(() => commsClient.readBroadcast(ctx.env as Env));
      return toTextResult(result);
    });

    server.tool(
      "read_subcategory",
      "Read all messages for a channel subcategory",
      { channel: z.string().min(1), subcategory: z.string().min(1) },
      async ({ channel, subcategory }, ctx) => {
        const result = await withErrors(() =>
          commsClient.readSubcategory(ctx.env as Env, channel, subcategory),
        );
        return toTextResult(result);
      },
    );

    server.tool(
      "post_broadcast",
      "Post a broadcast message",
      { sender: z.string().min(1), content: z.string().min(1) },
      async ({ sender, content }, ctx) => {
        const result = await withErrors(() =>
          commsClient.postBroadcast(ctx.env as Env, sender, content),
        );
        return toTextResult(result);
      },
    );

    server.tool(
      "post_channel",
      "Post a channel message",
      {
        channel: z.string().min(1),
        sender: z.string().min(1),
        content: z.string().min(1),
      },
      async ({ channel, sender, content }, ctx) => {
        const result = await withErrors(() =>
          commsClient.postChannel(ctx.env as Env, channel, sender, content),
        );
        return toTextResult(result);
      },
    );

    server.tool(
      "post_subcategory",
      "Post a subcategory message",
      {
        channel: z.string().min(1),
        subcategory: z.string().min(1),
        sender: z.string().min(1),
        content: z.string().min(1),
      },
      async ({ channel, subcategory, sender, content }, ctx) => {
        const result = await withErrors(() =>
          commsClient.postSubcategory(ctx.env as Env, channel, subcategory, sender, content),
        );
        return toTextResult(result);
      },
    );

    server.tool(
      "read_start_protocol",
      "Read startup protocol messages",
      { own_channel: z.string().min(1).optional(), workflow_room: z.string().min(1).optional() },
      async ({ own_channel, workflow_room }, ctx) => {
        const env = ctx.env as Env;
        const result = await withErrors(async () => {
          const combined: Record<string, unknown> = {
            pinned: await commsClient.readPinned(env),
            orientation_start_here: await commsClient.readSubcategory(
              env,
              "orientation",
              "start-here",
            ),
            orientation_david_system_prompt_v2: await commsClient.readSubcategory(
              env,
              "orientation",
              "david-system-prompt-v2",
            ),
            broadcast: await commsClient.readBroadcast(env),
          };

          if (own_channel) combined.own_channel = await commsClient.readChannel(env, own_channel);
          if (workflow_room)
            combined.workflow_room = await commsClient.readChannel(env, workflow_room);

          return combined;
        });

        return toTextResult(result);
      },
    );

    server.tool(
      "post_session_handoff",
      "Post an end-of-session handoff",
      {
        workflow_room: z.string().min(1),
        sender: z.string().min(1),
        content: z.string().min(1),
      },
      async ({ workflow_room, sender, content }, ctx) => {
        const result = await withErrors(() =>
          commsClient.postChannel(ctx.env as Env, workflow_room, sender, content),
        );
        return toTextResult(result);
      },
    );

    server.tool(
      "post_session_archive",
      "Post a session archive entry",
      { project: z.string().min(1), sender: z.string().min(1), content: z.string().min(1) },
      async ({ project, sender, content }, ctx) => {
        const result = await withErrors(() =>
          commsClient.postSubcategory(ctx.env as Env, "session-archive", project, sender, content),
        );
        return toTextResult(result);
      },
    );
  }),
};
