/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: smartDeployer.js			 */
/* Deploys the smartController for every	 */
/*  private server, based on optimal targets */
/* ----------------------------------------- */

import { printCPS } from "utility/optimal.js"
import { clearLogFile, writeToLogFile } from "logs/logger.js";

export async function main(ns) {
	ns.disableLog("ALL");

	// Define the log file path
	ns.print(`Initialising. Setting up log file`)
	const logFile = 'logs/smartDeployer.txt';
	const logDelay = 0
	clearLogFile(ns, logFile)

	// Define control settings
	const printSetting = 0;
	const tailMode = 0;
	await writeToLogFile(ns, logDelay, logFile, `Print mode: ${printSetting}. Tailmode: ${tailMode}`);

	// Define file paths for new and old CPS files
	const cpsNew = "utility/data/cps.txt";
	const cpsOld = "utility/data/cps_deployed.txt";
	const quantFile = "utility/data/deployQuant.txt";
	//  let deployQuant = ns.fileExists(quantFile) ? ns.read(quantFile) : 0; // Set to 0 if file doesnt exist
	let deployQuant = ns.fileExists(quantFile) ? parseInt(ns.read(quantFile)) : 0; // Set to 0 if file doesnt exist
	const pidFile = "utility/data/deployPIDs.txt";
	const pServQuant = ns.getPurchasedServers().length;
	await writeToLogFile(ns, logDelay, logFile, `CPS files: ${cpsNew}, ${cpsOld}.  Private servers: ${pServQuant}`);
	await writeToLogFile(ns, logDelay, logFile, `Deployment: ${quantFile}; ${deployQuant}. Pids: ${pidFile}.`);

	// Print the contents of the new CPS file
	ns.print(`Requesting new CPS file`);
	await printCPS(ns);
	await writeToLogFile(ns, logDelay, logFile, `New CPS file created`);

	// Read and compare the contents of the CPS files
	ns.print(`New CPS file created, reading and comparing contents.`);
	const cpsNewContent = ns.read(cpsNew);
	let cpsOldContent;
	if (ns.fileExists(cpsOld)) {
		cpsOldContent = ns.read(cpsOld);
	} else {
		ns.print(`Old CPS file (${cpsOld}) does not exist.`);
		cpsOldContent = null;
	}
	const statusCPS = cpsOldContent && cpsNewContent === cpsOldContent ? 1 : 0; // Comparison 1 = same, 0 = different
	ns.print(`Contents compared, status: ${statusCPS}.`);
	await writeToLogFile(ns, logDelay, logFile, `Comparison status: ${statusCPS}`);

	// Convert the contents of cpsNew to an array of target servers
	const targetList = cpsNewContent.split('\n').filter(target => target.trim() !== '');
	await writeToLogFile(ns, logDelay, logFile, `Target List: ${targetList}`);

	// Deployment dependant on current status
	if (statusCPS === 1) {
		if (deployQuant === 25) {
			ns.print(`All servers previously deployed. Cancelling deployment.`)
		} else {
			// Deploy to all new servers
			for (let i = deployQuant + 1; i <= 25; i++) {
				const hostServ = `MickServ-${i}`
				const targetServ = targetList[i]
				ns.print(`Requesting deployment on ${hostServ} against ${targetServ}`)
				await writeToLogFile(ns, logDelay, logFile, `Requesting deployment on ${hostServ} against ${targetServ}`)
				await deployController(ns, hostServ, targetServ, printSetting, tailMode)
				// Update quantFile with the new quantity of deployed servers
				deployQuant++;
				await ns.rm(quantFile);
				ns.write(quantFile, i); // Write the current server index (i) as the new quantity of deployed servers
			}
		}
	} else {
		ns.print(`Replacing old CPS file with new`)
		await writeToLogFile(ns, logDelay, logFile, `Replacing old CPS file with new`)
		// Remove cpsOld
		await ns.rm(cpsOld)
		// Save cpsNew as cpsOld
		await ns.write(cpsOld, cpsNewContent);
		ns.print(`CPS file replaced. Obtaining list of running Pids to kill`)
		await writeToLogFile(ns, logDelay, logFile, `CPS file replaced.`)


		const pidList = ns.read(pidFile).split("\n").filter(pid => pid.trim() !== "" && !isNaN(parseInt(pid))).map(pid => parseInt(pid)); // Parse process IDs as integers
		await writeToLogFile(ns, logDelay, logFile, `Pid list obtained: ${pidList}`);
		for (const pid of pidList) {
			const processExists = await ns.ps(pid);
			if (processExists) {
				await ns.kill(pid);
				ns.print(`Killed process: ${pid}`);
				await writeToLogFile(ns, logDelay, logFile, `Killed process: ${pid}`);
			} else {
				ns.print(`Process with PID ${pid} does not exist.`);
			}
		}

		ns.print(`All pids killed. Removing file.`);
		await writeToLogFile(ns, logDelay, logFile, `All pids killed. Removing file ${pidFile}.`);
		await ns.rm(pidFile);

		// Kill all private server scripts
		const pServs = await ns.getPurchasedServers();
		// Iterate through the filtered servers and kill all scripts
		for (const pServ of pServs) {
			ns.killall(pServ);
			ns.print(`Killed all scripts on server: ${pServ}`);
			await writeToLogFile(ns, logDelay, logFile, `Killed all scripts on server: ${pServ}`);
		}

		// Deploy to all servers
		deployQuant = 0;
		for (let i = deployQuant + 1; i <= 25; i++) {
			const hostServ = `MickServ-${i}`
			const targetServ = targetList[i]
			ns.print(`Requesting deployment on ${hostServ} against ${targetServ}`)
			await writeToLogFile(ns, logDelay, logFile, `Requesting deployment on ${hostServ} against ${targetServ}`)
			await deployController(ns, hostServ, targetServ, printSetting, tailMode)
			// Update quantFile with the new quantity of deployed servers
			deployQuant++;
			await ns.rm(quantFile);
			await ns.write(quantFile, i); // Write the current server index (i) as the new quantity of deployed servers
		}
	}
}




