/** @param {NS} ns **/
export async function main(ns) {
    var servers = ns.read('rooted.txt').split(',')

    var maxT = 0
    var remainT = 0
    for (const server of servers) {
        maxT += Math.floor(ns.getServerMaxRam(server) / 1.75)
        remainT += Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75)
    }
    maxT += Math.floor((ns.getServerMaxRam('home') - 20) / 1.75)
    remainT += Math.floor((ns.getServerMaxRam('home') - ns.getServerUsedRam('home') - 20) / 1.75)
    ns.tprint('max T:        ', maxT, 'T')
    ns.tprint('remained T:   ', remainT, 'T')
    ns.tprint('homeremain:   ', ns.getServerMaxRam('home') - ns.getServerUsedRam('home'), 'GB')
}