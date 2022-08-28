import { calculateScriptThreadCount } from 'scripts/helpers/proc.helper';

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();

  const [data, ...servers] = arguments[0].args;
  const { config, targetServer } = JSON.parse(data);
  const hackScript = config.scripts.hack;

  let totalScriptThreadCount = 0;
  for (const server of servers) {
    const scriptThreadCount = calculateScriptThreadCount(ns, server, hackScript);
    if (scriptThreadCount > 0) {
      ns.exec(hackScript, server, scriptThreadCount, targetServer.hostname);
      ns.printf('executed %s with %d threads on %s', hackScript, scriptThreadCount, server);
      totalScriptThreadCount = totalScriptThreadCount + scriptThreadCount;
      continue;
    }
    ns.printf('zero available thread count on %s. skip exec...', server);
  }

  ns.printf('executed %s with total thread count of %d', hackScript, totalScriptThreadCount);
}
