/** @param {NS} ns **/
export async function main(ns) {
    var target = ns.args[0]
    await ns.weaken(target)
    if (ns.args[1] === 'log') {
        ns.tprint('complete')
    }
}