/** @param {NS} ns **/
export async function main(ns) {
    function fill(str, space = 10) {
        var temp = str.toString()
        var needed_space = space - temp.length
        while (needed_space > 0) {
            temp += ' '
            needed_space--
        }
        return temp
    }

    function printData(top, min) {
        ns.tprintf('\n')
        for (let i = 0; i < Math.min(min, top.length); i++) {
            var target = top[i]
            var s = ns.getServer(target)
            var moneyN = s.moneyAvailable
            var moneyM = s.moneyMax
            var moneyPer = moneyN / moneyM * 100
            var secLv = s.hackDifficulty
            var secNLv = ns.getServerMinSecurityLevel(target)

            ns.tprintf(`${fill((i + 1) + '.', 5)}    ${fill(target, 20)}Money%%:   ${fill(moneyPer.toFixed(5) + '%%', 15)}diff:   ${fill((secLv - secNLv).toFixed(5))}`);
        }
        ns.tprintf('\n')
    }

    var best = ns.read('best.txt').slice(0, -1).split(',')
    var displaySize = ns.args[0] === 'all' ? best.length / 8 : ns.args[0] === 'long' ? 30 : 15
    var top = []
    for (let i = 0; i < best.length; i += 8) {
        if (!top.includes(best[i])) {
            top.push(best[i])
        }
    }
    printData(top, displaySize)

}