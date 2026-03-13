# 02. Requirements (Simplified)
📋
1. **Validation**: Framework MUST validate its own structure (`npm run validate:structure`) and agent integrity (`npm run validate:agents`).
2. **Guidance**: All agents MUST use the `docs/` folder as the absolute source of truth.
3. **Health Checks**: Implement the official triple-layered testing strategy (Jest/Mocha/Gates).
4. **Asset Integrity**: Resolve 100% of the "Missing Dependency" warnings identified in research (121 missing assets).
