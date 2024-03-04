/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: logger.js				 */
/* Allows exporting debug logs to a separate */
/*  file									 */
/* ----------------------------------------- */

// import { clearLogFile, writeToLogFile } from 'logs/logger.js';

export async function clearLogFile(ns, logFilePath) {
	await ns.rm(logFilePath);
}

export async function writeToLogFile(ns, logDelay, logFilePath, message) {
	if (!logDelay < 1) {
		await ns.sleep(logDelay)
	}

	// Format the log message with a timestamp
	const timestamp = new Date().toISOString();
	const formattedMessage = `[${timestamp}] ${message}\n`;

	// Write the message to the log file
	await ns.write(logFilePath, formattedMessage, 'a');
}
