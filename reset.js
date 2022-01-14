/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint('Starting reset')
    ns.scriptKill('init.js', 'home')
    ns.scriptKill('master.js', 'home')
    ns.scriptKill('h.js', 'home')
    ns.scriptKill('g.js', 'home')
    ns.scriptKill('w.js', 'home')

    ns.tprint('Getting servers')
    var rooted = ns.read('rooted.txt').split(',')
    for (const server of rooted) {
        ns.rm(server + '.txt', 'home')
    }
    ns.rm(rooted + '.txt', 'home')
    ns.run('worm.js')
    await ns.sleep(500)
    rooted = ns.read('rooted.txt').split(',')
    for (const server of rooted) {
        ns.run('getMax.js', 1, server, 'reset')
        await ns.scp('h.js', 'home', server)
        await ns.scp('g.js', 'home', server)
        await ns.scp('w.js', 'home', server)
        ns.scriptKill('h.js', server)
        ns.scriptKill('g.js', server)
        ns.scriptKill('w.js', server)
    }
    await ns.asleep(500)

    ns.tprint('Init servers')
    ns.run('best.js', 1, 'reset')
    await ns.asleep(500)
    ns.run('init.js', 1, 'best', 'reset')
    while (ns.isRunning('init.js', 'home', 'best', 'reset')) {
        await ns.asleep(500)
    }

    ns.tprint('Start master.js')
    ns.run('master.js')
    await ns.asleep(10000)
    ns.run('best.js')
}