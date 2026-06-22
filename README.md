# Elektron Net Pool – StartOS package

This repository builds an [Elektron Net Pool](https://github.com/kutlusoy/elektron-net-pool)
service package for [StartOS](https://start9.com). It is structured after the
upstream [public-pool-startos](https://github.com/Start9Labs/public-pool-startos)
template and adapted for the Elektron Net network.

## What it ships

- **Elektron Net Pool backend** (`kutlusoy/elektron-net-pool`) — Stratum +
  REST API
- **Elektron Net Pool UI** (`kutlusoy/elektron-net-pool-ui`) — Angular
  dashboard, served by nginx on port 80
- **Stratum** on TCP 3333 with StartOS-terminated TLS on 4333

## Build

```sh
make             # universal/x86_64 + aarch64 s9pk
make x86_64      # single-arch
make install     # install to the StartOS host configured in ~/.startos/config.yaml
```

See `instructions.md` for end-user setup.

## Releasing

The CI workflow (`.github/workflows/sideload.yml`) is triggered by a git
tag of the form `v<X.Y.Z>` and creates a GitHub Release named
`Elektron Net Pool StartOS Release v<X.Y.Z>` with the built `.s9pk`
attached.

### Version format and the `:N` revision suffix

`@start9labs/start-sdk` requires the package version literal in
`startos/versions/current.ts` to follow the **exver** format
`<X.Y.Z>:<N>`, where:

- `X.Y.Z` is the upstream Elektron Net Pool version this build targets
- `:N` is the **StartOS package revision** — a counter that increments
  every time you re-release the *same* upstream version (e.g. for a
  packaging fix that does not change the upstream code)

Without the `:N` suffix the TypeScript build fails with
`TS2322: Type 'string' is not assignable to type 'never'`. The suffix is
a hard SDK constraint — there is no way to omit it.

### Manual workflow

1. Decide what kind of release you are cutting:

   | Scenario | Version bump |
   |----------|--------------|
   | New upstream Pool version (`X.Y.Z` changed) | Set `version: 'X.Y.Z:1'` |
   | Packaging-only fix on the same upstream version | Increment `:N` (e.g. `'4.0.3:1'` → `'4.0.3:2'`) |

2. Edit `startos/versions/current.ts` accordingly. Update the
   `releaseNotes` strings (`en_US`, `de_DE`) while you are there.

3. Commit on `main`:

   ```sh
   git add startos/versions/current.ts
   git commit -m "release: 4.0.3:2"
   git push origin main
   ```

4. Tag (the tag uses only `v<X.Y.Z>`, **without** `:N`):

   ```sh
   git tag v4.0.3
   git push origin v4.0.3
   ```

   If a tag with that name already exists (e.g. you re-released as
   `:2`), delete the old tag first:

   ```sh
   git push --delete origin v4.0.3
   git tag -d v4.0.3
   git tag v4.0.3
   git push origin v4.0.3
   ```

   The previous GitHub Release will be updated in-place by the
   workflow — old assets get replaced with the new `:N` build.

5. CI builds the `.s9pk` and attaches it to the release
   `Elektron Net Pool StartOS Release v<X.Y.Z>`.

### Where `:N` shows up (and where it doesn't)

| Surface | Format | Contains `:N`? |
|---------|--------|----------------|
| `startos/versions/current.ts` | `'4.0.3:2'` | **yes** (SDK requirement) |
| Git tag | `v4.0.3` | no |
| GitHub Release title | `Elektron Net Pool StartOS Release v4.0.3` | no |
| `.s9pk` filename | `elektron-net-pool.s9pk` (and per-arch variants) | no |
| StartOS UI / package metadata | `4.0.3:2` | yes (read from `current.ts`) |

## Configuration

The package exposes two actions:

1. **Elektron Node RPC** — RPC URL, port, credentials (user/password *or*
   cookie file), optional ZMQ host, and network selection (`mainnet` /
   `regtest`).
2. **Configure** — coinbase pool identifier and which Stratum interface
   address(es) to display on the dashboard.

Settings are persisted to `/media/startos/volumes/main/.env` (read-only-mounted
into the pool container) and `/media/startos/volumes/main/store.json`.

## Notes

- There is currently no StartOS-native package for an Elektron Net full node,
  so the node must be reachable from the StartOS host over the LAN (or
  `host.docker.internal`). The pool reads `ELEKTRON_RPC_*` env vars.
- The UI's `API_URL` is rewritten at build time to use the current page's
  origin, so the dashboard works whether you reach it via `.local`, LAN, Tor,
  or clearnet.
- The Stratum display URL placeholders (`<Stratum URL>` /
  `<Secure Stratum URL>`) are `sed`-replaced into the built UI bundle at
  service start.
- **No coinbase fee.** Elektron's per-block UTXO attestation pins the
  coinbase to a single payout output to the miner's address, so the pool
  cannot insert a dev/pool fee split. 100 % of the block reward goes to
  the connected miner.
- **Per-miner template throughput.** Each connected miner triggers its own
  `getblocktemplate` call on the Elektron node. Practical capacity is
  bound by your node's RPC throughput; tune
  `STRATUM_MAX_CONNECTIONS_PER_LISTENER` accordingly.
