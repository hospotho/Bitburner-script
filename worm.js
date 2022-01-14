/** @param {NS} ns **/
export async function main(ns) {
    var queue = ['home'];
    var visited = [];
    var rooted = []

    while (queue.length) {
        var now = queue.shift()
        if (!visited.includes(now)) {
            visited.push(now)
        }
        for (const server of ns.scan(now)) {
            if (!visited.includes(server)) {
                queue.push(server)
            }
        }
    }

    var toollist = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe']
    var toolCount = 0;
    for (const tool of toollist) {
        if (ns.fileExists(tool, 'home')) {
            toolCount++;
        }
    }

    function attack(server) {
        if (!ns.hasRootAccess(server)) {
            if (ns.getServerNumPortsRequired(server) <= toolCount) {
                ns.toast("nuking " + server);
                try {
                    ns.brutessh(server);
                    ns.ftpcrack(server);
                    ns.relaysmtp(server);
                    ns.httpworm(server);
                    ns.sqlinject(server);
                } catch (e) {}
                ns.nuke(server);
            }
        }
        if (ns.hasRootAccess(server)) {
            rooted.push(server);
        }
    }

    visited.splice(visited.indexOf('home'), 1);
    for (const server of visited) {
        attack(server);
    }

    ns.write('rooted.txt', rooted, 'w');
}