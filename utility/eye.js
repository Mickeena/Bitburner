/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: eye.js					 */
/* Provides a visual map of all servers with */
/*  various optional functionality			 */
/* ----------------------------------------- */

//import { scanAll, nukeAll, mapAll } from 'utility/eye.js';
import { formatValueSec } from 'utility/formatValues.js';

export async function main(ns) {
	let args = ns.args;
	let mode = args && args[0] ? args[0] : "view"; // Default to "view" mode if no mode is provided
	let targetServer = args && args[1] ? args[1] : null; // Default to null if no targetServer is provided
	await mapAll(ns, mode, targetServer);
}

/* ---------------------------------------------------------------------------- */
/* Function scanAll(ns, "starting server")										*/
/* Scan all servers and return the list											*/
/* ---------------------------------------------------------------------------- */
export function scanAll(ns, server) {
	let serverList = [];

	function scanning(server) {
		let currentScan = ns.scan(server);
		currentScan.forEach(server => {
			if (!serverList.includes(server)) {
				serverList.push(server);
				scanning(server);
			}
		});
	}

	scanning(server);
	return serverList;
}


/* ---------------------------------------------------------------------------- */
/* Function nukeAll(ns, "starting server")										*/
/* Breach all possible servers and nuke them for root access					*/
/* ---------------------------------------------------------------------------- */
export function nukeAll(ns, server = "home") {
	ns.disableLog("ALL");
	// Count breachable ports
	let portsAvailable = ns.fileExists("BruteSSH.exe", "home") + ns.fileExists("FTPCrack.exe", "home") + ns.fileExists("RelaySMTP.exe", "home") + ns.fileExists("HTTPWorm.exe", "home") + ns.fileExists("SQLInject.exe", "home");
	ns.print(`Breachable ports: ${portsAvailable}`)
	ns.print(`Importing server list.`)

	// Add all servers to a single list
	let serverList = scanAll(ns, server);

	let nukeCountNew = 0
	let nukeCountOld = 0
	let nukeCountSkipped = 0

	ns.print(`Initiating nuke.`)
	// Nuke all possible servers
	serverList.forEach(serverName => {
		// If enough breaches available
		if (ns.getServerNumPortsRequired(serverName) <= portsAvailable) {
			// Check if previously nuked
			if (!ns.hasRootAccess(serverName)) {
				if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(serverName); }
				if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(serverName); }
				if (ns.fileExists("RelaySMTP.exe", "home")) { ns.relaysmtp(serverName); }
				if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(serverName); }
				if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(serverName); }

				ns.nuke(serverName);
				ns.print(`Server: ${serverName}. Status: nuked.`)
				// ns.tprintf("Nuked " + serverName + " successfully");
				nukeCountNew = nukeCountNew + 1
			} else {
				//ns.print("Previously rooted, skipping: " + serverName);
				ns.print(`Server: ${serverName}. Status: previously rooted.`)
				nukeCountOld = nukeCountOld + 1
			}
		}
		else {
			//	ns.tprintf("Not enough breachable ports for " + serverName + ", skipping");
			ns.print(`Server: ${serverName}. Status: too secure.`)
			nukeCountSkipped = nukeCountSkipped + 1
		}
	});
	ns.tprintf("\x1b[38;5;155mTotal servers nuked: " + nukeCountNew + "\x1b[0m");
	ns.tprintf("\x1b[38;5;178mTotal servers previously nuked: " + nukeCountOld + "\x1b[0m");
	ns.tprintf("\x1b[38;5;1mTotal servers too secure: " + nukeCountSkipped + "\x1b[0m");
}

