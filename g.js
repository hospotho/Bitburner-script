/** @param {NS} ns **/
export async function main(ns) {
    var target = ns.args[0]
    await ns.asleep(parseFloat(ns.args[1]) ? parseFloat(ns.args[1]) : 0)
    await ns.grow(target)
    if (ns.args[1] === 'log') {
        ns.tprint('complete')
    }
}