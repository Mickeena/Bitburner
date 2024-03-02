/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: KillAllPriv.js			 */
/* Kills all scripts on all purchased		 */
/*  servers									 */
/* ----------------------------------------- */

export async function main(ns) {
	ns.disableLog("ALL");
	ns.print(`Listing all purchased servers`)

	// Get the list of purchased servers
	const serversToKill = await ns.getPurchasedServers();

	// Iterate through the filtered servers and kill all scripts
	ns.print(`List filtered. Killing scripts.`)
	for (const server of serversToKill) {
		ns.killall(server);
		ns.print(`Killed all scripts on server: ${server}`);
	}
}
