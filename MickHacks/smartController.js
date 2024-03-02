/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's Scripts: smartController.js	 	 */
/* ----------------------------------------- */
/* Remotely controls WGWH cycles on a		 */
/* private server							 */
/* ----------------------------------------- */

import { formatValueTime, curTime } from 'utility/formatValues.js';

export async function main(ns) {
	ns.disableLog("ALL");

	const hostServ = ns.args[0]; // Host server passed via command line arguments
	const targetServ = ns.args[1]; // Target server passed via command line arguments
	const printSetting = ns.args[2]; // Print settings passed via command line
	const delay = 0;
	const curServ = ns.getHostname();
	ns.print(`Initialising. Host: ${hostServ}. Target: ${targetServ}.`)

	// Constants for script paths
	const weakenScript = 'MickHacks/mhs_w.js';
	const growScript = 'MickHacks/mhs_g.js';
	const hackScript = 'MickHacks/mhs_h.js';
	if (!ns.fileExists(weakenScript) || !ns.fileExists(growScript) || !ns.fileExists(hackScript)) {
		ns.tprintf("\x1b[31mError: One or more deploy files don't exist.\x1b[0m");
		return;
	}

	ns.print(`Copying files to target.`)
	// Copy scripts to the target server
	ns.scp(weakenScript, hostServ);
	ns.scp(growScript, hostServ);
	ns.scp(hackScript, hostServ);
	ns.print(`Files copied. Starting hack loop.`)

	while (true) {
		//ns.tprint("Starting loop")
		const serverRam = ns.getServerMaxRam(hostServ);
		const maxThreadsW = Math.floor(serverRam / ns.getScriptRam(weakenScript, hostServ)); // Calculate max threads based on server RAM
		const maxThreadsG = Math.floor(serverRam / ns.getScriptRam(growScript, hostServ)); // Calculate max threads based on server RAM
		const maxThreadsH = Math.floor(serverRam / ns.getScriptRam(hackScript, hostServ)); // Calculate max threads based on server RAM

		const currentSecurity = ns.getServerSecurityLevel(targetServ);
		const minSecurity = ns.getServerMinSecurityLevel(targetServ);
		const currentMoney = ns.getServerMoneyAvailable(targetServ);
		const maxMoney = ns.getServerMaxMoney(targetServ);
		ns.print(`Status:`)
		ns.print(`Security: ${currentSecurity}/${minSecurity}`)
		ns.print(`Money: ${currentMoney}/${maxMoney}`)

		let currTime = curTime();
		if (currentSecurity > minSecurity) {
			// Start weakening script if current security is higher than min security
			ns.exec(weakenScript, hostServ, maxThreadsW, targetServ, maxThreadsW, printSetting, curServ, delay);
			ns.print(`Weaken script executed.`);
			currTime = curTime();
			const weakenTime = formatValueTime(ns.getWeakenTime(targetServ) / 1000)
			ns.print(`${currTime} ETA: ${weakenTime}`)
			while (true) {
				if (ns.isRunning(weakenScript, hostServ, targetServ, maxThreadsW, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					ns.print(`Weaken script completed.`);
					break
				}
			}
		} else if (currentMoney < maxMoney) {
			// Start growing script if current money is lower than max money
			ns.exec(growScript, hostServ, maxThreadsG, targetServ, maxThreadsG, printSetting, curServ, delay);
			ns.print(`Grow script executed.`);
			currTime = curTime();
			const growTime = formatValueTime(ns.getGrowTime(targetServ) / 1000)
			ns.print(`${currTime} ETA: ${growTime}`)
			while (true) {
				if (ns.isRunning(growScript, hostServ, targetServ, maxThreadsG, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					ns.print(`Grow script completed.`);
					break
				}
			}
		} else {
			// Start hacking script if none of the above conditions are met
			ns.exec(hackScript, hostServ, maxThreadsH, targetServ, maxThreadsH, printSetting, curServ, delay);
			ns.print(`Hack script executed.`);
			currTime = curTime();
			const hackTime = formatValueTime(ns.getHackTime(targetServ) / 1000)
			ns.print(`${currTime} ETA: ${hackTime}`)
			while (true) {
				if (ns.isRunning(hackScript, hostServ, targetServ, maxThreadsH, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					ns.print(`Hack script completed.`);
					break
				}
			}
		}
		//ns.tprint("Outer loop complete.")
		//await ns.sleep(10000)
	}
}
