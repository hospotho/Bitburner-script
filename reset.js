/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint('Starting reset')
	ns.scriptKill('master.js', 'home')
	if (ns.scriptRunning('w.js', 'home')) {
		ns.tprint('Waiting all w.js exit')
	}
	while (ns.scriptRunning('w.js', 'home')) {
		await ns.asleep(1000)
	}

	ns.tprint('Getting servers')
	ns.run('worm.js')
	await ns.sleep(1000)

	ns.tprint('Calc servers performance')
	var servers = ns.read('rooted.txt').split(',')
	for (const server of servers) {
		ns.run('getMax.js', 1, server, 'reset')
		await ns.scp('h.js', 'home', server)
		await ns.scp('g.js', 'home', server)
		await ns.scp('w.js', 'home', server)
	}
	await ns.asleep(1000)

	ns.tprint('Ranking servers')
	ns.run('best.js', 1, 'reset')
	await ns.asleep(1000)

	ns.tprint('Init servers')
	ns.run('init.js', 1, 'best', 'reset')
	while (ns.scriptRunning('init.js', 'home')) {
		await ns.asleep(1000)
	}

	ns.tprint('Start master.js to farm')
	ns.run('master.js')
	await ns.asleep(10000)
	ns.run('best.js')
}