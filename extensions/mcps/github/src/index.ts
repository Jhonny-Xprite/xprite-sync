import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { Octokit } from "@octokit/rest";

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

const server = new Server(
  {
    name: "aiox-github",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const octokit = new Octokit({
  auth: GITHUB_PERSONAL_ACCESS_TOKEN,
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "github_list_repos",
        description: "List repositories for the authenticated user",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "github_create_issue",
        description: "Create an issue in a repository",
        inputSchema: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            title: { type: "string" },
            body: { type: "string" },
          },
          required: ["owner", "repo", "title"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (!GITHUB_PERSONAL_ACCESS_TOKEN) {
    throw new McpError(ErrorCode.InternalError, "GITHUB_PERSONAL_ACCESS_TOKEN not configured");
  }

  switch (request.params.name) {
    case "github_list_repos": {
      const { data } = await octokit.repos.listForAuthenticatedUser();
      return {
        content: [{ type: "text", text: JSON.stringify(data.map(r => r.full_name), null, 2) }],
      };
    }
    case "github_create_issue": {
      const { owner, repo, title, body } = request.params.arguments as any;
      const { data } = await octokit.issues.create({
        owner,
        repo,
        title,
        body,
      });
      return {
        content: [{ type: "text", text: `Issue created: ${data.html_url}` }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX GitHub Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
