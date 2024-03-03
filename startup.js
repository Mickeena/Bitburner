/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: startup.js				 */
/* Runs starting scripts after each 		 */
/*  augment installation					 */
/* ----------------------------------------- */

export async function main(ns) {

	ns.killall()

	// Execute the deployDummy.js script and tail its output
	const deployDummyPid = ns.exec('MickHacks/deployDummy.js', 'home', 1);

	// Execute the hacknet.js script with 24 as an argument and tail its output
	const hacknetPid = ns.exec('utility/hacknet.js', 'home', 1, 30);
	ns.tail(hacknetPid);
	ns.moveTail(950,37, hacknetPid)
	ns.resizeTail(300,500, hacknetPid)

	// Execute the purchasePrivate.js script with different arguments and tail its output
	let privatePid = ns.exec('utility/purchasePrivate.js', 'home', 1, 1024);
	ns.tail(privatePid);
	ns.moveTail(950,1, privatePid)
	ns.resizeTail(300,500, privatePid)

	while (true) {
		if (!ns.isRunning(privatePid)) {
			ns.closeTail(privatePid)
			break;
		}
		await ns.sleep(10000);
	}

	privatePid = ns.exec('utility/purchasePrivate.js', 'home', 1, 16384);
	//await ns.sleep(0);
	ns.tail(privatePid);
	ns.moveTail(950,1, privatePid)
	ns.resizeTail(300,500, privatePid)
	while (true) {
		if (!ns.isRunning(privatePid)) {
			ns.closeTail(privatePid)
			break;
		}
		await ns.sleep(10000);
	}

	privatePid = ns.exec('utility/purchasePrivate.js', 'home', 1, 1048576);
	//await ns.sleep(0);
	ns.tail(privatePid);
	ns.moveTail(950,1, privatePid)
	ns.resizeTail(300,500, privatePid)
	while (true) {
		if (!ns.isRunning(privatePid)) {
			ns.closeTail(privatePid)
			break;
		}
		await ns.sleep(10000);
	}
}
