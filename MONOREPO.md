# Monorepo Migration Bootstrap

This repository now acts as the control layer for the OpenAuthster workspace while the codebase is still physically split across sibling repositories.

## Why this phase exists

The runtime repos already behave like one product, but several sibling repositories currently have in-flight local changes. A direct move into `apps/*` and `packages/*` right now would make it harder to preserve history and avoid conflicts.

This phase gives you immediate value without that risk:

- one root entrypoint for install, test, check, and build commands
- a single place to standardize migration steps
- a clean handoff point for the later physical consolidation

## Current root commands

Run these from this repository:

```bash
bun run install:core
bun run check
bun run test
bun run build
```

Extended commands:

```bash
bun run install:all
bun run check:all
bun run test:all
bun run build:all
bun run docs:build
```

You can also target specific repos through the generic runner:

```bash
bun run workspace -- test --repo=issuer,shared
bun run workspace -- check --scope=all --continue-on-error
```

## Included repos

- `issuer` -> `../openauth-multitenant-server`
- `webui` -> `../openauth-webui`
- `shared` -> `../openauth-webui-shared-types`
- `tester` -> `../openauth-webui-tester`
- `docs` -> `../openauthster-doc`

## What this is not yet

This is not the final monorepo layout yet.

The following still remain to be done:

1. Clean or shelve local changes in the child repos.
2. Import the runtime repos into this repository with history preservation.
3. Replace git-pinned shared dependencies with local workspace references.
4. Collapse duplicate lockfiles and promote shared config to the root.
5. Add root CI once the source trees are actually inside one repository.

## Recommended next move

Once the active changes in the sibling repos are either committed or intentionally parked, the next implementation step should be a history-preserving import of:

- `openauth-multitenant-server`
- `openauth-webui`
- `openauth-webui-shared-types`
- `openauth-webui-tester`

Keep `openauthster-doc` separate until you want docs to join the same release train.