// Deploy the smartController script to a specified host server
async function deployController(ns, hostServ, targetServ, printSetting, tailMode) {

	const logFile = 'logs/smartDeployer.txt';
	const logDelay = 0
	const smartController = "MickHacks/smartController.js";
	const pidFile = "utility/data/deployPIDs.txt";

	// Wait until the host server exists
	ns.print(`Checking for server ${hostServ} to deploy file.`)
	await serverExists(ns, hostServ);

	// Execute the smartController script on the host server
	ns.print(`Deploying file with args: ${hostServ}, ${targetServ}, ${printSetting}.`)
	writeToLogFile(ns, logDelay, logFile, `Deploying file with args: ${hostServ}, ${targetServ}, ${printSetting}.`)
	const filePid = ns.exec(smartController, "home", 1, hostServ, targetServ, printSetting);
	ns.print(`Deployed script successfully, pid: ${filePid}. Adding to file.`)
	ns.write(pidFile, `${filePid}\n`, "a"); // "a" for append mode
	writeToLogFile(ns, logDelay, logFile, `Deployed pid: ${filePid}.`)

	// Optionally tail the output if tailMode is enabled
	ns.print(`Tailmode: ${tailMode}.`)
	writeToLogFile(ns, logDelay, logFile, `Tailmode: ${tailMode}.`)
	if (tailMode === 1) {
		ns.print(`Tailing deployed script.`)
		ns.tail(filePid);
		writeToLogFile(ns, logDelay, logFile, `Tailed script.`)
	}

	// Log the successful deployment
	ns.print(`Deployed onto ${hostServ}, target: ${targetServ}`);
	writeToLogFile(ns, logDelay, logFile, `Deployed onto ${hostServ}, target: ${targetServ}`);
	ns.tprintf(`\x1b[38;5;242mDeployed controller for \x1b[38;5;250m${hostServ}\x1b[38;5;242m, target: \x1b[38;5;250m${targetServ}\x1b[0m`);
}

// Check if a server with the specified name exists among the purchased servers
async function serverExists(ns, serverName) {
	let servers = ns.getPurchasedServers();
	if (servers.includes(serverName)) {
		ns.print(`Server ${serverName} exists.`)
	} else {
		ns.print(`Server ${serverName} doesn't exist yet. Waiting...`)
		while (true) {
			// Get an array of all purchased servers
			servers = ns.getPurchasedServers();
			// Check if the specified serverName is present in the array
			if (servers.includes(serverName)) {
				ns.print(`Server ${serverName} exists. Exiting loop.`)
				break; // Exit the loop if the server exists
			} else {
				// If the server doesn't exist, wait for 10 seconds before retrying
				await ns.sleep(10000);
			}
		}
	}
}
