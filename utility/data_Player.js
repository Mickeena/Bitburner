/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: data_Player.js			 */
/* Gets all data for the player and prints	 */
/* it to the terminal. For full data, 		 */
/* including stats etc, use "full" as an arg */
/* ----------------------------------------- */

export async function main(ns) {
    const player = ns.getPlayer();

    // Print server data
    ns.tprintf("\x1b[38;5;255mPlayer Data:\x1b[0m");

    if (ns.args.length > 0 && ns.args[0] === "full") {
        for (const key in player) {
            if (player.hasOwnProperty(key)) {
                const value = player[key];
                if (typeof value === 'object') {
                    ns.tprintf(`\x1b[38;5;251m${key}:\n`);
                    for (const subKey in value) {
                        if (value.hasOwnProperty(subKey)) {
                            ns.tprintf(`\t\x1b[38;5;251m${subKey}: \x1b[38;5;243m${value[subKey]}\n`);
                        }
                    }
                } else {
                    ns.tprintf(`\x1b[38;5;251m${key}: \x1b[38;5;243m${value}\n`);
                }
            }
        }
    } else {
        // Original code without delving into objects
        for (const key in player) {
            if (player.hasOwnProperty(key)) {
                ns.tprintf(`\x1b[38;5;251m${key}: \x1b[38;5;243m${player[key]}\n`);
            }
        }
    }
}
