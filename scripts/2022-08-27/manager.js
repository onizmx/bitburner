/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');

  const [data, ...allServers] = arguments[0].args;
  const { config, targetServer } = JSON.parse(data);

  const action = {
    current: config.action.HACK,
    next: config.action.HACK,
    waitTime: 0,
    waitTimeBuffer: 0.05,
  };

  while (true) {
    switch (action.next) {
      case config.action.GROW:
        action.waitTime = ns.getGrowTime(targetServer.hostname);
        action.current = config.action.GROW;
        action.next = config.action.WEAKEN;
        break;
      case config.action.WEAKEN:
        action.waitTime = ns.getWeakenTime(targetServer.hostname);
        action.current = config.action.WEAKEN;
        action.next = config.action.HACK;
        break;
      default:
        action.waitTime = ns.getHackTime(targetServer.hostname);
        action.current = config.action.HACK;
        action.next = config.action.GROW;
        break;
    }

    const actionScript = `${config.actionPath}/${action.current}.js`;
    executeActionOnServers(ns, actionScript, allServers, targetServer.hostname);
    await ns.sleep(action.waitTime + action.waitTime * action.waitTimeBuffer);
  }
}

/** @param {NS} ns */
function executeActionOnServers(ns, script, servers, targetServer) {
  for (const server of servers) {
    const actionThreadCount = getActionThreadCount(ns, script, server);
    if (actionThreadCount > 0) {
      ns.exec(script, server, actionThreadCount, targetServer);
    } else {
      ns.printf('action thread count is 0 for %s', server);
    }
  }
}

/** @param {NS} ns */
function getActionThreadCount(ns, script, server) {
  const scriptRam = ns.getScriptRam(script);
  const serverMaxRam = ns.getServerMaxRam(server);
  const serverUsedRam = ns.getServerUsedRam(server);
  const serverAvailableRam = serverMaxRam - serverUsedRam;

  return Math.floor(serverAvailableRam / scriptRam);
}
