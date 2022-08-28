import { copyFilesToServers, killAllScripts } from 'scripts/helpers/proc';
import { getTargetServer, nukeAllServers, scanAllServers } from 'scripts/helpers/server';

// run ./scripts/2022-08-28/main.js
const metadata = {
  createdDate: '2022-08-28',
};

const config = {
  manager: `/scripts/${metadata.createdDate}/manager.js`,
  hackScript: `/scripts/${metadata.createdDate}/actions/hack.js`,
  minTargetGrowth: 20,
  maxTargetHackingLevelFactor: 0.125,
};

const filesToCopy = [config.hackScript];

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();

  const allServers = [...scanAllServers(ns)];
  ns.printf('scanned %d servers', allServers.length);

  killAllScripts(ns, allServers);
  ns.printf('killed all running scripts on %d servers', allServers.length);

  const nukedServers = nukeAllServers(ns, allServers);
  ns.printf('nuked %d servers', nukedServers.length);

  const hostname = ns.getHostname();
  await copyFilesToServers(ns, filesToCopy, hostname, nukedServers);
  ns.printf('copied %d script(s) from %s to %d nuked servers', filesToCopy.length, hostname, nukedServers.length);

  const minTargetGrowth = config.minTargetGrowth;
  const maxTargetHackingLevel = ns.getHackingLevel() * config.maxTargetHackingLevelFactor;
  const targetServer = getTargetServer(ns, nukedServers, minTargetGrowth, maxTargetHackingLevel);
  ns.printf('target server: %s', JSON.stringify(targetServer));

  ns.printf('spawning manager process on %s', hostname);
  ns.spawn(config.manager, 1, JSON.stringify({ config, targetServer }), ...nukedServers);
}
