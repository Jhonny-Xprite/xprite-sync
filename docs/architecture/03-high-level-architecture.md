# 03. High Level Architecture
AIOX-CORE follows a **CLI-First** architecture where the CLI orchestrates specialized agents, tasks, and workflows.

## Technical Stack
| Category | Technology | Notes |
|----------|------------|-------|
| Runtime | Node.js (>=18) | Core execution environment |
| CLI | Commander.js | Command-line interface orchestration |
| Validation | Ajv | Schema validation for YAML artifacts |
| Data | JS-YAML | Config and definition parsing |
