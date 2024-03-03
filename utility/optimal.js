/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: optimal.js				 */
/* Calculates current money per second for	 */
/*  all servers and exports as a list		 */
/* ----------------------------------------- */

import { scanAll } from "utility/eye.js";
import { formatValue, formatValueTime } from "utility/formatValues.js"
import { clearLogFile, writeToLogFile } from 'logs/logger.js';
// import { getCPS, sortCPS, printCPS } from "utility/optimal.js"

export async function main(ns) {
	// Get the sorted list of servers
	const results = await sortCPS(ns);

	// Print results into the terminal
	ns.tprintf("Servers ordered by money per second:");
	for (const result of results) {
		ns.tprintf(`Server: \x1b[38;5;250m${result.server}\x1b[0m, Money per Cycle: ${result.moneyPerCyclef}, Money per Second: \x1b[38;5;155m${result.moneyPerSecondf}\x1b[0m, Cycle length: ${result.cycleTimef}`);
	}
}

export async function printCPS(ns) {
    const results = await sortCPS(ns);
    const printFile = "utility/cps.txt";

    // Delete the existing file if it exists
    if (ns.fileExists(printFile)) {
        ns.rm(printFile);
        ns.print(`Deleted existing file: ${printFile}`);
    }

    // Create a new file and print server names
    const serverNames = results.map(item => item.server).join('\n');
    ns.write(printFile, serverNames);

    ns.print(`Server names printed to file: ${printFile}`);
}

export async function sortCPS(ns) {
	const results = await getCPS(ns);
	results.sort((a, b) => b.moneyPerSecond - a.moneyPerSecond);
	ns.print(`Sorted list by CPS`)
	return results
}

