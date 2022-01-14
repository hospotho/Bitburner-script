/** @param {NS} ns **/
export async function main(ns) {
    var ram = 512;
    var i = 0;

    while (i < ns.getPurchasedServerLimit()) {
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            ns.purchaseServer("pserv-" + i, ram);
            i++;
        }
        await ns.asleep(500)
    }
}