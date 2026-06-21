# CI / Build with GitHub Actions

This folder contains the GitHub Actions workflows that build and publish the
`elektron-net-pool` StartOS package (`.s9pk`). They are mirrored from the
upstream [`Start9Labs/public-pool-startos`](https://github.com/Start9Labs/public-pool-startos/tree/master/.github/workflows)
template and adapted to this repository's `main` branch.

All three workflows delegate the actual build/release logic to the reusable
workflows in
[`start9labs/shared-workflows`](https://github.com/Start9Labs/shared-workflows),
so updates to the StartOS build pipeline are picked up automatically.

## Workflows

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `workflows/build.yml`         | `pull_request` against `main` (and manual `workflow_dispatch`) | Builds the `.s9pk` for every PR to verify it compiles. Skips draft PRs and markdown-only changes. |
| `workflows/tagAndRelease.yml` | `push` to `main` (excluding markdown) | Reads the version from `startos/manifest`, creates a matching git tag if one does not exist, and triggers the release pipeline. |
| `workflows/release.yml`       | `push` of a tag matching `v*.*` | Builds the final `.s9pk`, uploads it to the configured S3 bucket and publishes it to the StartOS registry. |

## Required repository configuration

Before the release pipelines can succeed, configure the following on the
GitHub repository (Settings → Secrets and variables → Actions).

### Secrets

| Name | Used by | Description |
| ---- | ------- | ----------- |
| `DEV_KEY`       | build, tagAndRelease, release | StartOS developer signing key used to sign the `.s9pk`. |
| `S3_ACCESS_KEY` | tagAndRelease, release | Access key for the S3 bucket that hosts the published `.s9pk`. |
| `S3_SECRET_KEY` | tagAndRelease, release | Secret key matching `S3_ACCESS_KEY`. |

### Variables

| Name | Used by | Example | Description |
| ---- | ------- | ------- | ----------- |
| `REFERENCE_REGISTRY` | tagAndRelease | `https://registry.start9.com` | Registry consulted to determine the next version. |
| `RELEASE_REGISTRY`   | tagAndRelease, release | `https://registry.start9.com` | Registry the built `.s9pk` is published to. |
| `S3_S9PKS_BASE_URL`  | tagAndRelease, release | `https://s9pks.example.com` | Public base URL where the uploaded `.s9pk` will be reachable. |

If you only want PR builds (no publishing), just `DEV_KEY` is required —
`release.yml` and `tagAndRelease.yml` will simply fail at the upload step
until the S3 and registry values are configured.

## How to trigger a build

### 1. Pull request build (validation only)

Open a pull request against `main`. The **Build** workflow runs automatically
and the resulting `.s9pk` is available as a workflow artifact on the run
page (Actions → Build → the run → *Artifacts*).

You can also trigger it manually:

1. Go to **Actions → Build**.
2. Click **Run workflow**, pick a branch, and confirm.

### 2. Tag + release from `main`

Push a commit to `main` (anything that isn't markdown-only). The
**Tag and Release** workflow will:

1. Read the version from `startos/manifest.ts`.
2. Create the matching `vX.Y.Z` git tag if it does not exist.
3. Hand off to the **Release** workflow.

### 3. Release from an existing tag

Push a tag that matches `v*.*` to trigger **Release** directly:

```sh
git tag v0.1.0
git push origin v0.1.0
```

The workflow builds the `.s9pk` for every arch listed in the `Makefile`
(`x86`, `arm`), signs it with `DEV_KEY`, uploads it to S3 and publishes it
to `RELEASE_REGISTRY`.

## Local build (without GitHub Actions)

The same `.s9pk` can be built locally — the workflows are just CI wrappers
around the project's `Makefile`:

```sh
make             # x86_64 + aarch64 s9pk
make x86_64      # single arch
make install     # install to the StartOS host in ~/.startos/config.yaml
```

See the top-level [`README.md`](../README.md) for the full local build and
development workflow.
