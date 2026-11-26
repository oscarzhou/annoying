# Agent skill management

## Policy

Project-authored skills are committed under `.agents/skills/`:

- `mobile-first-ux`
- `expense-design-system`
- `expense-domain-rules`

Externally maintained skills are not vendored in the public repository. Their upstream source, path, and computed content hash are recorded in `skills-lock.json`; `scripts/install-agent-skills.ps1` installs them into the working tree for local agent use. Review upstream changes before accepting a new hash.

## External skills

| Skill | Upstream source | Licence/attribution status |
|---|---|---|
| `ai-sdk` | `vercel/ai` | Governed by the upstream repository; verify the selected skill path and licence when updating. |
| `frontend-design` | `anthropics/skills` | Upstream skill includes its own `LICENSE.txt`; installation must preserve it. |
| `shadcn` | `shadcn/ui` | Governed by the upstream repository; retain upstream notices when redistribution is required. |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` | Skill metadata declares MIT. |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | Skill metadata declares MIT. |
| `web-design-guidelines` | `vercel-labs/agent-skills` | The installed snapshot records its upstream commit and content hash; verify upstream licence before redistribution. |

The installer retrieves these skills from their authoritative repositories rather than copying the current local directories into Git. This reduces stale duplication but does not replace dependency review: contributors should inspect source changes, licences, and hashes before updating `skills-lock.json`.

## Installation

Run from the repository root:

```powershell
./scripts/install-agent-skills.ps1
```

Equivalent individual command shape:

```powershell
npx skills add <owner/repository> --skill <skill-name> -y
```

The installer requires network access and the third-party `skills` CLI fetched through `npx`. The committed application does not require these skills at runtime.
