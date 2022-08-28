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
export function findStaticTargetServer(ns, servers, minTargetGrowth, maxTargetHackingLevel) {
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
export function findAllServerOptions(ns) {
  const serverOptions = [];
  const purchasedServerMaxRam = ns.getPurchasedServerMaxRam();
  const maxExponent = Math.log2(purchasedServerMaxRam) + 1;
  for (const exponent of [...Array(maxExponent).keys()]) {
    const ram = Math.pow(2, exponent);
    const cost = ns.getPurchasedServerCost(ram);
    serverOptions.push({ exponent, ram, cost });
  }

  return serverOptions;
}

/** @param {NS} ns **/
export function upgradeServers(ns, dryRun, serverCount, serverNamePrefix) {
  const serversToDelete = [];
  const serversToPurchase = [];
  const currentMoney = ns.getServerMoneyAvailable('home');
  const allServerOptions = findAllServerOptions(ns);
  const maxCostPerServer = currentMoney / serverCount;

  let serverOptionToBuy;
  for (const serverOption of allServerOptions) {
    if (serverOption.cost > maxCostPerServer) {
      break;
    }
    serverOptionToBuy = serverOption;
  }
  if (serverOptionToBuy == null) {
    return null;
  }

  const purchasedServers = ns.getPurchasedServers();
  for (const server of purchasedServers) {
    const serverMaxRam = ns.getServerMaxRam(server);
    if (serverMaxRam < serverOptionToBuy.ram) {
      serversToDelete.push(server);
    }
    if (serversToDelete.length >= serverCount) {
      break;
    }
  }

  for (const _ of [...Array(serverCount).keys()]) {
    const dateTime = new Date().toISOString();
    const serverName = `${serverNamePrefix}-${dateTime}-${serverOptionToBuy.ram}`;
    serversToPurchase.push(serverName);
  }

  if (dryRun === false) {
    serversToDelete.forEach(server => ns.deleteServer(server));
    serversToPurchase.forEach(server => ns.purchaseServer(server, serverOptionToBuy.ram));
  }

  return {
    dryRun,
    option: serverOptionToBuy,
    deleted: serversToDelete,
    purchased: serversToPurchase,
  };
}
