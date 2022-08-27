// run ./scripts/2022-08-27/main.js

const metadata = {
  createdDate: '2022-08-27',
};

const config = {
  manager: `/scripts/${metadata.createdDate}/manager.js`,
  actionPath: `/scripts/${metadata.createdDate}/action`,
  action: {
    HACK: 'hack',
    GROW: 'grow',
    WEAKEN: 'weaken',
  },
};

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');

  const hostname = ns.getHostname();
  const scanned = new Set();
  const toBeScanned = new Set([hostname]);

  const allServers = scanAllServers(ns, scanned, toBeScanned);
  ns.printf('found %d servers', allServers.size);

  const targetServer = getTargetServer(ns, allServers);
  ns.printf('target hostname: %s, max money: %d', targetServer.hostname, targetServer.maxMoney);

  const scriptsToCopy = [];
  Object.values(config.action).forEach(action => {
    scriptsToCopy.push(`${config.actionPath}/${action}.js`);
  });
  for (const server of allServers) {
    await ns.scp(scriptsToCopy, server, hostname);
  }

  ns.spawn(config.manager, 1, JSON.stringify({ config, allServers, targetServer }));
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

/** @param {NS} ns */
function getTargetServer(ns, servers) {
  const targetServer = { hostname: '', maxMoney: 0 };
  const playerHackingLevel = ns.getHackingLevel();

  for (const server of servers) {
    const requiredHackingLevel = ns.getServerRequiredHackingLevel(server);
    if (requiredHackingLevel < playerHackingLevel / 3) {
      const serverMaxMoney = ns.getServerMaxMoney(server);
      if (serverMaxMoney > targetServer.maxMoney) {
        targetServer.hostname = server;
        targetServer.maxMoney = serverMaxMoney;
      }
    }
  }

  return targetServer;
}
