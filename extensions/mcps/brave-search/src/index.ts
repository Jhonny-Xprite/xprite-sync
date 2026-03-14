import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

const server = new Server(
  {
    name: "aiox-brave-search",
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
        name: "brave_web_search",
        description: "Search the web using Brave Search API",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            count: { type: "integer", default: 5 },
          },
          required: ["query"],
        },
      },
      {
        name: "brave_local_search",
        description: "Search for local businesses and places",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            count: { type: "integer", default: 5 },
          },
          required: ["query"],
        },
      },
      {
        name: "brave_image_search",
        description: "Search for images using Brave API",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            count: { type: "integer", default: 5 },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!BRAVE_API_KEY) {
    throw new McpError(ErrorCode.InternalError, "BRAVE_API_KEY not configured");
  }

  const performSearch = async (endpoint: string, query: string, count: number) => {
    const url = `https://api.search.brave.com/res/v1/${endpoint}/search?q=${encodeURIComponent(query)}&count=${count}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
    });

    if (!response.ok) {
      throw new McpError(ErrorCode.InternalError, `Brave API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  };

  switch (request.params.name) {
    case "brave_web_search": {
      const { query, count } = request.params.arguments as any;
      return await performSearch("web", query, count || 5);
    }
    case "brave_local_search": {
      const { query, count } = request.params.arguments as any;
      return await performSearch("local", query, count || 5);
    }
    case "brave_image_search": {
      const { query, count } = request.params.arguments as any;
      return await performSearch("images", query, count || 5);
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX Brave Search Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
