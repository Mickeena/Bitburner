/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's scripts: factionTracker.js		 */
/* Provides a visual representation of		 */
/* all factions augmentation progress.		 */
/* Originally by Gergith and MattherTh0		 */
/* on reddit: https://bit.ly/3wCXad9		 */
/* ----------------------------------------- */

export async function main(ns) {
	const fileLocation = "utility/data/factions.txt";

	const factionList = [
		["Early-game:", ""],
		["CyberSec", "Hack CSEC [2] (~60 hacking)"],
		["Tian Di Hui", "$1m, Hacking 50, Be in Chongqing, New Tokyo, or Ishima"],
		["Netburners", "Hacking 80, Total Hacknet levels 100, RAM 8, Cores 4"],
		["City:", ""],
		["Sector-12", "$15m, Be in Sector-12, Not in any other city faction but Aevum"],
		["Chongqing", "$20m, Be in Chongqing, Not in faction Sector-12, Aevum, or Volhaven"],
		["New Tokyo", "$20m, Be in New Tokyo, Not in faction Sector-12, Aevum, or Volhaven"],
		["Ishima", "$30m, Be in Ishima,    Not in faction Sector-12, Aevum, or Volhaven"],
		["Aevum", "$40m, Be in Aevum,     Not in any other city faction but Sector-12"],
		["Volhaven", "$50m, Be in Volhaven,  Not in any other city faction"],
		["Hacker:", ""],
		["NiteSec", "Hack avmnite-02h [4],  Home RAM at least 32 GB"],
		["The Black Hand", "Hack I.I.I.I [3],      Home RAM of 64 GB"],
		["BitRunners", "Hack run4theh111z [4], Home RAM of 128 GB"],
		["Megacorporations:", ""],
		["MegaCorp", "MegaCorp [S], 200k reputation"],
		["Blade Industries", "Blade Industries [S], 200k reputation"],
		["Four Sigma", "Four Sigma [s], 200k reputation"],
		["KuaiGong International", "KuaiGong International [C], 200k reputation"],
		["NWO", "NWO [V], 200k reputation"],
		["OmniTek Incorporated", "OmniTek Incorporated [V], 200k reputation"],
		["ECorp", "ECorp [A], 200k reputation"],
		["Bachman & Associates", "Bachman & Associates [A], 200k reputation"],
		["Clarke Incorporated", "Clarke Incorporated [A], 200k reputation"],
		["Fulcrum Secret Tech...", "Fulcrum Technologies [A], 200k reputation, Hack fulcrumassets [5] (~1185)"],
		["Criminal:", ""],
		["Slum Snakes", "$1m, All combat stats 30, -9 karma"],
		["Tetrads", "Be in Chongqing, New Tokyo, or Ishima, All combat stats 75, -18 karma"],
		["Silhouette", "$15m, CTO, CFO, or CEO at any company, -22 karma"],
		["Speakers for the Dead", "Hacking 100, All combat stats 300, 30 people killed, -45 karma, Not CIA/NSA"],
		["The Dark Army", "Hacking 300, All combat stats 300, Be in Chongqing, 5 people killed, -45 karma, Not CIA/NSA"],
		["The Syndicate", "$10m, Hacking 200, All combat stats 200, Be in Aevum or Sector-12, -90 karma, Not CIA/NSA"],
		["Endgame", ""],
		["The Covenant", "$75b, 30 augmentations, Hacking 850, All combat stats 850"],
		["Daedalus", "$100b, 30 augmentations, Hacking 2500 or all combat stats 1500"],
		["Illuminati", "$150b, 30 augmentations, Hacking 1500, All combat stats 1200"]
	];
	const factionRow = "| %4s | %02d | %-22s | %s",
		headerRow = "|──────┼────| %-22s | %s";

	const args = ns.flags([
		["help", false],
		["noOutput", false],
		["setNotDone", -1],
		["clearAll", false]
	]);

	if (args.help) {
		ns.tprintf("Arguments are completed factions.");
		ns.tprintf("Flags are [--help], [--noOutput], [--setNotDone numOfFaction], [--clearAll]");
		return;
	}

	let tempStatus = [],
		argLen = ns.args.length,
		modified = false;

	if (ns.fileExists(fileLocation, "home")) {
		var temp = ns.read(fileLocation);
		tempStatus = temp.split(",");
	} else {
		/** @type Array<Number> */
		tempStatus = new Array(32).fill(0);
	}

	for (let i = 0; i < argLen; i++) {
		let tempArg = ns.args[i];
		if (typeof tempArg == "number" && ns.args[i] > 0 && ns.args[i] < 32) {
			tempStatus[tempArg - 0] = 1; // <---------------------------------------------------------------------------------------------------------------------------------------
			modified = true;
		} else {
			break;
		}
	}
	if (args.clearAll) {
		let areYouSure = await ns.prompt("Are you sure you want to reset the faction list?");
		if (!areYouSure) {
			return;
		}
		for (var i = 0; i < 31; i++) {
			tempStatus[i] = 0;
			modified = true;
		}
	} else if (args.setNotDone > 0 && args.setNotDone < 32) {
		tempStatus[args.setNotDone] = 0;
		modified = true;
	}

	if (modified) {
		await ns.write(fileLocation, tempStatus.join(","), "w");
	}

	if (!args.noOutput) {
		var doneStatus = [];
		for (var i = 0; i < 31; i++) {
			if (tempStatus[i] == 1) {
				doneStatus[i] = "\x1b[38;5;155mDone\x1b[0m";
			} else {
				doneStatus[i] = "\x1b[31m No \x1b[0m";
			}
		}

		ns.tprintf("┌──────┬────┬────────────────────────┐");
		ns.tprintf("| Done | ## | Faction Name:          | Requirements:");
		let offSet = 0;
		for (let i = 0; i < factionList.length; i++) {
			if (factionList[i][1] == "") {
				ns.tprintf(ns.vsprintf(headerRow, factionList[i]));
				offSet++;
			} else {
				ns.tprintf(ns.vsprintf(factionRow, [doneStatus[i - offSet], i - offSet, factionList[i][0], factionList[i][1]]));
			}
		}
		ns.tprintf("└──────┴────┴────────────────────────┘");
	}
}
