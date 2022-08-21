/** @param {NS} ns */
export async function main(ns) {
  const [distScript, execScript, ...visited] = arguments[0].args;

  const hostname = ns.getHostname();
  const servers = ns.scan(hostname).filter(server => !visited.includes(server));

  for (const server of servers) {
    await ns.scp([distScript, execScript], server, hostname);
  }
}
