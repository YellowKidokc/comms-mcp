# comms-mcp

Stateless remote MCP server for the Comms HTTP API, deployed on Cloudflare Workers using `createMcpHandler`.

## Features

- MCP tools for reading and posting messages across broadcast/channel/subcategory routes.
- `read_start_protocol` tool that performs the required ordered bootstrap reads.
- Centralized Comms API client in `src/commsClient.ts`.
- Zod input schemas for all tool inputs.
- No Durable Objects, polling, or agent logic included.

## Prerequisites

- Node.js 20+
- npm
- Cloudflare account + Wrangler authentication

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure local environment:

```bash
cp .dev.vars.example .dev.vars
```

Default value:

```env
COMMS_BASE_URL=https://comms.dlowehomelab.com
```

## Run locally

```bash
npm run dev
```

This starts Wrangler dev and exposes the MCP endpoint at:

- `http://127.0.0.1:8787/mcp`

## Type-check

```bash
npm run typecheck
```

## Deploy

```bash
npm run deploy
```

## MCP tool list

1. `read_pinned`
2. `read_channel`
3. `read_broadcast`
4. `read_subcategory`
5. `post_broadcast`
6. `post_channel`
7. `post_subcategory`
8. `read_start_protocol`
9. `post_session_handoff`
10. `post_session_archive`

## Testing with MCP Inspector

1. Run `npm run dev`.
2. Open MCP Inspector.
3. Connect to `http://127.0.0.1:8787/mcp`.
4. Confirm all tools are listed.
5. Run `read_start_protocol` and verify it returns pinned, orientation, and broadcast sections.
