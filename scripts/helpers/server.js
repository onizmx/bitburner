/** @param {NS} ns */
export function scanAllServers(ns, scanned = new Set(), toBeScanned = new Set(['home'])) {
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
export function nukeAllServers(ns, servers) {
  const nukedServers = [];
  for (const server of servers) {
    try {
      ns.brutessh(server);
      ns.ftpcrack(server);
      ns.relaysmtp(server);
      ns.httpworm(server);
      ns.sqlinject(server);
      ns.nuke(server);
    } catch (err) {
      continue;
    }
    nukedServers.push(server);
  }

  return nukedServers;
}

/** @param {NS} ns */
export function getTargetServer(ns, servers, minTargetGrowth, maxTargetHackingLevel) {
  const targetServer = { hostname: '', growth: 0, maxMoney: 0, currentMoney: 0 };
  for (const server of servers) {
    const requiredHackingLevel = ns.getServerRequiredHackingLevel(server);
    if (requiredHackingLevel < maxTargetHackingLevel) {
      const serverGrowth = ns.getServerGrowth(server);
      const serverMaxMoney = ns.getServerMaxMoney(server);
      const serverCurrentMoney = ns.getServerMoneyAvailable(server);
      if (serverGrowth > minTargetGrowth && serverMaxMoney > targetServer.maxMoney) {
        targetServer.hostname = server;
        targetServer.growth = serverGrowth;
        targetServer.maxMoney = serverMaxMoney;
        targetServer.currentMoney = serverCurrentMoney;
      }
    }
  }

  return targetServer;
}

/** @param {NS} ns **/
export function getAvailableServerOptions(ns) {
  const serverOptions = [];
  let exponent = 1;
  while (true) {
    const ram = Math.pow(2, exponent);
    const cost = ns.getPurchasedServerCost(ram);
    if (cost === Infinity) {
      break;
    }
    serverOptions.push({ index: exponent, ram, cost });
    exponent = exponent + 1;
  }

  return serverOptions;
}
