/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: purchasePrivate.js		 */
/* Buys private servers of the desired size	 */
/* until no more can be purchased. Will 	 */
/* automatically upgrade smaller servers	 */
/* ----------------------------------------- */
/* Usage: run purchasePrivate.js [ram]		 */
/* ----------------------------------------- */

import { formatValue } from "utility/formatValues.js"

export async function main(ns) {
	ns.disableLog("ALL");

	const deployMode = 0; // 0 skips deployment of scripts

	if (deployMode === 1) {
		// Define the name of the script to deploy
		let deployFile = "mhc.js";

		// Define the path to the controlling target file
		let targetFile = "control/target.txt";

		// Get the RAM usage of the deploy script
		if (ns.fileExists(deployFile)) {
			let deployFileRam = ns.getScriptRam(deployFile);
			ns.print(`Deploy File RAM: ${deployFileRam}`);
		}
	}

	// Get the desired RAM size from command line arguments
	if (ns.args.length === 0) {
		ns.tprintf("\x1b[31mError: No RAM size specified. Please provide the desired RAM size as an argument.");
		return; // Stop execution if no argument is provided
	}
	const desiredRam = parseInt(ns.args[0]);
	ns.print(`Desired RAM: ${desiredRam}`);

	// Valid RAM sizes
	const validRamSizes = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576];

	// Check if the provided RAM size is valid
	if (!validRamSizes.includes(desiredRam)) {
		ns.tprintf("\x1b[31mError: Invalid RAM size specified. Please provide a valid RAM size from the following list: " + validRamSizes.join(", "));
		return; // Stop execution if the RAM size is not valid
	}

	// Purchase new servers until reaching the maximum limit
	let i = ns.getPurchasedServers().length + 1;

	while (i <= ns.getPurchasedServerLimit()) {
		ns.print(`Attempting to buy more servers.`)
		const reqFund = formatValue(ns.getPurchasedServerCost(desiredRam));
		ns.print(`Current status: Awaiting funds: ${reqFund}`)
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(desiredRam)) {
			let hostname = ns.purchaseServer("MickServ-" + i, desiredRam);
			ns.print(`Purchased server: MickServ-${i}, RAM: ${desiredRam}GB`);
			if (deployMode === 1) {
				if (ns.fileExists(deployFile)) {
					ns.scp(deployFile, hostname);
					if (ns.fileExists(targetFile)) {
						ns.scp(targetFile, hostname);
					}
					const serverThreads = Math.floor(desiredRam / deployFileRam);
					ns.print(`Server Threads: ${serverThreads}`);
					if (serverThreads >= 1) {
						ns.exec(deployFile, hostname, serverThreads.toString());
					} else {
						ns.tprint(`\x1b[31mCannot run script on ${hostname} due to insufficient RAM.`);
					}
					ns.tprintf("Purchased and executed on: MickServ-" + i);
				} else {
					ns.tprintf(`Purchased \x1b[38;5;1mbut failed to execute\x1b[0m on: \x1b[38;5;250mMickServ-${i}, \x1b[38;5;242m${desiredRam}GB.`);
				}
			} else {
				ns.tprintf(`\x1b[38;5;250mPurchased new server: MickServ-${i}, \x1b[38;5;242m${desiredRam}GB.`);
			}
			++i;
		} else {
			// ns.tprint("Insufficient funds to purchase additional servers. Exiting loop.");
			// break;
		}
		await ns.sleep(100);
	}

	// Upgrade and deploy loop
	while (true) {
		const purchasedServers = ns.getPurchasedServers();
		let upgradePerformed = false;
		ns.print(`Attempting to upgrade servers.`)

		for (let i = 0; i < purchasedServers.length; i++) {
			const serverName = purchasedServers[i];
			const serverRam = ns.getServerMaxRam(serverName);

			if (serverRam < desiredRam) {
				const upgradeCost = ns.getPurchasedServerUpgradeCost(serverName, desiredRam);
				if (upgradeCost !== -1 && ns.getServerMoneyAvailable("home") > upgradeCost) {
					// Upgrade server RAM
					ns.upgradePurchasedServer(serverName, desiredRam);
					ns.print(`Upgraded server: ${serverName}, RAM: ${desiredRam}GB`);
					ns.tprint(`\x1b[38;5;250mUpgraded ${serverName} to \x1b[38;5;242m${desiredRam}GB.`);
					upgradePerformed = true;
					if (deployMode === 1) {
						if (ns.fileExists(deployFile)) {
							ns.scp(deployFile, hostname);
							if (ns.fileExists(targetFile)) {
								ns.scp(targetFile, hostname);
							}
							const serverThreads = Math.floor(desiredRam / deployFileRam);
							ns.print(`Server Threads: ${serverThreads}`);
							if (serverThreads >= 1) {
								// Killing and redeploying the script
								ns.killall(serverName);
								ns.exec(deployFile, hostname, serverThreads.toString());
							} else {
								ns.tprint(`\x1b[31mCannot run script on ${hostname} due to insufficient RAM.`);
							}
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
					const reqFund = formatValue(ns.getPurchasedServerCost(desiredRam));
					ns.print(`Current status: Awaiting funds: ${reqFund}`)
					break;
				}
			}
			if (allServersUpgraded) {
				ns.print(`No upgrades performed. All servers upgraded to max.`)
				break; // Break out of the loop if all servers are already upgraded
			}
		}
		await ns.sleep(5000);
	}
}
