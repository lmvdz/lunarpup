# 25 — Converge on the upstream toroidal-moon reset

STATUS: open
PRIORITY: p0
REPOS: lunarpup
COMPLEXITY: architectural
TOUCHES: src/, netlify/, plans/lunar-pup-vision/, AGENTS.md, package.json, index.html
BLOCKED_BY:

## What happened

On 2026-07-10 upstream (`Tsurgcom/lunarpup`) merged the converged mega PR #32
(merge commit `0885f2f`, 12:01 UTC) and then, between 14:42 and 15:49 UTC,
force-pushed `main` (and `dev`) to a brand-new three-commit history with **no
common ancestor** to anything that existed before:

- `ec4309b` Add Lunar Pup moon bowl skate game with R3F and Trystero multiplayer.
- `2986577` infinite terrain gen
- `97f75bb` Add finite toroidal moon, lunar map, and click-to-teleport.

This is the third ground-up reset (vanilla → R3F rewrite → this). No issue, PR
comment, or commit message explains it. The live Netlify site still serves the
pre-merge build (`2438449`); the new tree has no `netlify.toml`, Functions,
Edge Functions, or `version.json`.

## Where everything is preserved

- `lmvdz/lunarpup` branch `archive/merged-main-2026-07-10` = merge commit
  `0885f2f`, the exact post-#32 upstream main that was wiped.
- `lmvdz/lunarpup` branch `integration-main` (= local `main`) = our full line,
  tip `ce5b391`, including the PR #30 relay-security port.
- The new upstream base is `origin/main` (`97f75bb`), also at
  `origin/feat/finite-toroidal-moon` and `origin/dev`.

## What upstream now is

A deliberately small vite game (~21 source files under `src/game/`): R3F +
Drei, Trystero (`@trystero-p2p/nostr`) serverless P2P multiplayer, Newtonian
physics (`physics.ts`, "no hover/coyote/air-leveling hacks — keep physics
honest"), heightfield toroidal-moon terrain, procedural skate dog, HUD in
React, lunar map with click-to-teleport. **No game server at all** — the Bun
WS server, Netlify Functions relay, session tokens, sqlite services, economy,
cosmetics, lootboxes, gamemodes, and Solana layer have no counterpart.
Upstream's new `AGENTS.md` documents the architecture and pins vite on port
3000, `bun run build` = typecheck + build.

## Why this is a decision, not a chore

Concerns 16–24 assume the server-authoritative architecture (guest principals,
authenticated runs, transactional economy, private multiplayer continuity)
that upstream just deleted. Rebasing 141 commits onto an unrelated tree is not
mechanical; and the maintainer merging #32 at noon then replacing the repo
three hours later is a direction signal that needs a human read before we
spend convergence effort. Options, roughly:

1. **Adopt the reset as the new base** (concern-13 playbook): treat `97f75bb`
   as canonical, port our systems onto it selectively as mods/extensions,
   starting from the harness-as-mod boundary. Trystero P2P replaces the WS
   relay, which moots most of the netlify/ security surface but reopens the
   trust model (P2P peers are untrusted by construction — snapshots need the
   same validation discipline).
2. **Continue on our line** and offer upstream a PR against the new base only
   for what they visibly want (unlikely to land, given the reset).
3. **Hybrid**: keep shipping our product from `integration-main` (it deploys
   fine), while tracking upstream's new base as a research input.

Per the division of labor, convergence direction is decided with codex (it
owns the canonical convergence branch); the economy/server systems are ours.

## Approach (once direction is decided)

Mirror concern 13: build a verified conflict/feature map (upstream file ↔ our
counterpart ↔ disposition), converge in a dedicated worktree branch, land via
PR, keep every ported unit behind the verification gate. Do not delete our
server code while any open concern still needs it.

## Evidence: UI/UX ethos port difficulty (assessed 2026-07-10)

Upstream `dev` = `main` = `97f75bb`. Its whole UI surface is ~590 lines
(App 74, Hud 84, LunarMap 212, styles.css 218): one always-on fixed HUD at a
single z-level, no menus, no pause, no navigation, no focus management, no
reduced-motion, six ad-hoc CSS variables whose names (`--ink`, `--muted`,
`--accent`, `--panel`, `--line`) are a subset of our token vocabulary, and a
Space Grotesk / IBM Plex Mono type pairing that is arguably better than our
Segoe stack. React already owns every pixel — there are no imperative
listeners to unwind, which was the hardest part of concern 14.

Port buckets:
- **Drop-in (pure, tested, zero coupling):** `src/ui/tokens.css` (merge, keep
  their fonts), `experienceState.ts` reducer + 10 tests, `motion.ts`,
  `menuState.ts`, `controlsLegendState.ts`, `toast.ts` + `ToastHost`,
  `docs/product-quality-budgets.md` verbatim. ~1 focused day.
- **Adapt:** `ExperienceProvider` needs upstream equivalents for its two game
  hooks (`pauseController`, `setMenuOrbit`); main/pause/Settings/Controls
  surfaces rebuilt on the ported reducer in upstream's HUD idiom; HUD-only
  play means their permanent room-join panel becomes a focused "play
  together" view and the brand header becomes menu-only; add the explicit
  layer contract while the surface is still one stratum. ~2–3 days.
- **Re-spec, don't port:** the Playwright assertion list (navigation matrix,
  elementsFromPoint layer checks, focus trap/restore, lifecycle balance, zero
  console errors) rewritten against the new DOM — it IS the executable ethos.
- **Stays behind:** GameProvider, gamemode/cosmetics/lootbox/chat/tuning
  views — their systems don't exist upstream. Presence/roster re-maps cheaply
  onto Trystero's `peerCount`/`selfId`.

Net: the ethos ports in roughly a week of bounded PRs, and small early PRs on
their fresh base are the shape most likely to survive the reset pattern.

## Verify

- A written disposition for every `src/game/` file in `97f75bb` and every
  major subsystem of `integration-main` (port / drop / defer, with reason).
- Whichever base is chosen: `bun run typecheck`, full test suite, production
  build, and a real-browser multiplayer session pass on the converged result.
- Archive branches remain intact on the fork.
- Concerns 16–24 have their BLOCKED_BY/TOUCHES updated to match the decided
  architecture instead of silently pointing at deleted files.
