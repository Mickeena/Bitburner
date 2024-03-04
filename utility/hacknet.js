/* ----------------------------------------- */
/** @param {NS} ns                           */
/* Mickeena's scripts: hacknet.js            */
/* Automatically buys and upgrades hacknet   */
/*  nodes until desired quantity is reached  */
/*  and fully upgraded.                      */
/* ----------------------------------------- */

export async function main(ns) {
	ns.disableLog("ALL");

	ns.atExit(() => {
		ns.closeTail();
	});

	// Parse command line arguments for maxNodes, default to 12 if not provided or invalid
	let args = ns.args;
	let maxNodes = args && args[0] ? args[0] : 12;
	ns.print(`Max nodes input: ${maxNodes}`)

	// Validate maxNodes argument
	if (isNaN(maxNodes) || maxNodes <= 0) {
		ns.tprint("Invalid maxNodes argument. Please provide a positive integer.");
		return;
	}

	// Get the current number of nodes
	let currNodes = ns.hacknet.numNodes();
	ns.print(`Current nodes: ${currNodes}`)

	// Continuously optimize the Hacknet nodes
	while (true) {
		// Initialize variables to track the cheapest upgrade option
		let cheapest = Infinity;
		let cheapType = "";
		let cheapNode = 0;

		// Iterate over all current nodes to find the cheapest upgrade option
		for (let i = 0; i < currNodes; i++) {
			let costLevel = ns.hacknet.getLevelUpgradeCost(i, 1);
			let costRam = ns.hacknet.getRamUpgradeCost(i, 1);
			let costCore = ns.hacknet.getCoreUpgradeCost(i, 1);

			// Check if upgrading level is the cheapest option
			if (costLevel < cheapest) {
				cheapest = costLevel;
				cheapType = "Level";
				cheapNode = i;
			}

			// Check if upgrading RAM is the cheapest option
			if (costRam < cheapest) {
				cheapest = costRam;
				cheapType = "Ram";
				cheapNode = i;
			}

			// Check if upgrading Core is the cheapest option
			if (costCore < cheapest) {
				cheapest = costCore;
				cheapType = "Core";
				cheapNode = i;
			}
			ns.print(`Checking node: ${i}. Level: ${costLevel}. Ram: ${costRam}. Core: ${costCore}.`)
			ns.print(`Current cheapest: Node ${cheapNode}, type: ${cheapType}, cost: ${cheapest}`)
		}

		// If there are less nodes than maxNodes, check if purchasing a new node is cheaper
		if (currNodes < maxNodes) {
			let costNode = ns.hacknet.getPurchaseNodeCost();
			ns.print(`New node cost: ${costNode}`)
			if (costNode < cheapest) {
				cheapest = costNode;
				cheapType = "Node";
			}
		} else {
			ns.print(`Max nodes achieved, skipping new node cost.`)
		}

		// If no upgrades are possible, exit the script
		if (cheapest === Infinity) {
			ns.tprint("\x1b[38;5;155mAll nodes maxed. Exiting hacknet script.");
			ns.print("All nodes maxed. Exiting hacknet script.");
			return;
		} else {
			// Format cheapest cost
			let roundedCheapest = new Intl.NumberFormat('en-US').format(Math.ceil(cheapest));

			// Loop until enough money is available to perform the upgrade/purchase
			while (true) {
				ns.print("Waiting for $" + roundedCheapest + " to buy " + cheapType + " for node " + cheapNode);
				if (cheapest < await ns.getServerMoneyAvailable("home")) {
					// Perform the cheapest upgrade/purchase and break the loop
					if (cheapType === "Level") {
						await ns.hacknet.upgradeLevel(cheapNode, 1);
					} else if (cheapType === "Ram") {
						await ns.hacknet.upgradeRam(cheapNode, 1);
					} else if (cheapType === "Core") {
						await ns.hacknet.upgradeCore(cheapNode, 1);
					} else if (cheapType === "Node") {
						await ns.hacknet.purchaseNode();
						currNodes++;
					} else {
						ns.tprint("\x1b[31mError, no cheaptype compatible. Cheaptype known: " + cheapType);
						return;
					}
					break;
				}
				await ns.sleep(1000); // Wait for 1 second before checking again
			}
		}
	}
}
