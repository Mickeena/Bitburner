/* ----------------------------------------- */
/** @param {NS} ns							 */
/* Mick's Scripts: mhs_w.js				 	 */
/* ----------------------------------------- */
/* Slave hacking script: weaken				 */
/* ----------------------------------------- */

export async function main(ns) {
	const target = ns.args[0]
	const threads = ns.args[1]
	const print = ns.args[2]
	const hostServ = ns.args[3]
	const delay = ns.args[4]
	
	

	if (delay && delay > 0) {
		await ns.sleep(delay)
	}

	if (print && print === 1) {
		ns.print(`Starting operation: weaken on ${target} in ${threads} threads`)
	} else if (print && print === 2) {
		ns.tprintf(`\x1b[38;5;242m${hostServ} Starting operation: weaken on \x1b[38;5;250m${target}\x1b[38;5;242m in \x1b[38;5;250m${threads}\x1b[38;5;242m threads\x1b[0m`)
	}
	await ns.weaken(target, { threads, stock: true })
	ns.exit()
}