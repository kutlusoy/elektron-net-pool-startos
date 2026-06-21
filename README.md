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

The CI workflow (`.github/workflows/sideload.yml`) reads the canonical
package version from `startos/versions/current.ts` (e.g. `4.0.1:2`) and
embeds it in the built artifact and `.s9pk` filename, encoded as
`<base>-4.0.1-r2.s9pk` so the revision (`:N`) survives in a POSIX-safe
form. Bumping the version in `current.ts` automatically renames the next
release artifact.

See `instructions.md` for end-user setup.

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
