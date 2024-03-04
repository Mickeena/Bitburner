/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: KillAllNonPriv.js		 */
/* Kills all scripts on all non-purchased	 */
/*  servers									 */
/* ----------------------------------------- */

import { scanAll } from `utility/eye.js`;

export async function main(ns) {
	// Get the list of all servers
	ns.disableLog("ALL");
	ns.print(`Listing all servers`)
    const serverList = scanAll(ns); // Get all servers

    // Get the list of purchased servers
	ns.print(`Listing all purchased servers`)
    const purchasedServers = await ns.getPurchasedServers();

    // Filter servers based on the criteria
	ns.print(`Filtering list`)
    const serversToKill = serverList.filter(server => {
        // Exclude servers that are in the list of purchased servers
        // Also exclude the "home" server
        return server !== "home" && !purchasedServers.includes(server);
    });
	ns.print(`List filtered. Killing scripts.`)
    // Iterate through the filtered servers and kill all scripts
    for (const server of serversToKill) {
        ns.killall(server);
        ns.print(`Killed all scripts on server: ${server}`);
    }
}