export async function getCPS(ns) {
	ns.disableLog("ALL");

	ns.print(`Initialising.`)

	const logFile = "logs/optimal.txt"
	const logDelay = 0
	clearLogFile(ns, logFile)
	
	// Initialise settings
	const serverList = scanAll(ns)
	const player = ns.getPlayer()
	const currentHackLevel = ns.currentHackLevel
	const privateRam = ns.getServerMaxRam("MickServ-1");

	const wScript = 'MickHacks/mhs_w.js';
	const gScript = 'MickHacks/mhs_g.js';
	const hScript = 'MickHacks/mhs_h.js';

	const maxThreadsW = Math.floor(privateRam / ns.getScriptRam(wScript)); // Calculate max threads for weaken
	const maxThreadsG = Math.floor(privateRam / ns.getScriptRam(gScript)); // Calculate max threads for grow
	const maxThreadsH = Math.floor(privateRam / ns.getScriptRam(hScript)); // Calculate max threads for hack

	ns.print(`Initialised. Getting full list.`)

	let results = [];

	for (const server of serverList) {
		// Skip if the server is "home" or starts with "MickServ"
		if (server === "home" || server.startsWith("MickServ")) {
			ns.print(`Server: \x1b[38;5;250m${server}\x1b[0m skipped; \x1b[38;5;1mowned server.`)
			writeToLogFile(ns, logDelay, logFile, `Skipped ${server}; owned server`)
			continue;
		}
		// Skip if server has no root access
		if (!ns.hasRootAccess(server)) {
			ns.print(`Server: \x1b[38;5;250m${server}\x1b[0m skipped; \x1b[38;5;1mno root access.`)
			writeToLogFile(ns, logDelay, logFile, `Skipped ${server}; no root access`)
			continue;
		}
		// Skip if server too high to hack
		if (ns.getServerRequiredHackingLevel(server) > currentHackLevel) {
			ns.print(`Server: \x1b[38;5;250m${server}\x1b[0m skipped; \x1b[38;5;1mlevel too high.`)
			writeToLogFile(ns, logDelay, logFile, `Skipped ${server}; level too high`)
			continue;
		}
		// Skip if server has no cash at all
		if (!ns.getServerMaxMoney(server) > 0) {
			ns.print(`Server: \x1b[38;5;250m${server}\x1b[0m skipped; \x1b[38;5;1mno money.`)
			writeToLogFile(ns, logDelay, logFile, `Skipped ${server}; no money`)
			continue;
		}

		ns.print(`Server: \x1b[38;5;250m${server}\x1b[0m processing.`)
		writeToLogFile(ns, logDelay, logFile, `Processing ${server}`)
		// Find (and replace) server information
		const serverTrue = ns.getServer(server);
		const maxCash = ns.getServerMaxMoney(server);
		const minSecurity = ns.getServerMinSecurityLevel(server);
		serverTrue.hackDifficulty = minSecurity;
		serverTrue.moneyAvailable = maxCash;
		writeToLogFile(ns, logDelay, logFile, `D1-${server}, ${maxCash}, ${minSecurity}`)

		// Calculate security changes
		const weakenStrength = ns.weakenAnalyze(maxThreadsW); // Strength of weaken
		const growthSecurity = ns.growthAnalyzeSecurity(maxThreadsG, server.hostname); // Security growth after growth
		const hackSecurity = ns.hackAnalyzeSecurity(maxThreadsH, server.hostname); // Security growth after hack
		writeToLogFile(ns, logDelay, logFile, `D2-${server}, ${weakenStrength}, ${growthSecurity}, ${hackSecurity}`)

		// Calculate time for weaken, grow, and hack
		const wTime = ns.formulas.hacking.weakenTime(serverTrue, player);
		const gTime = ns.formulas.hacking.growTime(serverTrue, player);
		const hTime = ns.formulas.hacking.hackTime(serverTrue, player);
		writeToLogFile(ns, logDelay, logFile, `D3-${server}, ${wTime}, ${gTime}, ${hTime}`)

		// Calculate maximum reward per hack
		const threadPercent = ns.formulas.hacking.hackPercent(serverTrue, player)
		let hackReward = 0;
		if (threadPercent >= 1) {
			// Single thread max hack
			hackReward = maxCash;
			writeToLogFile(ns, logDelay, logFile, `D4-${server}, reward maxcash; 1 thread`)
		} else {
			if (threadPercent * maxThreadsH >= 1) {
				// Full server total drain
				hackReward = maxCash;
				writeToLogFile(ns, logDelay, logFile, `D4-${server}, reward maxcash; full threads`)
			} else {
				// Max per drain calc
				hackReward = threadPercent * maxThreadsH * maxCash;
				writeToLogFile(ns, logDelay, logFile, `D4-${server}, reward calc: ${hackReward}`)
			}
		}

		// Calculate the cycle timings
		// Check weaken can outperform grow and hack:
		let cycleTime = 0;
		if (weakenStrength > growthSecurity && weakenStrength > hackSecurity) {
			cycleTime = wTime + gTime + wTime + hTime;
			writeToLogFile(ns, logDelay, logFile, `D5-${server}, single cycle time: ${cycleTime}`)
		} else {
			// Calculate the number of weaken actions needed for both growth and hack security
			const gWeakens = Math.ceil(growthSecurity / weakenStrength);
			const hWeakens = Math.ceil(hackSecurity / weakenStrength);

			// Calculate the total cycle time considering weaken actions for both security levels
			cycleTime = gWeakens * wTime + gTime + hWeakens * wTime + hTime;
			writeToLogFile(ns, logDelay, logFile, `D5-${server}, multi cycle time: ${cycleTime}`)
		}

		// Convert to seconds
		cycleTime = cycleTime / 1000;
		const cycleTimef = formatValueTime(cycleTime);

		// Final money calculations:
		const hackChance = ns.formulas.hacking.hackChance(serverTrue, player)
		const moneyPerCycle = hackReward / hackChance
		const moneyPerCyclef = formatValue(hackReward / hackChance)
		const moneyPerSecond = moneyPerCycle / cycleTime
		const moneyPerSecondf = formatValue(moneyPerCycle / cycleTime)
		writeToLogFile(ns, logDelay, logFile, `D6-${server}, ${hackChance}/1 chance`)
		writeToLogFile(ns, logDelay, logFile, `D7-${server}, ${moneyPerCycle}, ${moneyPerSecond}, ${cycleTime}`)
		writeToLogFile(ns, logDelay, logFile, `D8-${server}, ${moneyPerCyclef}, ${moneyPerSecondf}, ${cycleTimef}`)
		// Add server details to results array
		results.push({
			server: server,
			moneyPerCycle: moneyPerCycle,
			moneyPerCyclef: moneyPerCyclef,
			moneyPerSecond: moneyPerSecond,
			moneyPerSecondf: moneyPerSecondf,
			cycleTime: cycleTime,
			cycleTimef: cycleTimef
		});
		writeToLogFile(ns, logDelay, logFile, `${server} completed.`)
		// await ns.sleep(100)
	}
	ns.print(`All results calculated.`)
	return results
}
