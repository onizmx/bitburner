import { findAllServerOptions, upgradeServers } from 'scripts/helpers/server.helper';

const config = {
  dryRun: true,
  server: {
    countToBuy: 25,
    namePrefix: 'remote',
  },
};

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL');
  ns.tail();

  const allServerOptions = findAllServerOptions(ns);
  ns.print(allServerOptions);

  const upgrade = upgradeServers(ns, config.dryRun, config.server.countToBuy, config.server.namePrefix);
  ns.print(JSON.stringify(upgrade, null, 2));
}
