/** @param {NS} ns **/
export async function main(ns) {
    ns.tprintf('start.js starting first reset.js')
    await ns.sleep(1000)
    ns.disableLog('ALL')
    ns.run('buyServer.js')
    ns.run('reset.js')
    while (ns.isRunning('reset.js', 'home')) {
        await ns.asleep(500)
    }
    var hackLv = ns.getHackingLevel()
    var resetTime = 1000 * 60 * 60
    while (true) {
        var cHackLv = ns.getHackingLevel()
        ns.clearLog()
        ns.print(`HackLv:            ${hackLv}`)
        ns.print(`CurrentHackLv:     ${cHackLv}`)
        ns.print(`ResetTime:         ${resetTime / 1000}s`)
        if (hackLv < 3000 && (resetTime == 0 || cHackLv - hackLv > 50)) {
            ns.tprint('start.js starting new reset.js')
            hackLv = cHackLv
            resetTime = 1000 * 60 * 120
            ns.run('reset.js')
            while (ns.isRunning('reset.js', 'home')) {
                await ns.asleep(500)
            }
        }
        resetTime -= 1000
        await ns.sleep(1000)
    }
}