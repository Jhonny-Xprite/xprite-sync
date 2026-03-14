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
    name: "aiox-context7",
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
        name: "get-library-docs",
        description: "Get up-to-date documentation for a library",
        inputSchema: {
          type: "object",
          properties: {
            libraryId: { type: "string", description: "The ID of the library (e.g. 'react', 'nextjs')" },
          },
          required: ["libraryId"],
        },
      },
      {
        name: "resolve-library-id",
        description: "Search for a library's ID by name",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get-library-docs": {
      const { libraryId } = request.params.arguments as any;
      // In a real implementation, this would fetch from Context7 API
      return {
        content: [{ type: "text", text: `Fetching docs for ${libraryId}... [API Key needed for production]` }],
      };
    }
    case "resolve-library-id": {
      const { query } = request.params.arguments as any;
      return {
        content: [{ type: "text", text: `Found library: ${query} (ID: ${query.toLowerCase()})` }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX Context7 Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
