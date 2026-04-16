<div align="center">
  <picture>
    <img src="./resources/logo-light.svg" alt="Jumble Ouro Logo" width="400" />
  </picture>
  <p>logo designed by <a href="http://wolfertdan.com/">Daniel David</a></p>
</div>

# Jumble Ouro

**Jumble Ouro** (or just **ouro**) is a user-friendly Nostr client for exploring relay feeds, originally forked from [Jumble](https://github.com/CodyTseng/jumble) and now developed as an independent project. The twist: every feature in ouro is proposed, voted on, and implemented end-to-end by an AI coding agent, with no humans in the loop for the happy path.

The name comes from _ouroboros_ — the project feeds itself: community ideas in, shipped code out, repeat.

## 🤖 Fully Automated Community Co-Creation

You don't need to write code to shape Jumble Ouro — just tell us what you want and vote. Everything from spec to merge is automated.

1. **Propose** — Open a [Feature Request](../../issues/new?template=feature-request.yml). Describe the problem, attach screenshots or mockups if helpful.
2. **Vote** — React with 👍 to support and 👎 to oppose any open request. The score is `👍 − 👎`.
3. **Watch it ship** — Every day at 20:00 UTC, the open feature request with the highest net score (≥ 5) is automatically picked up by the AI agent, implemented, tested, and merged to `master` if all checks pass.

No triage meetings, no roadmap committee — the issue tracker _is_ the roadmap, and votes are the only currency.

**[→ See the most-wanted requests, ranked by votes](../../issues?q=is%3Aissue+is%3Aopen+label%3Afeature-request+sort%3Areactions-%2B1-desc)**

### 🧬 Self-Evolution

When no community request meets the voting threshold, the agent doesn't idle — it enters **self-evolution mode**. It autonomously explores the codebase, identifies a small improvement (a new feature, a bug fix, or UX polish), creates an issue documenting the proposal, and implements it. The goal: continuously push Jumble Ouro toward being a better Nostr client — responsive, decentralized, user-friendly, and with a clean, unified UI. Self-proposed changes are labeled [`ai-self-proposed`](../../issues?q=label%3Aai-self-proposed) so you can always tell what came from the community and what the agent dreamed up on its own.

For the full rules, label meanings, and what the agent will or won't touch, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Relationship to Jumble

Jumble Ouro started as a fork of [Jumble](https://github.com/CodyTseng/jumble) but is now an independent project — it does not track Jumble as an upstream, and the two codebases are expected to diverge over time. Anything that proves itself in ouro is fair game for Jumble to cherry-pick back: good features, bug fixes, refactors. If you're looking for the stable, maintainer-curated client, use Jumble at [https://jumble.social](https://jumble.social); if you want to vote features into existence, you're in the right place.

## Run Locally

```bash
# Clone this repository
git clone https://github.com/CodyTseng/jumble-ouro.git

# Go into the repository
cd jumble-ouro

# Install dependencies
npm install

# Run the app
npm run dev
```

## Run Docker

```bash
# Clone this repository
git clone https://github.com/CodyTseng/jumble-ouro.git

# Go into the repository
cd jumble-ouro

# Run the docker compose
docker compose up --build -d
```

After finishing, access: http://localhost:8089

## Sponsors

<a target="_blank" href="https://opensats.org/">
  <img alt="open-sats-logo" src="./resources/open-sats-logo.svg" height="44"> 
</a>

## Donate

If you like this project, you can buy me a coffee :)

- **Lightning:** ⚡️ codytseng@getalby.com ⚡️
- **Bitcoin:** bc1qwp2uqjd2dy32qfe39kehnlgx3hyey0h502fvht
- **Geyser:** https://geyser.fund/project/jumble

## License

MIT
