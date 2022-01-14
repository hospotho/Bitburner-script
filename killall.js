/** @param {NS} ns **/
export async function main(ns) {
    var rooted = ns.read('rooted.txt').split(',')
    rooted.push('home')
    var script = ns.args.length ? ns.args[0] : null

    if (script === null) {
        for (const server of rooted) {
            ns.killall(server)
        }
        return
    } else {
        for (const server of rooted) {
            ns.scriptKill(script, server)
        }
    }
}