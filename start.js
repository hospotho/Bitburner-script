/** @param {NS} ns **/
export async function main(ns) {
    ns.tprintf('start.js starting first reset.js')
    await ns.sleep(1000)
    ns.disableLog('ALL')
    ns.run('reset.js')
    while (ns.isRunning('reset.js', 'home')) {
        await ns.asleep(500)
    }
    ns.tprint('buy BruteSSH.exe;buy FTPCrack.exe;buy relaySMTP.exe;buy HTTPWorm.exe;buy SQLInject.exe;buy DeepscanV1.exe;buy AutoLink.exe;')
    await ns.asleep(1000 * 60 * 10)
    ns.run('buyServer.js')
    var hackLv = ns.getHackingLevel()
    var resetTime = 0
    while (hackLv < 3000) {
        var cHackLv = ns.getHackingLevel()
        ns.clearLog()
        ns.print(`HackLv:            ${hackLv}`)
        ns.print(`CurrentHackLv:     ${cHackLv}`)
        ns.print(`ResetTime:         ${resetTime / 1000}s`)
        if (resetTime == 0 || cHackLv - hackLv > 50) {
            ns.tprint('start.js starting new reset.js')
            hackLv = cHackLv
            resetTime = 1000 * 60 * 60
            ns.run('reset.js')
            while (ns.isRunning('reset.js', 'home')) {
                await ns.asleep(500)
            }
            await ns.asleep(1000 * 60 * 10)
        }
        resetTime -= 1000
        await ns.sleep(1000)
    }
    ns.tprint('HackLevel reach 3000, script exit')
}