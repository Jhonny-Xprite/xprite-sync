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
    name: "aiox-sequential-thinking",
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
        name: "sequentialthinking",
        description: "A tool for dynamic and reflective problem-solving through sequential thoughts.",
        inputSchema: {
          type: "object",
          properties: {
            thought: { type: "string" },
            thoughtNumber: { type: "integer" },
            totalThoughtNumber: { type: "integer" },
            nextThoughtNeeded: { type: "boolean" },
          },
          required: ["thought", "thoughtNumber", "totalThoughtNumber", "nextThoughtNeeded"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "sequentialthinking": {
      const { thought, thoughtNumber, totalThoughtNumber, nextThoughtNeeded } = request.params.arguments as any;
      console.error(`[Thought ${thoughtNumber}/${totalThoughtNumber}] ${thought}`);
      return {
        content: [{ 
          type: "text", 
          text: `Acknowledged thought ${thoughtNumber}. ${nextThoughtNeeded ? "Proceeding to next." : "Conclusion reached."}` 
        }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX Sequential Thinking Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
