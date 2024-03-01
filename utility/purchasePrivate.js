/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: purchasePrivate.js		 */
/* Buys private servers of the desired size	 */
/* until no more can be purchased. Will 	 */
/* automatically upgrade smaller servers	 */
/* ----------------------------------------- */
/* Usage: run purchasePrivate.js [ram]		 */
/* ----------------------------------------- */

export async function main(ns) {
	// Define the name of the script to deploy
	let deployFile = "mhc.js";

	// Define the path to the controlling target file
	let targetFile = "control/target.txt";

	// Get the RAM usage of the deploy script
	if (ns.fileExists(deployFile)) {
		let deployFileRam = ns.getScriptRam(deployFile);
	}

	// Get the desired RAM size from command line arguments
	if (ns.args.length === 0) {
		ns.tprintf("Error: No RAM size specified. Please provide the desired RAM size as an argument.");
		return; // Stop execution if no argument is provided
	}
	const desiredRam = parseInt(ns.args[0]);

	// Valid RAM sizes
	const validRamSizes = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576];

	// Check if the provided RAM size is valid
	if (!validRamSizes.includes(desiredRam)) {
		ns.tprintf("Error: Invalid RAM size specified. Please provide a valid RAM size from the following list: " + validRamSizes.join(", "));
		return; // Stop execution if the RAM size is not valid
	}

	// Purchase new servers until reaching the maximum limit
	let i = ns.getPurchasedServers().length + 1;

	while (i <= ns.getPurchasedServerLimit()) {
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(desiredRam)) {
			let hostname = ns.purchaseServer("MickServ-" + i, desiredRam);
			if (ns.fileExists(deployFile)) {
				ns.scp(deployFile, hostname);
				if (ns.fileExists(targetFile)) {
					ns.scp(targetFile, hostname);
				}
				const serverThreads = Math.floor(desiredRam / deployFileRam);
				if (serverThreads >= 1) {
					ns.exec(deployFile, hostname, serverThreads.toString());
				} else {
					ns.tprint(`Cannot run script on ${hostname} due to insufficient RAM.`);
				}
				ns.tprintf("Purchased and executed on: MickServ-" + i);
			} else {
				ns.tprintf("Purchased \x1b[38;5;1mbut failed to execute\x1b[0m on: MickServ-" + i + " (" + desiredRam + "GB)");
			}
			++i;
		} else {
			// ns.tprint("Insufficient funds to purchase additional servers. Exiting loop.");
			// break;
		}
		await ns.sleep(1000);
	}

	// Upgrade and deploy loop
	while (true) {
		const purchasedServers = ns.getPurchasedServers();
		let upgradePerformed = false;

		for (let i = 0; i < purchasedServers.length; i++) {
			const serverName = purchasedServers[i];
			const serverRam = ns.getServerMaxRam(serverName);

			if (serverRam < desiredRam) {
				const upgradeCost = ns.getPurchasedServerUpgradeCost(serverName, desiredRam);
				if (upgradeCost !== -1 && ns.getServerMoneyAvailable("home") > upgradeCost) {
					// Upgrade server RAM
					ns.upgradePurchasedServer(serverName, desiredRam);
					ns.tprint(`Upgraded ${serverName} to ${desiredRam}GB RAM.`);
					upgradePerformed = true;

					if (ns.fileExists(deployFile)) {
						ns.scp(deployFile, hostname);
						if (ns.fileExists(targetFile)) {
							ns.scp(targetFile, hostname);
						}
						const serverThreads = Math.floor(desiredRam / deployFileRam);
						if (serverThreads >= 1) {
							// Killing and redeploying the script
							ns.killall(serverName);
							ns.exec(deployFile, hostname, serverThreads.toString());
						} else {
							ns.tprint(`Cannot run script on ${hostname} due to insufficient RAM.`);
						}
					}
				}
			}
		}

		// Check if no upgrades were performed
		if (!upgradePerformed) {
			let allServersUpgraded = true;
			for (let i = 0; i < purchasedServers.length; i++) {
				const serverName = purchasedServers[i];
				const serverRam = ns.getServerMaxRam(serverName);
				if (serverRam < desiredRam) {
					allServersUpgraded = false;
					break;
				}
			}
			if (allServersUpgraded) {
				break; // Break out of the loop if all servers are already upgraded
			}
		}

		await ns.sleep(5000);
	}
}