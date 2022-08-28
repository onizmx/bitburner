import { getScriptThreadCount } from 'scripts/helpers/proc';

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');

  const [data, ...servers] = arguments[0].args;
  const { config, targetServer } = JSON.parse(data);

  let totalScriptThreadCount = 0;
  for (const server of servers) {
    const scriptThreadCount = getScriptThreadCount(ns, config.hackScript, server);
    if (scriptThreadCount > 0) {
      ns.exec(config.hackScript, server, scriptThreadCount, targetServer.hostname);
      ns.printf('executed %s with %d threads on %s', config.hackScript, scriptThreadCount, server);
      totalScriptThreadCount = totalScriptThreadCount + scriptThreadCount;
      continue;
    }
    ns.printf('zero available thread count on %s. skip exec...', server);
  }

  ns.printf('executed %s with total thread count of %d', config.hackScript, totalScriptThreadCount);
}
