import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "aiox-fetch",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch",
        description: "Fetch a URL and return its text content",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "fetch": {
      const { url } = request.params.arguments as any;
      const response = await fetch(url);
      if (!response.ok) {
        throw new McpError(ErrorCode.InternalError, `Fetch error: ${response.statusText}`);
      }
      const text = await response.text();
      return {
        content: [{ type: "text", text }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX Fetch Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
