# Contributing to Jumble Ouro

**Jumble Ouro** (or just **ouro**) is a community-governed Nostr client, originally forked from [Jumble](https://github.com/CodyTseng/jumble) and now developed independently. Features are chosen by the community and implemented end-to-end by an AI coding agent — no humans in the loop for the happy path. You don't need to write code; just tell us what you want and vote.

## How it works

```
  You open an issue ──▶ Community votes 👍 / 👎 ──▶ Daily cron picks the top one
                                                          │
                                                          ▼
         Master updated ◀── Auto-merge on green ◀── Agent implements + tests
```

### 1. Submit a feature request

Go to **[Issues → New Issue → Feature Request](../../issues/new?template=feature-request.yml)** and fill out the template. Be specific:

- What is the problem, in concrete terms?
- What should happen instead?
- Screenshots or mockups go a long way — paste them directly into the form.

Discussion in the comments is read by the agent as part of the spec, so follow-up clarifications, agreed scope reductions, and edge cases raised in the thread all count.

### 2. Vote

On any open feature request, react with:

- 👍 — you want this
- 👎 — you don't want this, or it's a bad fit for Jumble Ouro

Your score for an issue is `👍 − 👎`. 👎 isn't an attack — it's a cooldown for requests that are controversial or low quality.

### 3. Watch it get built

Every day at 20:00 UTC, a GitHub Action runs and picks the **single** open feature request with the highest net score, provided that score is **≥ 5**. The AI coding agent then:

1. Reads the full issue thread, including every attached image.
2. Synthesizes a consolidated spec from the discussion.
3. Implements it in a new branch.
4. Runs `lint`, `tsc --noEmit`, `build`, and `test`.
5. Opens a pull request and enables auto-merge. If every required check on `master` passes, the PR is merged and the issue is closed.

If the request is ambiguous, controversial, or too large to attempt safely, the agent writes an abort note and the issue is labeled **`ai-failed`** for a human maintainer to look at.

### Self-evolution mode

When no community request meets the voting threshold, the agent enters **self-evolution mode**. Instead of idling, it autonomously explores the codebase, identifies a small improvement (a new feature, a bug fix, or a UX polish), creates a GitHub issue documenting the proposal, and implements it — all in the same daily run. These auto-proposed issues are labeled **`ai-self-proposed`** so you can easily tell them apart from community requests. The same validation pipeline (lint, typecheck, build, test) applies.

## Issue labels

| Label              | Meaning                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| `feature-request`  | A community feature proposal eligible for voting. Applied automatically by the template. |
| `needs-discussion` | Scope is unclear; the automation will skip this issue until the label is removed.       |
| `ai-in-progress`   | The agent is currently working on this issue. Do not submit a PR for it.                |
| `ai-implemented`   | The agent has opened a PR and it was (or will be) auto-merged.                          |
| `ai-failed`        | The auto-run failed. A human maintainer will investigate.                               |
| `ai-generated`     | Applied to PRs authored by the AI agent.                                                |
| `ai-self-proposed` | The AI agent proposed this improvement autonomously (self-evolution mode).               |
| `wontfix`          | Rejected. The automation will never pick it up.                                         |

## What the agent will and won't touch

**Won't touch (hard rules):**

- Anything under `.github/**` (workflows, issue templates, action configs)
- `package-lock.json` by hand
- Any file that looks like a secret (`*.key`, `*.pem`, `.env*`)

**Will be cautious about (but may touch if necessary):**

- `src/services/` — especially client/signing/key handling code
- `package.json` dependencies — added only with justification in the commit message
- Existing i18n keys — new keys are appended to the end of locale files per [CLAUDE.md](./CLAUDE.md); existing keys are never reordered

## Safety net

Auto-merge is gated by required status checks on `master`:

- `Lint`
- `Typecheck`
- `Build`
- `Test`

If any check fails, the PR stays open and will not merge. A human maintainer is expected to review failed runs.

## Submitting a PR directly

You can still open a PR yourself for anything — bug fixes, documentation, translations, or feature work on issues that aren't in the automation queue. Please:

- Run `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm run test` before opening the PR.
- Follow the conventions in [CLAUDE.md](./CLAUDE.md), especially the i18n rules.
- Keep changes focused; one concern per PR.

## Finding the most-wanted requests

Sorted by net 👍:

**[Open feature requests ranked by votes →](../../issues?q=is%3Aissue+is%3Aopen+label%3Afeature-request+sort%3Areactions-%2B1-desc)**

## Questions

For questions not tied to a specific feature request, reach out on Nostr rather than opening an issue.
