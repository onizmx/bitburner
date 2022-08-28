import { copyFilesToServers, killAllScripts } from 'scripts/helpers/proc.helper';
import { findStaticTargetServer, nukeAllServers, scanAllServers } from 'scripts/helpers/server.helper';

// run ./scripts/2022-08-28/main.js
const metadata = {
  createdDate: '2022-08-28',
};

const config = {
  hostname: 'home',
  scripts: {
    manager: `/scripts/${metadata.createdDate}/manager.js`,
    hack: `/scripts/${metadata.createdDate}/actions/hack.js`,
  },
  target: {
    minGrowth: 20,
    maxHackingLevelFactor: 0.2,
  },
};

const filesToCopy = [config.scripts.hack];

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();

  const hostname = config.hostname;
  const allServers = [...scanAllServers(ns)];
  ns.printf('scanned %d servers', allServers.length);

  killAllScripts(ns, allServers);
  ns.printf('killed all running scripts on %d servers', allServers.length);

  const nukedServers = nukeAllServers(ns, allServers);
  ns.printf('found %d nuked servers', nukedServers.length);

  await copyFilesToServers(ns, hostname, nukedServers, filesToCopy);
  ns.printf('copied %d script(s) from %s to %d nuked servers', filesToCopy.length, hostname, nukedServers.length);

  const minTargetGrowth = config.target.minGrowth;
  const playerHackingLevel = ns.getHackingLevel();
  const maxTargetHackingLevel = playerHackingLevel * config.target.maxHackingLevelFactor;
  const targetServer = findStaticTargetServer(ns, nukedServers, minTargetGrowth, maxTargetHackingLevel);
  ns.printf('target server: %s', JSON.stringify(targetServer));

  ns.printf('spawning manager process on %s', hostname);
  ns.spawn(config.scripts.manager, 1, JSON.stringify({ config, targetServer }), ...nukedServers);
}
