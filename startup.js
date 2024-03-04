/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: startup.js				 */
/* Runs starting scripts after each 		 */
/*  augment installation					 */
/* ----------------------------------------- */

export async function main(ns) {

	ns.killall()

	// Deploy dummy hacking script to a;ll public servers
	const deployDummyPid = ns.exec('MickHacks/deployDummy.js', 'home', 1);

	// Purchase hacknet nodes for passive income
	const hacknetPid = ns.exec('utility/hacknet.js', 'home', 1, 24);
	ns.tail(hacknetPid);
	ns.moveTail(950, 73, hacknetPid)
	ns.resizeTail(300, 500, hacknetPid)

	// Execute the main deployment script for private server usage
	const deployerPid = ns.exec('MickHacks/smartDeployer.js', 'home', 1);
	ns.tail(deployerPid);
	ns.moveTail(950, 37, deployerPid)
	ns.resizeTail(300, 500, deployerPid)

	// Purchase private servers of increasing size
	let privatePid = ns.exec('utility/purchasePrivate.js', 'home', 1, 1024);
	ns.tail(privatePid);
	ns.moveTail(950, 1, privatePid)
	ns.resizeTail(300, 500, privatePid)

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
	ns.resizeTail(300, 500, privatePid)
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
	ns.resizeTail(300, 500, privatePid)
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
