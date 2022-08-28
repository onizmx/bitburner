/** @param {NS} ns */
export async function main(ns) {
  const targetServer = arguments[0].args[0];
  await ns.grow(targetServer);
}
