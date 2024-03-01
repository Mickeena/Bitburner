/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: data_Player.js			 */
/* Gets all data for the player and prints	 */
/*  it to the terminal						 */
/* ----------------------------------------- */

export async function main(ns) {
	const player = ns.getPlayer();

	// Print server data
	ns.tprintf("\x1b[38;5;250mPlayer Data:\x1b[0m");

	for (const key in player) {
		if (player.hasOwnProperty(key)) {
			ns.tprintf(`${key}: ${player[key]}`);
		}
	}
}