/** @param {NS} ns */
export async function main(ns) {
  const serversToNuke = arguments[0].args;

  for (const server of serversToNuke) {
    const requiredPorts = ns.getServerNumPortsRequired(server);
    try {
      ns.brutessh(server);
      ns.ftpcrack(server);
      ns.relaysmtp(server);
      ns.nuke(server);
    } catch (err) {
      ns.toast(`${server} requires ${requiredPorts} ports to be opened`, 'error', 10_000);
    }
  }
}
