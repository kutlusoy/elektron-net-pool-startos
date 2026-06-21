# CI / Build with GitHub Actions

This folder contains the GitHub Actions workflows that build the
`elektron-net-pool` StartOS package (`.s9pk`). They are mirrored from the
upstream [`Start9Labs/public-pool-startos`](https://github.com/Start9Labs/public-pool-startos/tree/master/.github/workflows)
template and adapted to this repository's `main` branch..

All workflows delegate the actual build/release logic to the reusable
workflows in
[`start9labs/shared-workflows`](https://github.com/Start9Labs/shared-workflows),
so updates to the StartOS build pipeline are picked up automatically.

## Workflows

| File | Trigger | Purpose |
| ---- | ------- | ------- |
| `workflows/sideload.yml`      | manual or push of tag `elektron-net-pool-v*` | **Recommended for personal use.** Builds the `.s9pk` and uploads it as a workflow artifact for sideloading onto your own StartOS server. No secrets, no S3 / registry needed. |
| `workflows/build.yml`         | `pull_request` against `main` (and manual `workflow_dispatch`) | Validates that every PR still produces a buildable `.s9pk`. Skips draft PRs and markdown-only changes. |
| `workflows/tagAndRelease.yml` | `push` to `main` (excluding markdown) | **Marketplace pipeline.** Reads the version from `startos/manifest`, creates a matching git tag if one does not exist, and triggers the release pipeline. Kept in place so Start9 can adopt this package upstream without changes. |
| `workflows/release.yml`       | `push` of a tag matching `v*.*` | **Marketplace pipeline.** Builds the final `.s9pk`, uploads it to the configured S3 bucket and publishes it to the StartOS registry. |

## Sideloading (personal use)

No configuration is required — the workflow runs out of the box on a fresh
clone of the repo. The upstream shared build workflow auto-generates a
Wegwerf (throwaway) developer signing key when no `DEV_KEY` secret is set,
which is exactly what you want for personal sideloading: StartOS will warn
that the package is unsigned-by-a-trusted-party and let you install it
anyway.

1. Tag the commit you want to ship and push the tag:

   ```sh
   git tag elektron-net-pool-v0.1.0
   git push origin elektron-net-pool-v0.1.0

   if to delete and tag new

   git tag -d elektron-net-pool-v0.1.0 && git push origin :elektron-net-pool-v0.1.0 && git tag elektron-net-pool-v0.1.0 && git push origin elektron-net-pool-v0.1.0

   ```

   

   Or trigger it manually under **Actions → Sideload → Run workflow**.
2. When the run finishes, open it and download the `.s9pk` from the
   **Artifacts** section at the bottom of the page.
3. In your StartOS UI, go to **System → Sideload Service**, upload the
   `.s9pk`, and install.

### Optional: stable signing key

If you want every build to be signed by the *same* key (so StartOS treats
updates as coming from the same publisher), generate one locally and store
it as the `DEV_KEY` repository secret:

```sh
start-cli init-key
cat ~/.startos/developer.key.pem    # paste full contents (incl. BEGIN/END lines)
                                    # into Settings → Secrets and variables
                                    # → Actions → New repository secret: DEV_KEY
```

This is purely optional — the workflow doesn't reference `DEV_KEY` directly
any more, but the underlying shared workflow will pick it up automatically
if the secret exists.

## Marketplace pipeline configuration (only for Start9 upstream)

If you (or Start9) plan to publish through a StartOS registry and a public
S3 bucket, configure the following under
Settings → Secrets and variables → Actions:

| Name | Type | Example | Description |
| ---- | ---- | ------- | ----------- |
| `DEV_KEY`            | Secret   | — | StartOS developer signing key (PEM contents). |
| `S3_ACCESS_KEY`      | Secret   | — | Access key for the S3 bucket hosting the published `.s9pk`. |
| `S3_SECRET_KEY`      | Secret   | — | Matching secret key. |
| `REFERENCE_REGISTRY` | Variable | `https://registry.start9.com` | Registry consulted to determine the next version. |
| `RELEASE_REGISTRY`   | Variable | `https://registry.start9.com` | Registry the built `.s9pk` is published to. |
| `S3_S9PKS_BASE_URL`  | Variable | `https://s9pks.example.com`  | Public base URL where the uploaded `.s9pk` will be reachable. |

Without these, `release.yml` and `tagAndRelease.yml` will simply fail at
the upload step — harmless if you are only sideloading.

## Local build (no GitHub Actions)

The same `.s9pk` can be built on your own machine — the workflows are just
CI wrappers around the project's `Makefile`:

```sh
# one-time setup
start-cli init-key                   # creates ~/.startos/developer.key.pem

# build
make                                 # x86_64 + aarch64 (+ riscv64) s9pks
make x86_64                          # single arch only

# install to a configured StartOS host (~/.startos/config.yaml)
make install
```

See the top-level [`README.md`](../README.md) for the full local build and
development workflow.
