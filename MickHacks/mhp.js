/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's Scripts: mhp.js				 	 */
/* ----------------------------------------- */
/* Server preparation script;				 */
/*  Minimises security and maximises cash	 */
/*  on every server (except foodnstuff)		 */
/* ----------------------------------------- */

// Import the scanAll function
import { scanAll } from 'utility/eye.js';

export async function main(ns) {
	// Get the list of all servers
	const servers = scanAll(ns);

	// Skip the target of dummy hackers
	const target = "foodnstuff";

	// Asynchronous forEach loop
	for (const server of servers) {
		// Skip if the server is "home" or starts with "MickServ"
		if (server === "home" || server.startsWith("MickServ")) {
			continue;
		}

		// Skip if the server is the target private server or dummy target
		if (server === target ) {
			continue;
		}

		if (!ns.hasRootAccess(server)) {
			continue;
		}

		// Get the minimum security and maximum money for the current server
		const minSecurity = ns.getServerMinSecurityLevel(server);
		const maxMoney = ns.getServerMaxMoney(server);

		let security = ns.getServerSecurityLevel(server);
		let money = ns.getServerMoneyAvailable(server);

		// Grow the server until maximum cash
		while (money < maxMoney) {
			// Weaken the server until minimum security
			while (security > (minSecurity)) {
				await ns.weaken(server);
				security = ns.getServerSecurityLevel(server);
			}
			await ns.grow(server);
			money = ns.getServerMoneyAvailable(server);
		}
		while (security > (minSecurity)) {
			await ns.weaken(server);
			security = ns.getServerSecurityLevel(server);
		}
	}
	ns.tprint("All suitable servers fully weakened and grown.");
}
