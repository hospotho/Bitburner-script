/** @param {NS} ns **/
export async function main(ns) {
    var ram = 16
    var i = 0

    while (i < ns.getPurchasedServerLimit()) {
        var name = ns.purchaseServer("pserv-" + i, ram)
        if (name != '') {
            i++
        }
        await ns.asleep(1000)
    }
}