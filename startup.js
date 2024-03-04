/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: startup.js				 */
/* Runs starting scripts after each 		 */
/*  augment installation					 */
/* ----------------------------------------- */

import { formatValue, formatValueTime, curTime, formatValueSec } from 'utility/formatValues.js';

export async function main(ns) {

	const programs = ns.singularity.getDarkwebPrograms();
	let funds = ns.getServerMoneyAvailable("home"); // Initialize funds

	if (!ns.hasTorRouter()) {
		while (true) {
			const torCost = 200000;
			ns.print(`Awaiting funds to purchase Tor Router for $200,000`)
			if (funds > torCost) {
				ns.singularity.purchaseTor();
				ns.print(`Purchased tor router.`)
				ns.tprintf(`Purchased tor router.`)
				break; // Exit the loop once Tor Router is purchased
			} else {
				await ns.sleep(10000); // Wait for 10 seconds before checking funds again
				funds = ns.getServerMoneyAvailable("home");
			}
		}
	}

	for (const program of programs) {
		const programCost = ns.singularity.getDarkwebProgramCost(program);
		const programCostF = formatValue(programCost)
		if (!ns.fileExists(program)) {
			ns.print(`Awaiting funds to purchase: ${program} for $${programCostF}`)
			while (true) {
				if (funds > programCost) {
					ns.singularity.purchaseProgram(program);
					ns.tprintf(`Purchased program ${program}`);
					ns.print(`Purchased program ${program}`);
					break; // Exit the while loop once the program is purchased
				} else {
					await ns.sleep(10000);
					funds = ns.getServerMoneyAvailable("home");
				}
			}
		}
	}

	await ns.killall()
	await ns.rm("utility/data/deployQuant.txt")
	await ns.rm("utility/data/deployPIDs.txt")

	// Deploy dummy hacking script to a;ll public servers
	const deployDummyPid = ns.exec('MickHacks/deployDummy.js', 'home', 1);

	// Purchase hacknet nodes for passive income
	const hacknetPid = ns.exec('utility/hacknet.js', 'home', 1, 24);
	ns.tail(hacknetPid);
	ns.moveTail(950, 73, hacknetPid)
	ns.resizeTail(392, 500, hacknetPid)

	// Execute the main deployment script for private server usage
	const deployerPid = ns.exec('MickHacks/smartDeployer.js', 'home', 1);
	ns.tail(deployerPid);
	ns.moveTail(950, 37, deployerPid)
	ns.resizeTail(392, 500, deployerPid)

	// Purchase private servers of increasing size
	let privatePid = ns.exec('utility/purchasePrivate.js', 'home', 1, 1024);
	ns.tail(privatePid);
	ns.moveTail(950, 1, privatePid)
	ns.resizeTail(392, 500, privatePid)

	while (true) {
		if (!ns.isRunning(hacknetPid)) {
			ns.closeTail(hacknetPid)
		}
		if (!ns.isRunning(privatePid)) {
			ns.closeTail(privatePid)
			break;
		}
		await ns.sleep(10000);
	}

	privatePid = ns.exec('utility/purchasePrivate.js', 'home', 1, 16384);
	ns.tail(privatePid);
	ns.moveTail(950, 1, privatePid)
	ns.resizeTail(392, 500, privatePid)
	while (true) {
		if (!ns.isRunning(hacknetPid)) {
			ns.closeTail(hacknetPid)
		}
		if (!ns.isRunning(privatePid)) {
			ns.closeTail(privatePid)
			break;
		}
		await ns.sleep(10000);
	}

	privatePid = ns.exec('utility/purchasePrivate.js', 'home', 1, 1048576);
	ns.tail(privatePid);
	ns.moveTail(950, 1, privatePid)
	ns.resizeTail(392, 500, privatePid)
	while (true) {
		if (!ns.isRunning(hacknetPid)) {
			ns.closeTail(hacknetPid)
		}
		if (!ns.isRunning(privatePid)) {
			ns.closeTail(privatePid)
			break;
		}
		await ns.sleep(10000);
	}
}
