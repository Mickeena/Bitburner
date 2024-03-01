/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's Scripts: smartController.js	 	 */
/* ----------------------------------------- */
/* Remotely controls WGWH cycles on a		 */
/* private server							 */
/* ----------------------------------------- */

export async function main(ns) {

	const tailMode = ns.args[3]

	if (tailMode === 1) {
		ns.tail()
	}

	const hostServ = ns.args[0]; // Host server passed via command line arguments
	const targetServ = ns.args[1]; // Target server passed via command line arguments
	const printSetting = ns.args[2]; // Print settings passed via command line
	const delay = 0;
	const curServ = ns.getHostname();

	// Constants for script paths
	const weakenScript = 'MickHacks/mhs_w.js';
	const growScript = 'MickHacks/mhs_g.js';
	const hackScript = 'MickHacks/mhs_h.js';
	if (!ns.fileExists(weakenScript) || !ns.fileExists(growScript) || !ns.fileExists(hackScript)) {
		ns.tprintf("\x1b[31mError: One or more deploy files don't exist.\x1b[0m");
		return;
	}

	// Copy scripts to the target server
	ns.scp(weakenScript, hostServ);
	ns.scp(growScript, hostServ);
	ns.scp(hackScript, hostServ);

	while (true) {
		//ns.tprint("Starting loop")
		const serverRam = ns.getServerMaxRam(hostServ);
		const maxThreads = Math.floor(serverRam / ns.getScriptRam(weakenScript, hostServ)); // Calculate max threads based on server RAM

		const currentSecurity = ns.getServerSecurityLevel(targetServ);
		const minSecurity = ns.getServerMinSecurityLevel(targetServ);
		const currentMoney = ns.getServerMoneyAvailable(targetServ);
		const maxMoney = ns.getServerMaxMoney(targetServ);

		if (currentSecurity > minSecurity) {
			// Start weakening script if current security is higher than min security
			ns.exec(weakenScript, hostServ, maxThreads, targetServ, maxThreads, printSetting, curServ, delay);
			while (true) {
				if (ns.isRunning(weakenScript, hostServ, targetServ, maxThreads, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					break
				}
			}
		} else if (currentMoney < maxMoney) {
			// Start growing script if current money is lower than max money
			ns.exec(growScript, hostServ, maxThreads, targetServ, maxThreads, printSetting, curServ, delay);
			while (true) {
				if (ns.isRunning(growScript, hostServ, targetServ, maxThreads, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					break
				}
			}
		} else {
			// Start hacking script if none of the above conditions are met
			ns.exec(hackScript, hostServ, maxThreads, targetServ, maxThreads, printSetting, curServ, delay);
			while (true) {
				if (ns.isRunning(hackScript, hostServ, targetServ, maxThreads, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					break
				}
			}
		}
		//ns.tprint("Outer loop complete.")
		//await ns.sleep(10000)
	}
}