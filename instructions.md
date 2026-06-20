# Elektron Net Pool

A self-hosted Stratum mining pool for the **Elektron Net** network, based on
[Public Pool](https://github.com/benjamin-wilson/public-pool) and ported to
StartOS.

## What you get on StartOS

- A **Web UI** interface — the Elektron Net Pool dashboard for watching workers,
  hashrate, and block discoveries.
- A **Stratum Server** interface — plain TCP on port 3333 and TLS
  (`stratum+tls`) on port 4333 — the endpoint your mining hardware points at.
- An **Elektron Node RPC** action to connect the pool to your Elektron Net full
  node (RPC + optional ZMQ).

> Note: There is no StartOS-native Elektron Net node package (yet), so the
> Elektron Net node is configured manually — it does **not** need to run on the
> same StartOS server.

## Getting set up

1. Make sure you have an **Elektron Net** full node running and reachable from
   the StartOS server. In your `elektron.conf` allow RPC from the StartOS
   server's network, e.g.:

   ```
   rpcallowip=172.16.0.0/12
   server=1
   # optional, for block notifications:
   zmqpubrawblock=tcp://*:3000
   ```

2. Install **Elektron Net Pool** on StartOS.
3. Open the **Elektron Node RPC** action and fill in:
   - **Elektron Node RPC URL** (e.g. `http://192.168.1.100`)
   - **Elektron Node RPC Port** (default `8332`)
   - either **RPC User / RPC Password** *or* the path to the **Cookie File**
   - optionally the **ZMQ Host** (e.g. `tcp://192.168.1.100:3000`)
   - the **Network** (`mainnet` or `regtest`)
4. Open the **Configure** action and set:
   - **Pool Identifier** — the string that appears in your coinbase
     transactions.
   - **Server Display URL** — which of the Stratum interface's plain-TCP
     addresses to show on the dashboard. Defaults to the device's `.local`
     hostname.
   - **Secure Server Display URL** — which TLS address to display for
     `stratum+tls` connections.
5. Point your mining hardware at the Stratum server.

## Connecting miners

- **Plain TCP** — `stratum+tcp://<host>:3333`
- **TLS** — `stratum+tls://<host>:4333` (StartOS terminates TLS and forwards
  to the pool)

## Limitations

- The TLS certificate on port 4333 is issued by your device's StartOS root CA.
  Most ASIC firmwares skip certificate validation or don't speak
  `stratum+tls`; plain TCP on 3333 always works.
