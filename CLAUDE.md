# VisualAI

An interactive, visual learning roadmap for AI. Each concept ships with a manual interactive artifact that lets the learner build intuition by tinkering, not just reading.

## Memory layer

Durable project context lives in the Obsidian vault:
`~/Documents/Obsidian Vaults/Claude Memory Layer/projects/visualai/`

Before answering anything about goals, scope, prior decisions, or research: search that folder first via the `vault-search` skill or the `obsidian` MCP tools. Do not re-derive context from the conversation.

Cross-project knowledge (concepts, general lessons) lives in the vault's `permanent/` — also worth searching when relevant.

## Session protocol

- **Session start**: run `/resume`. It reads the latest log and briefs me on goal / outcome / open threads.
- **Mid-session**: when a non-obvious choice is made, say "capture this decision" → ADR in `projects/visualai/decisions/`.
- **Session end**: run `/save`. It writes a structured log to `logs/` in the vault.

## Code conventions

- Frameworks, libraries, and patterns are listed here ONLY after they're actually adopted, not speculatively. Decisions go to `projects/visualai/decisions/` as ADRs.
- Keep this section under 10 lines.

## Out of scope for this file

- Goals, vision, roadmap — see the vault project folder.
- Architecture decisions — see `projects/visualai/decisions/`.
- Research notes — see `projects/visualai/research/`.

This file is loaded every turn. Keep it lean. Detail is one MCP call away.
