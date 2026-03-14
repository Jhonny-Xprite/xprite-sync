import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium, Browser, Page } from "playwright";

let browser: Browser | null = null;
let page: Page | null = null;

const server = new Server(
  {
    name: "playwright",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function ensureBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
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
        name: "browser_navigate",
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
        name: "browser_screenshot",
        description: "Take a screenshot of the current page",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name for the screenshot file" },
          },
          required: ["name"],
        },
      },
      {
        name: "browser_click",
        description: "Click an element on the page",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string" },
          },
          required: ["selector"],
        },
      },
      {
        name: "browser_fill",
        description: "Fill an input field",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string" },
            value: { type: "string" },
          },
          required: ["selector", "value"],
        },
      },
      {
        name: "browser_press",
        description: "Press a key (e.g., Enter, Tab)",
        inputSchema: {
          type: "object",
          properties: {
            key: { type: "string" },
          },
          required: ["key"],
        },
      },
      {
        name: "browser_evaluate",
        description: "Execute JavaScript in the page context",
        inputSchema: {
          type: "object",
          properties: {
            script: { type: "string" },
          },
          required: ["script"],
        },
      },
      {
        name: "browser_get_content",
        description: "Get the full HTML content of the page",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "browser_get_text",
        description: "Get the text content of an element",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string" },
          },
          required: ["selector"],
        },
      },
      {
        name: "browser_wait_for_selector",
        description: "Wait for an element to appear",
        inputSchema: {
          type: "object",
          properties: {
            selector: { type: "string" },
            timeout: { type: "number", default: 10000 },
          },
          required: ["selector"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const p = await ensureBrowser();

  switch (request.params.name) {
    case "browser_navigate": {
      const url = request.params.arguments?.url as string;
      await p.goto(url, { waitUntil: "networkidle" });
      return {
        content: [{ type: "text", text: `Navigated to ${url}` }],
      };
    }
    case "browser_screenshot": {
      const name = request.params.arguments?.name as string;
      const buffer = await p.screenshot();
      return {
        content: [
          {
            type: "text",
            text: `Screenshot '${name}' taken.`,
          },
          {
            type: "image",
            data: buffer.toString("base64"),
            mimeType: "image/png",
          } as any,
        ],
      };
    }
    case "browser_click": {
      const selector = request.params.arguments?.selector as string;
      await p.click(selector);
      return {
        content: [{ type: "text", text: `Clicked ${selector}` }],
      };
    }
    case "browser_fill": {
      const { selector, value } = request.params.arguments as any;
      await p.fill(selector, value);
      return {
        content: [{ type: "text", text: `Filled ${selector} with ${value}` }],
      };
    }
    case "browser_press": {
      const { key } = request.params.arguments as any;
      await p.press("body", key);
      return {
        content: [{ type: "text", text: `Pressed ${key}` }],
      };
    }
    case "browser_evaluate": {
      const { script } = request.params.arguments as any;
      const result = await p.evaluate(script);
      return {
        content: [{ type: "text", text: `Result: ${JSON.stringify(result, null, 2)}` }],
      };
    }
    case "browser_get_content": {
      const content = await p.content();
      return {
        content: [{ type: "text", text: content }],
      };
    }
    case "browser_get_text": {
      const { selector } = request.params.arguments as any;
      const text = await p.innerText(selector);
      return {
        content: [{ type: "text", text }],
      };
    }
    case "browser_wait_for_selector": {
      const { selector, timeout } = request.params.arguments as any;
      await p.waitForSelector(selector, { timeout: timeout || 10000 });
      return {
        content: [{ type: "text", text: `Element ${selector} is now visible` }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Playwright MCP running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
