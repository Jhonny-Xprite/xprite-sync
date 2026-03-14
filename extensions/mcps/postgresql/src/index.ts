import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";

const { Client } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

const server = new Server(
  {
    name: "aiox-postgresql",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let client: any = null;

async function getClient() {
  if (!client) {
    if (!DATABASE_URL) throw new McpError(ErrorCode.InternalError, "DATABASE_URL not configured");
    client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
  }
  return client;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "pg_query",
        description: "Execute a PostgreSQL query",
        inputSchema: {
          type: "object",
          properties: {
            sql: { type: "string" },
          },
          required: ["sql"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const c = await getClient();

  switch (request.params.name) {
    case "pg_query": {
      const { sql } = request.params.arguments as any;
      const res = await c.query(sql);
      return {
        content: [{ type: "text", text: JSON.stringify(res.rows, null, 2) }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX PostgreSQL Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
