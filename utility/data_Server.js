/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: data_Server.js			 */
/* Gets all data for a server and prints it  */
/*  to the terminal							 */
/* ----------------------------------------- */

export async function main(ns) {
	const server = ns.getServer(ns.args[0]);

	// Print server data
	ns.tprintf("\x1b[38;5;250mServer Data:\x1b[0m");

	for (const key in server) {
		if (server.hasOwnProperty(key)) {
			ns.tprintf(`${key}: ${server[key]}`);
		}
	}
}