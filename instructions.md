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

## Getting set up

The pool needs an Elektron Net full node to subscribe to new-block events and
submit found blocks. The recommended setup is to install the
StartOS-native [Elektron Net](https://github.com/kutlusoy/elektron-net-startos)
package on the **same** StartOS server — then the two services talk to each
other over the internal Docker network, no router/firewall changes required.

### A) Local Elektron Net on the same StartOS (recommended)

1. Install the **Elektron Net** package on StartOS and let it sync.
2. In **Elektron Net → Configure → RPC**, add an `rpcauth` entry (use the
   [`rpcauth.py`](https://github.com/bitcoin/bitcoin/blob/master/share/rpcauth/rpcauth.py)
   helper to generate one) so the pool can authenticate with username +
   password. Restart Elektron Net so the new auth takes effect.
3. Install **Elektron Net Pool** on the same StartOS.
4. Open **Elektron Net Pool → Elektron Node RPC** action and fill in:
   - **Elektron Node RPC URL:** `http://elektrond.startos`
   - **Elektron Node RPC Port:** `8332`
   - **Elektron Node RPC User / Password:** the credentials you generated in
     step 2
   - **Elektron Node ZMQ Host** *(optional, enables push notifications for new
     blocks):* `tcp://elektrond.startos:28332`
   - **Network:** `mainnet` (or `regtest` for testing)
5. Open the **Configure** action and set:
   - **Pool Identifier** — the string that appears in your coinbase
     transactions.
   - **Server Display URL** — which of the Stratum interface's plain-TCP
     addresses to show on the dashboard. Defaults to the device's `.local`
     hostname.
   - **Secure Server Display URL** — which TLS address to display for
     `stratum+tls` connections.
6. Point your mining hardware at the Stratum server.

The ZMQ-Autoconfig task wired in this package will automatically flip
`zmqEnabled: true` in Elektron Net's `bitcoin.conf` the first time the pool
starts — you don't need to enable it manually.

> **Note on hostnames:** `elektrond.startos` works on StartOS 0.3.6+. On older
> versions try `elektrond.embassy` or just `elektrond`. You can confirm the
> exact address in StartOS UI → *Service “Elektron Net” → Interfaces → RPC
> Interface*.

### B) Remote Elektron Net node (advanced / not recommended)

If you really must point the pool at a node on a different machine, make sure
you know what you're doing — exposing the JSON-RPC port to the public internet
is dangerous. Use a VPN / Tailscale / WireGuard tunnel and address the node
over the tunnel's private IP, never via a port-forward on your router. In the
`elektron-rpc` action use that private IP (e.g. `http://10.0.0.5`) instead of
`elektrond.startos`.

## Connecting miners

- **Plain TCP** — `stratum+tcp://<host>:3333`
- **TLS** — `stratum+tls://<host>:4333` (StartOS terminates TLS and forwards
  to the pool)

## Limitations

- The TLS certificate on port 4333 is issued by your device's StartOS root CA.
  Most ASIC firmwares skip certificate validation or don't speak
  `stratum+tls`; plain TCP on 3333 always works.
