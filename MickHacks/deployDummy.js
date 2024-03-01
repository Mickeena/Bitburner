/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's Scripts: deployDummy.js		 	 */
/* ----------------------------------------- */
/* Dummy deployer;							 */
/*  Deploys dummy hacker script to all non-	 */
/*  private servers.						 */
/* ----------------------------------------- */

import { scanAll, nukeAll, mapAll } from "utility/eye.js";

export async function main(ns) {

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
	let serverList = scanAll(ns)
	await nukeAll(ns)


	for (const server of serverList) {
		// Skip if the server is "home" or starts with "MickServ"
		if (server === "home" || server.startsWith("MickServ")) {
			continue;
		}
		// Skip if server has no root access
		if (!ns.hasRootAccess(server)) {
			continue;
		}

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
			countServs++
			countThreads = countThreads + serverThreads
		} else {
			countWeak = countWeak++
		}
	}
		ns.tprintf("")
		ns.tprintf("\x1b[38;5;166mTotal servers too weak: " + countWeak + "\x1b[0m"); // Whiteish
		ns.tprintf("\x1b[38;5;250mTotal servers deployed: " + countServs + "\x1b[0m"); // Whiteish
		ns.tprintf("\x1b[38;5;250mTotal threads used: " + countThreads + "\x1b[0m"); // Whiteish
}