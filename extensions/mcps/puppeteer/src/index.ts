import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import puppeteer, { Browser, Page } from "puppeteer";

const server = new Server(
  {
    name: "aiox-puppeteer",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let browser: Browser | null = null;
let page: Page | null = null;

async function getPage() {
  if (!browser) {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    });
  }
  if (!page) {
    page = await browser.newPage();
  }
  return page;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "puppeteer_navigate",
        description: "Navigate to a URL",
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string" },
          },
          required: ["url"],
        },
      },
      {
        name: "puppeteer_screenshot",
        description: "Take a screenshot of the current page",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
          required: ["name"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const p = await getPage();

  switch (request.params.name) {
    case "puppeteer_navigate": {
      const { url } = request.params.arguments as any;
      await p.goto(url, { waitUntil: "networkidle0" });
      return {
        content: [{ type: "text", text: `Navigated to ${url}` }],
      };
    }
    case "puppeteer_screenshot": {
      const { name } = request.params.arguments as any;
      const screenshot = await p.screenshot({ encoding: "base64" });
      return {
        content: [
          { type: "text", text: `Screenshot taken: ${name}` },
          { type: "image", data: screenshot, mimeType: "image/png" } as any
        ],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX Puppeteer Server running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
