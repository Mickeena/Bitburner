/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: fixPrivServNames.js		 */
/* Removes private servers not following the */
/* intended naming convention (or requested) */
/* ----------------------------------------- */

// import { fixPrivServNames } from "utility/fixPrivServNames.js"

// Main function for running the script directly
export async function main(ns) {
    await fixPrivServNames(ns);
}

export async function fixPrivServNames(ns) {
    // Check for excess args
    if (ns.args.length !== 0 && ns.args.length !== 1) {
        ns.tprintf("\x1b[31mUsage: run utility/fixPrivServNames.js <serverName>");
        return;
    }

    // Define the naming pattern
    const namingPattern = /^MickServ-(?:[1-9]|1\d|2[0-5])$/;

    // Check if an argument is provided
    const args = ns.args;
    if (args.length > 0) {
        // Argument provided, remove the specified server
        const targetServer = args[0];
        if (ns.getPurchasedServers(true).includes(targetServer)) {
            ns.tprintf(`\x1b[38;5;155mRemoving server "${targetServer}" as requested.`);
            await ns.deleteServer(targetServer);
        } else {
            ns.tprintf(`\x1b[31mServer "${targetServer}" either does not exist or is not a private server.`);
        }
    } else {
        // No argument provided, check all purchased servers
        const purchasedServers = ns.getPurchasedServers();
        for (const serverName of purchasedServers) {
            // Check if the server name matches the naming pattern
            if (!namingPattern.test(serverName)) {
                ns.tprintf(`\x1b[38;5;155mDeleting server "${serverName}" as it does not follow the naming pattern.`);
                await ns.deleteServer(serverName);
            }
        }
    }
}
