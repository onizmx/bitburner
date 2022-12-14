// run ./scripts/2022-08-21/main.js
const metadata = {
  createdDate: '2022-08-21',
};

/** @param {NS} ns */
export async function main(ns) {
  const mainScript = `/scripts/${metadata.createdDate}/main.js`;
  const nukeScript = `/scripts/${metadata.createdDate}/nuke.js`;
  const hackScript = `/scripts/${metadata.createdDate}/hack.js`;

  const hostname = ns.getHostname();
  const serversToAccess = ns.scan(hostname).filter(server => server !== 'home');
  const serversToSkipScp = new Set([hostname, ...arguments[0].args]);
  const serversToScp = serversToAccess.filter(server => !serversToSkipScp.has(server));
  serversToScp.forEach(server => serversToSkipScp.add(server));

  for (const server of serversToScp) {
    await ns.scp([mainScript, nukeScript, hackScript], server, hostname);
    ns.exec(mainScript, server, 1, ...serversToSkipScp);
  }

  if (serversToAccess.length > 0) {
    // ns.spawn(nukeScript, 1, ...serversToAccess);
    const hostMaxRam = ns.getServerMaxRam(hostname);
    const hackScriptRam = ns.getScriptRam(hackScript);
    const threads = Math.floor(hostMaxRam / hackScriptRam);
    ns.spawn(hackScript, threads, ...serversToAccess);
  }
}
