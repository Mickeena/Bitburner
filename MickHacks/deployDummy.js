/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's Scripts: deployDummy.js		 	 */
/* ----------------------------------------- */
/* Dummy deployer;							 */
/*  Deploys dummy hacker script to all non-	 */
/*  private servers.						 */
/* ----------------------------------------- */

import { scanAll, nukeAll } from "utility/eye.js";

export async function main(ns) {
	ns.disableLog("All");
	// Initialise
	const deployFile = "MickHacks/mhd.js";
	if (!ns.fileExists(deployFile)) {
		ns.tprintf("\x1b[31mError, deploy file doesnt exists: " + deployFile + "\x1b[0m")
		return
	}
	const deployFileRam = ns.getScriptRam(deployFile);
	let countServs = 0
	let countThreads = 0
	let countWeak = 0
	// Scan and nuke all targets
	ns.print("Calling server scan")
	let serverList = scanAll(ns)
	ns.print("Calling server nuke")
	await nukeAll(ns)
	ns.print("Starting server list sort")
	for (const server of serverList) {
		// Skip if the server is "home" or starts with "MickServ"
		if (server === "home" || server.startsWith("MickServ")) {
			ns.print(`Skipped: ${server}, owned server.`)
			continue;
		}
		// Skip if server has no root access
		if (!ns.hasRootAccess(server)) {
			ns.print(`Skipped: ${server}, no root access.`)
			continue;
		}
		ns.print(`Initiating deployment on: ${server}`)
		// Kill any already running scripts on the server
		ns.killall(server);
		// Get RAM of the rooted server
		let serverRam = ns.getServerMaxRam(server); // Total RAM available
		let serverThreads = Math.floor(serverRam / deployFileRam);

		// Check if the server can run at least one thread
		if (serverThreads >= 1) {
			// Copy and run a script on the rooted server
			ns.scp(deployFile, server);
			ns.exec(deployFile, server, serverThreads.toString());
			ns.print(`Deployed to: ${server}, with ${serverThreads} threads.`)
			countServs++
			countThreads = countThreads + serverThreads
		} else {
			countWeak = countWeak++
			ns.print(`Server ${server} too weak to deploy.`)
		}
	}
	ns.print(`All servers deployed, exiting script.`)
	ns.tprintf("")
	ns.tprintf("\x1b[38;5;166mTotal servers too weak: " + countWeak + "\x1b[0m"); // Whiteish
	ns.tprintf("\x1b[38;5;250mTotal servers deployed: " + countServs + "\x1b[0m"); // Whiteish
	ns.tprintf("\x1b[38;5;250mTotal threads used: " + countThreads + "\x1b[0m"); // Whiteish
}
