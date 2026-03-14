import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import Exa from "exa-js";

const EXA_API_KEY = process.env.EXA_API_KEY;
if (!EXA_API_KEY) {
  console.error("EXA_API_KEY is required for full functionality");
}

// @ts-ignore
const exa = new Exa(EXA_API_KEY || "");

const server = new Server(
  {
    name: "exa",
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
        name: "exa_search",
        description: "Search the web using Exa AI (Neural Search)",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string" },
            numResults: { type: "number", default: 5 },
          },
          required: ["query"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!EXA_API_KEY) {
    throw new McpError(ErrorCode.InternalError, "EXA_API_KEY not configured");
  }

  switch (request.params.name) {
    case "exa_search": {
      const query = request.params.arguments?.query as string;
      const numResults = (request.params.arguments?.numResults as number) || 5;
      
      try {
        const result = await exa.searchAndContents(query, {
          numResults,
          useAutoprompt: true,
        });

        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(result.results, null, 2) 
          }],
        };
      } catch (e: any) {
        throw new McpError(ErrorCode.InternalError, `Exa Search failed: ${e.message}`);
      }
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Exa MCP running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
