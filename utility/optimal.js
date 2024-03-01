/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: optimal.js				 */
/* Calculates current money per second for	 */
/*  all servers and exports as a list		 */
/* ----------------------------------------- */

// Import the required functions from utils.js
import { scanAll } from "utility/eye.js";
import { formatValue, formatValueTime } from "utility/formatValues.js"

export async function main(ns) {
    // Call listCPS to get the results array
    const results = await listCPS(ns);
    
    // Check if results is an array before iterating over it
    if (Array.isArray(results)) {
        ns.tprintf("Servers unsorted:");
        for (const result of results) {
            ns.tprintf(`Server: ${result.server}, Money per Cycle: ${result.moneyPerCyclef}, Money per Second: ${result.moneyPerSecondf}, Cycle length: ${result.cycleTimef}`);
        }

        // Sort results based on moneyPerSecond in descending order
        results.sort((a, b) => b.moneyPerSecond - a.moneyPerSecond);

        // Print results in a list format
        ns.tprintf("Servers ordered by money per second:");
        for (const result of results) {
            ns.tprintf(`Server: ${result.server}, Money per Cycle: ${result.moneyPerCyclef}, Money per Second: ${result.moneyPerSecondf}, Cycle length: ${result.cycleTimef}`);
        }
    } else {
        // Handle the case where results is not an array
        ns.tprintf("Error: Results is not an array.");
    }
}

export async function listCPS(ns){
	// Initialise settings
	const serverList = scanAll(ns)
	const player = ns.getPlayer()
	const currentHackLevel = ns.currentHackLevel
	const privateRam = ns.getServerMaxRam("MickServ-1");
	const maxThreadsWG = Math.floor(privateRam / 1.75); // Calculate max threads for weaken/grow
	const maxThreadsH = Math.floor(privateRam / 1.7); // Calculate max threads for hack

	let results = [];

	for (const server of serverList) {
		// Skip if the server is "home" or starts with "MickServ"
		if (server === "home" || server.startsWith("MickServ")) {
			continue;
		}
		// Skip if server has no root access
		if (!ns.hasRootAccess(server)) {
			continue;
		}
		// Skip if server too high to hack
		if (ns.getServerRequiredHackingLevel(server) > currentHackLevel) {
			continue;
		}
		// Skip if server has no cash at all
		if (!ns.getServerMaxMoney(server) > 0) {
			continue;
		}

		// Find (and replace) server information
		const serverTrue = ns.getServer(server);
		const maxCash = ns.getServerMaxMoney(server);
		const minSecurity = ns.getServerMinSecurityLevel(server);
		serverTrue.hackDifficulty = minSecurity;
		serverTrue.moneyAvailable = maxCash;

		// Calculate security changes
				//	const weakenStrength = ns.weakenAnalyze(server, maxThreadsWG); // Strength of weaken
				//	const growthSecurity = ns.growthAnalyzeSecurity(server, maxThreadsWG); // Security growth after growth
				//	const hackSecurity = ns.hackAnalyzeSecurity(server, maxThreadsH); // Security growth after hack
		const weakenStrength = ns.weakenAnalyze(maxThreadsWG); // Strength of weaken
		const hackSecurity = ns.hackAnalyzeSecurity(maxThreadsH, server.hostname); // Security growth after hack
		const growthSecurity = ns.growthAnalyzeSecurity(maxThreadsWG, server.hostname); // Security growth after growth


		// Calculate time for weaken, grow, and hack
		const growTime = ns.formulas.hacking.growTime(serverTrue, player);
		const weakenTime = ns.formulas.hacking.weakenTime(serverTrue, player);
		const hackTime = ns.formulas.hacking.hackTime(serverTrue, player);

		// Calculate maximum reward per hack
		const threadPercent = ns.formulas.hacking.hackPercent(serverTrue, player)
		let hackReward = 0;
		if (threadPercent >= 1) {
			// Single thread max hack
			hackReward = maxCash;
		} else {
			if (threadPercent * maxThreadsH >= maxCash) {
				// Full server total drain
				hackReward = maxCash;
			} else {
				// Max per drain calc
				hackReward = threadPercent * maxThreadsH * maxCash;
			}
		}

		// Calculate the cycle timings
		// Check weaken can outperform grow and hack:
		let cycleTime = 0;
		if (weakenStrength > growthSecurity && weakenStrength > hackSecurity) {
			cycleTime = weakenTime + growTime + weakenTime + hackTime;
		} else {
			// Calculate the number of weaken actions needed for both growth and hack security
			const weakenForGrowth = Math.ceil(growthSecurity / weakenStrength);
			const weakenForHack = Math.ceil(hackSecurity / weakenStrength);

			// Calculate the total cycle time considering weaken actions for both security levels
			cycleTime = weakenForGrowth * weakenTime + growTime + weakenForHack * weakenTime + hackTime;
		}

		// Convert to seconds
		cycleTime = cycleTime/1000;
		const cycleTimef = formatValueTime(cycleTime);
		
		// Final money calculations:
		const hackChance = ns.formulas.hacking.hackChance(serverTrue, player)
		const moneyPerCycle = hackReward / hackChance
		const moneyPerCyclef = formatValue(hackReward / hackChance)
		const moneyPerSecond = moneyPerCycle / cycleTime
		const moneyPerSecondf = formatValue(moneyPerCycle / cycleTime)

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
	// await ns.sleep(100)
	}

	return results
}
