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
	const maxMoney = ns.getServerMaxMoney(targetServ);
	const minSecurity = ns.getServerMinSecurityLevel(targetServ);
	let currTime = curTime();
	ns.print(`Initialising. Host: ${hostServ}. Target: ${targetServ}.`)

	// Constants for script paths
	const wScript = 'MickHacks/mhs_w.js';
	const gScript = 'MickHacks/mhs_g.js';
	const hScript = 'MickHacks/mhs_h.js';
	if (!ns.fileExists(wScript) || !ns.fileExists(gScript) || !ns.fileExists(hScript)) {
		ns.tprintf("\x1b[31mError: One or more deploy files don't exist.\x1b[0m");
		return;
	}

	ns.print(`Copying files to target.`)
	// Copy scripts to the target server
	ns.scp(wScript, hostServ);
	ns.scp(gScript, hostServ);
	ns.scp(hScript, hostServ);
	ns.print(`Files copied. Starting hack loop.`)

	while (true) {
		//ns.tprint("Starting loop")
		const serverRam = ns.getServerMaxRam(hostServ);
		const maxThreadsW = Math.floor(serverRam / ns.getScriptRam(wScript, hostServ)); // Calculate max threads based on server RAM
		const maxThreadsG = Math.floor(serverRam / ns.getScriptRam(gScript, hostServ)); // Calculate max threads based on server RAM
		const maxThreadsH = Math.floor(serverRam / ns.getScriptRam(hScript, hostServ)); // Calculate max threads based on server RAM

		const currentSecurity = ns.getServerSecurityLevel(targetServ);
		const currentMoney = ns.getServerMoneyAvailable(targetServ);
		ns.print(`Current status:`)
		ns.print(`Target security: \x1b[38;5;178m${currentSecurity}\x1b[0m/\x1b[38;5;155m${minSecurity}\x1b[0m`)
		ns.print(`Target money: \x1b[38;5;178m${currentMoney}\x1b[0m/\x1b[38;5;155m${maxMoney}\x1b[0m`)

		if (currentSecurity > minSecurity) {
			// Start weakening script if current security is higher than min security
			ns.exec(wScript, hostServ, maxThreadsW, targetServ, maxThreadsW, printSetting, curServ, delay);
			ns.print(`Weaken script executed on \x1b[38;5;242m${hostServ}\x1b[0m -> \x1b[38;5;242m${targetServ}\x1b[0m.`);
				currTime = curTime();
				const wTime = formatValueTime(ns.getWeakenTime(targetServ) / 1000)
				ns.print(`${currTime} ETA: \x1b[38;5;250m${wTime}`)
			while (true) {
				if (ns.isRunning(wScript, hostServ, targetServ, maxThreadsW, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					ns.print(`Weaken script completed.`);
					break
				}
			}
		} else if (currentMoney < maxMoney) {
			// Start growing script if current money is lower than max money
			ns.exec(gScript, hostServ, maxThreadsG, targetServ, maxThreadsG, printSetting, curServ, delay);
			ns.print(`Grow script executed on \x1b[38;5;242m${hostServ}\x1b[0m -> \x1b[38;5;242m${targetServ}\x1b[0m.`);
				currTime = curTime();
				const gTime = formatValueTime(ns.getGrowTime(targetServ) / 1000)
				ns.print(`${currTime} ETA: \x1b[38;5;250m${gTime}`)
			while (true) {
				if (ns.isRunning(gScript, hostServ, targetServ, maxThreadsG, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					ns.print(`Grow script completed.`);
					break
				}
			}
		} else {
			// Start hacking script if none of the above conditions are met
			ns.exec(hScript, hostServ, maxThreadsH, targetServ, maxThreadsH, printSetting, curServ, delay);
			ns.print(`Hack script executed on \x1b[38;5;242m${hostServ}\x1b[0m -> \x1b[38;5;242m${targetServ}\x1b[0m.`);
				currTime = curTime();
				const hTime = formatValueTime(ns.getHackTime(targetServ) / 1000)
				ns.print(`${currTime} ETA: \x1b[38;5;250m${hTime}`)
			while (true) {
				if (ns.isRunning(hScript, hostServ, targetServ, maxThreadsH, printSetting, curServ, delay)) {
					await ns.sleep(1000)
				} else {
					ns.print(`Hack script completed.`);
					break
				}
			}
		}
		//ns.print("Outer loop complete. Waiting 10 seconds to continue.")
		//await ns.sleep(10000)
	}
}
