// run ./scripts/2022-08-25/dist.js

const metadata = {
  createdDate: '2022-08-25',
};

/** @param {NS} ns */
export async function main(ns) {
  ns.tail();

  const hostname = ns.getHostname();
  const scanned = new Set();
  const toBeScanned = new Set([hostname]);

  const allServers = scanAllServers(ns, scanned, toBeScanned);

  allServers.forEach(server => ns.print(server));
  ns.printf('found %d servers', allServers.size);
}

/** @param {NS} ns */
function scanAllServers(ns, scanned, toBeScanned) {
  const scanTargets = [...toBeScanned];
  for (const scanTarget of scanTargets) {
    const servers = ns.scan(scanTarget);
    scanned.add(scanTarget);
    toBeScanned.delete(scanTarget);
    servers.forEach(server => !scanned.has(server) && toBeScanned.add(server));
  }

  const nextScanTargets = [...toBeScanned];
  const hasScannedEvery = nextScanTargets.every(server => scanned.has(server));
  if (hasScannedEvery === true) {
    return scanned;
  }

  return scanAllServers(ns, scanned, toBeScanned);
}
