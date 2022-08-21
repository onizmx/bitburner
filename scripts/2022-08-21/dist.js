// run ./scripts/2022-08-21/dist.js

const metadata = {
  createdDate: '2022-08-21',
};

/** @param {NS} ns */
export async function main(ns) {
  const distScript = `/scripts/${metadata.createdDate}/dist.js`;
  const execScript = `/scripts/${metadata.createdDate}/exec.js`;

  const hostname = ns.getHostname();
  const serversToHack = ns.scan(hostname).filter(server => server !== 'home');
  const serversToSkipScp = new Set([hostname, ...arguments[0].args]);
  const serversToScp = serversToHack.filter(server => !serversToSkipScp.has(server));
  serversToScp.forEach(server => serversToSkipScp.add(server));

  for (const server of serversToScp) {
    await ns.scp([distScript, execScript], server, hostname);
    ns.exec(distScript, server, 1, ...serversToSkipScp);
  }

  if (serversToHack.length > 0) {
    const hostMaxRam = ns.getServerMaxRam(hostname);
    const execScriptRam = ns.getScriptRam(execScript);
    const threads = Math.floor(hostMaxRam / execScriptRam);
    ns.spawn(execScript, threads, ...serversToHack);
  }
}
