/** @param {NS} ns */
export async function main(ns) {
  const serversToHack = arguments[0].args;
  const serverToCountMap = new Map();
  serversToHack.forEach(server => serverToCountMap.set(server, 1));

  // for (const server of serverToCountMap.keys()) {
  //   try {
  //     ns.nuke(server);
  //   } catch (err) {
  //     ns.alert(err);
  //   }
  // }

  while (true) {
    for (const [server, count] of serverToCountMap.entries()) {
      if (count % 10 === 0) {
        await ns.grow(server);
        await ns.weaken(server);
      }
      try {
        await ns.hack(server);
      } catch {}
      serverToCountMap.set(server, count + 1);
    }
  }
}