/* ---------------------------------------------------------------------------- */
/* Function mapAll(ns, "mode", "target server for path mode")					*/
/* Map all servers and use the map for various purposes:						*/
/* Mode "view": Display all servers with ports, level, root status and ram		*/
/* Mode "cash":	Display all servers with hacking information (cash & security)	*/
/* Mode "cashHide": Cash mode but without unavailable servers 					*/
/* Mode "path":	Calculate and print the connection path to a target				*/
/* Mode "backdoor":	Calculate and print the backdoor path for all targets		*/
/* Mode "backdoorlow":	Calculate and print the backdoor path lowest target		*/
/* ---------------------------------------------------------------------------- */
export function mapAll(ns, mode = "view", targetServer = null) {
	ns.disableLog("ALL");
	let serverList = [];
	let maxDepth = 0;
	let maxNameLength = 0;
	let maxLevelLength = 0;
	let maxRamLength = 0;
	let playerLevel = ns.getHackingLevel();

	// Set mode aliases
	if (mode === "v") {
		mode = "view";
	} else if (mode === "c") {
		mode = "cash";
	} else if (mode === "h") {
		mode = "cashHide";
	} else if (mode === "ch") {
		mode = "cashHide";
	} else if (mode === "hide") {
		mode = "cashHide";
	} else if (mode === "p") {
		mode = "path";
	} else if (mode === "b") {
		mode = "backdoor";
	} else if (mode === "bl") {
		mode = "backdoorLow";
	} else if (mode === "l") {
		mode = "backdoorLow";
	} else if (mode === "low") {
		mode = "backdoorLow";
	}
	if (mode === "nuke" || mode === "n") {
		ns.print(`Mode: nuke.`)
		nukeAll(ns)
	} else {
		ns.print(`Mode: ${mode}. Initiating full scan.`)

		// Function to recursively scan servers
		function scanServer(server, parent, depth, isLast) {
			// Add server to the list with depth and parent information
			serverList.push({ name: server, parent, depth, isLast });

			// Update maximum values
			maxDepth = Math.max(maxDepth, depth);
			maxNameLength = Math.max(maxNameLength, server.length);

			let requiredLevel = ns.getServerRequiredHackingLevel(server);
			maxLevelLength = Math.max(maxLevelLength, requiredLevel.toString().length);

			let maxRam = ns.getServerMaxRam(server);
			maxRamLength = Math.max(maxRamLength, maxRam.toString().length);

			// Get an array of connected servers
			let connectedServers = ns.scan(server);

			// Get connected servers and recursively scan them
			connectedServers.forEach((connectedServer, index) => {
				if (!serverList.some(s => s.name === connectedServer)) {
					scanServer(connectedServer, server, depth + 1, index === connectedServers.length - 1);
				}
			});
		}

		// Start scanning from the "home" server
		scanServer("home", null, 0, true);
		ns.print(`Servers scanned.`)

		// Execute path-specific logic
		if (mode === "path") {
			ns.print(`Path mode: finding path to server.`)
			if (targetServer) {
				// Find the server object in the serverList array
				let server = serverList.find(s => s.name === targetServer);
				if (server) {
					// Initialize the path string with the target server's name
					let path = server.name;
					let parent = server.parent;

					// Traverse through parent servers until reaching the "home" server
					while (parent !== null) {
						// Find the parent server object in the serverList array
						let parentServer = serverList.find(s => s.name === parent);
						if (parentServer) {
							// Check if the parent server is not "home" before adding "connect"
							if (parentServer.name !== "home") {
								path = "connect " + parentServer.name + "; " + path;
							} else {
								path = parentServer.name + "; " + path;
							}
							// Update the parent server for the next iteration
							parent = parentServer.parent;
						} else {
							// Break the loop if the parent server is not found
							break;
						}
					}
					ns.print(`Path found, preparing to print.`)

					// Add "connect" before the final server in the path
					path = path.replace(/;([^;]*)$/, "; connect$1");

					// Print the path
					ns.tprintf("\x1b[38;5;242mPath to " + targetServer + ": \x1b[0m");
					ns.tprintf("\x1b[38;5;250m" + path + "\x1b[0m");
					ns.print(`Path printed. Finished.`)
				} else {
					ns.tprintf("Target server not found in the server list.");
					ns.print("Target server not found in the server list.");
				}
			} else {
				ns.tprintf("No target server selected.");
				ns.print("No target server selected.");
			}
		}

		// Display the server map in the terminal with visual links and additional information
		if (mode === "view") {
			ns.print(`View mode: preparing list for print.`)
			// Calculate the total padding needed
			let totalPadding = maxDepth * 2 + maxNameLength;
			serverList.forEach(server => {
				let prefix = "  ".repeat(server.depth);
				prefix += (server.isLast ? "└─ " : "├─ ");
				let padding = " ".repeat(totalPadding - (server.depth * 2 + server.name.length));
				let depthPadding = server.depth < 10 ? " " : "";
				let portsRequired = ns.getServerNumPortsRequired(server.name);
				let rootStatus = ns.hasRootAccess(server.name) ? "rooted  " : "unrooted";
				let requiredLevel = ns.getServerRequiredHackingLevel(server.name);
				let maxRam = ns.getServerMaxRam(server.name);
				let levelPadding = " ".repeat(maxLevelLength - requiredLevel.toString().length);
				let levelColor = "";
				let backdoorStat = ns.getServer(server.name).backdoorInstalled;
				let mickservStatus = server.name === "home" || server.name.startsWith("MickServ");

				if (requiredLevel > playerLevel) {
					levelColor = "\x1b[31m"; // Red
				} else {
					if (mickservStatus) {
						levelColor = "\x1b[32m"; // Green
					} else if (backdoorStat) {
						levelColor = "\x1b[32m"; // Green
					} else {
						levelColor = "\x1b[33m"; // Yellow
					}
				}
				if (rootStatus === "unrooted") {
					ns.tprintf(`${prefix}[${server.depth}] ${server.name}${padding}${depthPadding}(${portsRequired}) ports - \x1b[31m${rootStatus}\x1b[0m - lvl ${levelColor}(${requiredLevel})\x1b[0m${levelPadding} - ${maxRam}`);
				} else {
					ns.tprintf(`${prefix}[${server.depth}] ${server.name}${padding}${depthPadding}(${portsRequired}) ports - ${rootStatus} - lvl ${levelColor}(${requiredLevel})\x1b[0m${levelPadding} - ${maxRam}`);
				}
			});
			ns.print(`Finished printing.`)
		}

		// Execute backdoor-specific logic
		if (mode === "backdoor") {
			ns.print(`Backdoor mode: preparing list.`)
			serverList.forEach(server => {
				if (server.name !== "home" && !server.name.startsWith("MickServ")) {
					let requiredLevel = ns.getServerRequiredHackingLevel(server.name);
					let rootStatus = ns.hasRootAccess(server.name);
					let backdoorStat = ns.getServer(server.name).backdoorInstalled;

					if (rootStatus && !backdoorStat && requiredLevel < playerLevel) {
						let path = "";
						let parent = server.parent;

						// Traverse through parent servers until reaching the "home" server
						while (parent !== null) {
							// Find the parent server object in the serverList array
							let parentServer = serverList.find(s => s.name === parent);
							if (parentServer) {
								// Check if the parent server is not "home" before adding "connect"
								if (parentServer.name !== "home") {
									path = "connect " + parentServer.name + "; " + path;
								} else {
									path = parentServer.name + "; " + path;
								}
								// Update the parent server for the next iteration
								parent = parentServer.parent;
							} else {
								// Break the loop if the parent server is not found
								break;
							}
						}

						ns.print(`Suitable server found, printing path to: ${server}`)
						// Add the current server to the path
						path += "connect " + server.name;

						// Add "; backdoor" to the end of the path
						path += "; backdoor";

						// Print the path
						ns.tprintf("\x1b[38;5;242mPath to backdoor " + server.name + " [" + requiredLevel + "]: \x1b[0m");
						ns.tprintf("\x1b[38;5;250m" + path + "\x1b[0m");
					}
				}
			});
		}

		// Execute backdoorlow-specific logic
		if (mode === "backdoorLow") {
			ns.print(`Backdoor(lowest) mode: preparing full list.`)
			let lowestServer = null;
			let lowestServerLevel = Infinity;

			// Filter the server list to include only relevant servers
			let relevantServers = serverList.filter(server => {
				return server.name !== "home" &&
					!server.name.startsWith("MickServ") &&
					ns.hasRootAccess(server.name) &&
					!ns.getServer(server.name).backdoorInstalled &&
					ns.getServerRequiredHackingLevel(server.name) < playerLevel;
			});
			ns.print(`Backdoor list prepared, finding best target.`)
			// Prioritize specific servers if they're lower level than your current level
			["CSEC", "I.I.I.I", "run4theh111z", "avmnite-02h", "fulcrumassets"].forEach(targetServer => {
				let server = relevantServers.find(s => s.name === targetServer);
				if (server && ns.getServerRequiredHackingLevel(server.name) < lowestServerLevel) {
					lowestServer = server;
					lowestServerLevel = ns.getServerRequiredHackingLevel(server.name);
					ns.print(`Override target found: ${lowestServer} at level ${lowestServerLevel}.`)
				}
			});
			// If no specific servers are found or they are not lower level than your current level, find the lowest level server
			if (!lowestServer) {
				relevantServers.forEach(server => {
					if (ns.getServerRequiredHackingLevel(server.name) < lowestServerLevel) {
						lowestServer = server;
						lowestServerLevel = ns.getServerRequiredHackingLevel(server.name);
					}
				});
				ns.print(`Target found: ${lowestServer} at level ${lowestServerLevel}.`)
			}
			// Construct the path to the selected server
			if (lowestServer) {
				ns.print(`Finding path to server.`)
				let path = "";
				let parent = lowestServer.parent;

				// Traverse through parent servers until reaching the "home" server
				while (parent !== null) {
					let parentServer = serverList.find(s => s.name === parent);
					if (parentServer) {
						if (parentServer.name !== "home") {
							path = "connect " + parentServer.name + "; " + path;
						} else {
							path = parentServer.name + "; " + path;
						}
						parent = parentServer.parent;
					} else {
						break;
					}
				}
				ns.print(`Formatting path.`)

				// Add the selected server to the path
				path += "connect " + lowestServer.name;

				// Add "; backdoor" to the end of the path
				path += "; backdoor";

				// Print the path
				ns.tprintf("\x1b[38;5;242mPath to backdoor " + lowestServer.name + " [" + lowestServerLevel + "]: \x1b[0m");
				ns.tprintf("\x1b[38;5;250m" + path + "\x1b[0m");
				ns.print(`Path completed`)
			} else {
				// If no suitable server is found, print a message
				ns.tprintf("No suitable server found for backdoor.");
				ns.print("No suitable server found for backdoor.");
			}
		}


		// Execute cash-specific logic
		if (mode === "cash" || mode === "cashHide") {
			ns.print(`Cash mode: filtering out 0 cash targets.`)
			// Filter out servers with 0 cash
			serverList = serverList.filter(server => ns.getServerMaxMoney(server.name) > 0);

			// Apply cashHide mode if specified
			if (mode === "cashHide") {
				ns.print(`Cash(hide) mode: filtering out high-level targets.`)
				serverList = serverList.filter(server => ns.getServerRequiredHackingLevel(server.name) <= playerLevel);
			}

			// Calculate the total padding needed for each value
			let maxCashLength = 0;
			let currCashLength = 0;
			let currSecurityLength = 0;
			let minSecurityLength = 0;
			let requiredLevelLength = 0;

			serverList.forEach(server => {
				currCashLength = Math.max(currCashLength, formatValueSec(ns.getServerMoneyAvailable(server.name)).length);
				let maxCashFormatted = formatValueSec(ns.getServerMaxMoney(server.name));
				maxCashLength = Math.max(maxCashLength, maxCashFormatted.length);
				currSecurityLength = Math.max(currSecurityLength, formatValueSec(ns.getServerSecurityLevel(server.name), true).length);
				minSecurityLength = Math.max(minSecurityLength, formatValueSec(ns.getServerMinSecurityLevel(server.name), true).length);
				requiredLevelLength = Math.max(requiredLevelLength, ns.getServerRequiredHackingLevel(server.name).toString().length);
			});

			let totalPadding = maxDepth * 2 + maxNameLength;

			serverList.forEach(server => {
				ns.print(`Preparing server: ${server}`)
				let cash = formatValueSec(ns.getServerMoneyAvailable(server.name));
				let maxCash = formatValueSec(ns.getServerMaxMoney(server.name));
				let currSecurity = formatValueSec(ns.getServerSecurityLevel(server.name), true);
				let minSecurity = formatValueSec(ns.getServerMinSecurityLevel(server.name), true);
				let requiredLevel = ns.getServerRequiredHackingLevel(server.name);

				let cashColor = getColorCode(cash, maxCash, "cash");
				let securityColor = getColorCode(currSecurity, minSecurity, "security");
				let levelColor = getColorCode(requiredLevel, playerLevel, "level");

				let cashPadding = " ".repeat(currCashLength - cash.length);
				let maxCashPadding = " ".repeat(maxCashLength - maxCash.length);
				let currSecurityPadding = " ".repeat(currSecurityLength - currSecurity.length);
				let minSecurityPadding = " ".repeat(minSecurityLength - minSecurity.length);
				let hackLevelPadding = " ".repeat(requiredLevelLength - requiredLevel.toString().length);

				let prefix = "  ".repeat(server.depth);
				prefix += (server.isLast ? "└─ " : "├─ ");
				let padding = " ".repeat(totalPadding - (server.depth * 2 + server.name.length));
				let depthPadding = server.depth < 10 ? " " : "";

				ns.tprintf(`${prefix}[${server.depth}] ${server.name}${padding}${depthPadding}Cash: ${cashColor}${cash}${cashPadding}\x1b[0m / ${maxCash}${maxCashPadding} - Security: ${securityColor}${currSecurity}${currSecurityPadding}\x1b[0m / ${minSecurity}${minSecurityPadding} - Hack Level: ${levelColor}${requiredLevel}${hackLevelPadding}`);
			});
			ns.print(`Finished printing.`)
		}

		// Get the color code based on the value, maxValue, and type
		function getColorCode(value, maxValue, type) {
			let colorCode = "\x1b[38;5;178m"; // Default color code (between 10% and 100%)

			if (type === "cash") {
				if (value === maxValue) {
					colorCode = "\x1b[38;5;155m"; // Max color code
				} else if (value < 0.1 * maxValue) {
					colorCode = "\x1b[38;5;1m"; // Less than 10% color code
				}
			} else if (type === "security") {
				if (value === maxValue) {
					colorCode = "\x1b[38;5;155m"; // Max color code
				} else if (value > 1.5 * maxValue) {
					colorCode = "\x1b[38;5;1m"; // Above 1.5x min color code
				} else if (value > maxValue && value <= 1.5 * maxValue) {
					colorCode = "\x1b[38;5;178m"; // Between min and 1.5x min color code
				}
			} else if (type === "level") {
				if (value > playerLevel) {
					colorCode = "\x1b[38;5;1m"; // Above player level color code
				} else if (value < 0.25 * playerLevel) {
					colorCode = "\x1b[38;5;155m"; // Below 25% of player level color code
				} else if (value >= 0.25 * playerLevel && value <= 0.5 * playerLevel) {
					colorCode = "\x1b[38;5;226m"; // Between 25% and 50% of player level (yellow)
				} else if (value > 0.5 * playerLevel && value <= playerLevel) {
					colorCode = "\x1b[38;5;178m"; // Between 50% and player level color code
				}
			}
			return colorCode;
		}
	}
}
