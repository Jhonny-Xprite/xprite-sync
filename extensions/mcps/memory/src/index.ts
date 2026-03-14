import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs-extra";

const DB_PATH = process.env.MEMORY_DB_PATH || path.join(process.cwd(), "memory.db");
fs.ensureDirSync(path.dirname(DB_PATH));

const db = new Database(DB_PATH);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS entities (
    name TEXT PRIMARY KEY,
    type TEXT,
    description TEXT
  );
  CREATE TABLE IF NOT EXISTS relations (
    "from" TEXT,
    "to" TEXT,
    type TEXT,
    PRIMARY KEY ("from", "to", type)
  );
  CREATE TABLE IF NOT EXISTS observations (
    entity_name TEXT,
    content TEXT,
    FOREIGN KEY(entity_name) REFERENCES entities(name)
  );
`);

const server = new Server(
  {
    name: "aiox-memory",
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
        name: "create_entities",
        description: "Create multiple new entities",
        inputSchema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" },
                  description: { type: "string" },
                },
                required: ["name", "type"],
              },
            },
          },
          required: ["entities"],
        },
      },
      {
        name: "add_observations",
        description: "Add observations to entities",
        inputSchema: {
          type: "object",
          properties: {
            observations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string" },
                  content: { type: "string" },
                },
                required: ["entityName", "content"],
              },
            },
          },
          required: ["observations"],
        },
      },
      {
        name: "search_nodes",
        description: "Search for entities by query",
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
    case "create_entities": {
      const entities = request.params.arguments?.entities as any[];
      const stmt = db.prepare("INSERT OR IGNORE INTO entities (name, type, description) VALUES (?, ?, ?)");
      const results = entities.map(e => stmt.run(e.name, e.type, e.description || ""));
      return {
        content: [{ type: "text", text: `Created ${results.filter(r => r.changes > 0).length} new entities.` }],
      };
    }
    case "add_observations": {
      const observations = request.params.arguments?.observations as any[];
      const stmt = db.prepare("INSERT INTO observations (entity_name, content) VALUES (?, ?)");
      observations.forEach(o => stmt.run(o.entityName, o.content));
      return {
        content: [{ type: "text", text: `Added ${observations.length} observations.` }],
      };
    }
    case "search_nodes": {
      const query = request.params.arguments?.query as string;
      const results = db.prepare("SELECT * FROM entities WHERE name LIKE ? OR description LIKE ?")
        .all(`%${query}%`, `%${query}%`);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
    default:
      throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIOX Memory Server (SQLite) running");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
