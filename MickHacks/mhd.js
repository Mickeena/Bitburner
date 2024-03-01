/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's Scripts: mhd.js				 	 */
/* ----------------------------------------- */
/* Dummy hacker script;						 */
/*  Run this on all non-private servers and	 */
/*  leave to run indefinitely.				 */
/* ----------------------------------------- */

export async function main(ns) {
	const target = "foodnstuff"
	while (true) {
		if (ns.getServerSecurityLevel(target) > 3.05) {
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < 50000000) {
			await ns.grow(target);
		} else {
			await ns.hack(target);
		}
	}
}