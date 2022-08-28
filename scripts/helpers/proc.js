/** @param {NS} ns */
export function killAllScripts(ns, servers) {
  for (const server of servers) {
    ns.killall(server);
  }
}

/** @param {NS} ns */
export async function copyFilesToServers(ns, files, origin, destinations) {
  for (const destination of destinations) {
    await ns.scp(files, destination, origin);
  }
}

/** @param {NS} ns */
export function getScriptThreadCount(ns, script, server) {
  const scriptRam = ns.getScriptRam(script);
  const serverMaxRam = ns.getServerMaxRam(server);
  const serverUsedRam = ns.getServerUsedRam(server);
  const serverAvailableRam = serverMaxRam - serverUsedRam;

  return Math.floor(serverAvailableRam / scriptRam);
}
