/** @param {NS} ns */
export async function main(ns) {
  const distScript = '/scripts/h0001-dist.js';
  const execScript = '/scripts/h0001-exec.js';

  const hostname = ns.getHostname();
  const visited = new Set([hostname]);
  const { args: prevVisits } = arguments[0];
  prevVisits.forEach(prevVisit => visited.add(prevVisit));

  const servers = ns.scan(hostname);
  const newServers = servers.filter(server => !visited.has(server));

  ns.exec(distScript, hostname, 1, distScript, execScript, ...visited);
  await ns.sleep(5000);

  const allVisits = new Set([...visited, ...servers]);
  for (const newServer of newServers) {
    // do hack
    ns.exec(execScript, newServer, 1, ...allVisits);
  }
}
