/** @param {NS} ns **/
export async function main(ns) {
    if (!ns.fileExists('best.txt', 'home')) {
        ns.tprint('Run best.js analyze target first')
        return
    }

    function fill(str, space = 10) {
        var temp = str.toString()
        var needed_space = space - temp.length
        while (needed_space-- > 0) {
            temp += ' '
        }
        return temp
    }

    async function manage(target, type, _neededHT, _neededGT, _neededWT) {
        var neededHT = _neededHT
        var neededGT = _neededGT
        var neededWT = _neededWT
        if (type === 'Core') {
            var totalNeededRam = neededHT * 1.7 + neededGT * 1.75 + neededWT * 1.75
            var availableRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home') - 10
            if (totalNeededRam > availableRam) {
                var mult = availableRam / availableRam
                neededHT = Math.floor(neededHT * mult)
                neededGT = Math.floor(neededGT * mult)
                neededWT = Math.ceil(neededWT * mult)
                totalNeededRam = neededHT * 1.7 + neededGT * 1.75 + neededWT * 1.75
                if (neededHT == 0 || neededGT == 0 || neededWT == 0) {
                    return
                }
                ns.tprintf(`Target:           ${fill(target, 20)}${type}`)
                ns.tprintf(`Remained Ram:     ${fill(availableRam.toFixed(2) + 'GB', 15)}Cast down needed ram to remained ram`)
                ns.tprintf(`HT:   ${neededHT}   GT:   ${neededGT}   WT:   ${neededWT}`)
            } else {
                ns.tprintf(`Target:           ${fill(target, 20)}${type}`)
                ns.tprintf(`Remained Ram:     ${fill(availableRam.toFixed(2) + 'GB', 15)}Needed Ram:       ${totalNeededRam.toFixed(2) + 'GB'}`)
                ns.tprintf(`HT:   ${neededHT}   GT:   ${neededGT}   WT:   ${neededWT}`)
            }
            ns.tprintf('\n')
            while (true) {
                var sleepTime = ns.getHackTime(target)
                ns.exec('h.js', 'home', neededHT, target, type)
                ns.exec('g.js', 'home', neededGT, target, sleepTime * 0.75, type)
                ns.exec('w.js', 'home', neededWT, target, type)
                await ns.asleep(sleepTime * 4 + 1000)
            }
        } else {
            var totalNeededT = neededHT + neededGT + neededWT
            var availableT = 0
            var servers = ns.read('rooted.txt').split(',')
            for (const server of servers) {
                availableT += Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75)
            }
            if (totalNeededT > availableT) {
                var mult = availableT / totalNeededT
                totalNeededT = availableT
                neededHT = Math.floor(neededHT * mult)
                neededGT = Math.floor(neededGT * mult)
                neededWT = Math.ceil(neededWT * mult)
                if (neededHT == 0 || neededGT == 0 || neededWT == 0) {
                    return
                }
                ns.tprintf(`Target:         ${fill(target, 20)}${type}`)
                ns.tprintf(`Remained T:     ${fill(availableT + 'T', 15)}Cast down needed T to remained T`)
                ns.tprintf(`HT:   ${neededHT}   GT:   ${neededGT}   WT:   ${neededWT}`)
            } else {
                ns.tprintf(`Target:         ${fill(target, 20)}${type}`)
                ns.tprintf(`Remained T:     ${fill(availableT + 'T', 15)}needed T:       ${totalNeededT}T`)
                ns.tprintf(`HT:   ${neededHT}   GT:   ${neededGT}   WT:   ${neededWT}`)
            }
            ns.tprintf('\n')
            while (true) {
                var sleepTime = ns.getHackTime(target)
                var tempNeededHT = neededHT
                var tempNeededGT = neededGT
                var tempNeededWT = neededWT
                for (const server of servers) {
                    var serverT = 0
                    serverT = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.7)
                    if (tempNeededHT > 0 && serverT > 0) {
                        ns.exec('h.js', server, Math.min(tempNeededHT, serverT), target, type)
                        tempNeededHT -= Math.min(tempNeededHT, serverT)
                    }
                    serverT = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75)
                    if (tempNeededGT > 0 && serverT > 0) {
                        ns.exec('g.js', server, Math.min(tempNeededGT, serverT), target, sleepTime * 0.75, type)
                        tempNeededGT -= Math.min(tempNeededGT, serverT)
                    }
                    serverT = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75)
                    if (tempNeededWT > 0 && serverT > 0) {
                        ns.exec('w.js', server, Math.min(tempNeededWT, serverT), target, type)
                        tempNeededWT -= Math.min(tempNeededWT, serverT)
                    }
                }
                await ns.asleep(sleepTime * 4 + 1000)
            }
        }
    }

    /*-------------------------------------------------*/
    var best = ns.read('best.txt').slice(0, -1).split(',')
    var tempCoreTarget = []
    var tempCoreNeededHT = []
    var tempCoreNeededGT = []
    var tempCoreNeededWT = []
    var tempServerTarget = []
    var tempServerNeededHT = []
    var tempServerNeededGT = []
    var tempServerNeededWT = []
    for (let i = 0; i < best.length; i += 8) {
        if (best[i + 1].startsWith('Core')) {
            tempCoreTarget.push(best[i])
            tempCoreNeededHT.push(parseInt(best[i + 2]))
            tempCoreNeededGT.push(parseInt(best[i + 3]))
            tempCoreNeededWT.push(parseInt(best[i + 4]))
        } else {
            tempServerTarget.push(best[i])
            tempServerNeededHT.push(parseInt(best[i + 2]))
            tempServerNeededGT.push(parseInt(best[i + 3]))
            tempServerNeededWT.push(parseInt(best[i + 4]))
        }
    }

    var homeRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home') - 10
    if (ns.args[0] === 'test') {
        homeRam = ns.getServerMaxRam('home') - 30
    }
    var coreTarget = []
    var coreNeededHT = []
    var coreNeededGT = []
    var coreNeededWT = []
    var maxIndex = 0

    function calcUsedCoreRam() {
        var usedRam = 0
        for (let i = 0; i < coreTarget.length; i++) {
            usedRam += coreNeededHT[i] * 1.7 + coreNeededGT[i] * 1.75 + coreNeededWT[i] * 1.75
        }
        return usedRam
    }
    for (let i = 0; i < tempCoreTarget.length; i++) {
        if (homeRam - calcUsedCoreRam() > 0) {
            var tempIndex = tempCoreTarget.indexOf(tempCoreTarget[i])
            if (tempIndex == i) {
                coreTarget.push(tempCoreTarget[i])
                coreNeededHT.push(tempCoreNeededHT[i])
                coreNeededGT.push(tempCoreNeededGT[i])
                coreNeededWT.push(tempCoreNeededWT[i])
            } else {
                var coreIndex = coreTarget.indexOf(tempCoreTarget[i])
                var data = ns.read(coreTarget[coreIndex] + '.txt').split(',')
                coreNeededHT[coreIndex] = Math.min(coreNeededHT[coreIndex] + tempCoreNeededHT[i], parseInt(data[10]))
                coreNeededGT[coreIndex] = Math.min(coreNeededGT[coreIndex] + tempCoreNeededGT[i], parseInt(data[11]))
                coreNeededWT[coreIndex] = Math.min(coreNeededWT[coreIndex] + tempCoreNeededWT[i], parseInt(data[12]))
            }
            maxIndex++
        }
    }

    ns.tprint(`CoreMaxIndex:     ${maxIndex}`)

    /*-------------------------------------------------*/
    var servers = ns.read('rooted.txt').split(',')
    for (const server of servers) {
        await ns.scp('h.js', 'home', server)
        await ns.scp('g.js', 'home', server)
        await ns.scp('w.js', 'home', server)
    }

    var serversT = 0
    var servers = ns.read('rooted.txt').split(',')
    for (const server of servers) {
        serversT += Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75)
    }
    if (ns.args[0] === 'test') {
        serversT = 0
        for (const server of servers) {
            serversT += Math.floor(ns.getServerMaxRam(server) / 1.75)
        }
    }
    var serverTarget = []
    var serverNeededHT = []
    var serverNeededGT = []
    var serverNeededWT = []

    function calcUsedServerT() {
        var usedT = 0
        for (let i = 0; i < serverTarget.length; i++) {
            usedT += serverNeededHT[i] + serverNeededGT[i] + serverNeededWT[i]
        }
        return usedT
    }
    for (let i = maxIndex - 1; i < tempServerTarget.length; i++) {
        if (serversT - calcUsedServerT() > 0) {
            var coreIndex = coreTarget.indexOf(tempServerTarget[i])
            var serverIndex = serverTarget.indexOf(tempServerTarget[i])
            var data = ns.read(coreTarget[coreIndex] + '.txt').slice(0, -1).split(',')
            if (coreIndex == -1 && serverIndex == -1) {
                serverTarget.push(tempServerTarget[i])
                serverNeededHT.push(tempServerNeededHT[i])
                serverNeededGT.push(tempServerNeededGT[i])
                serverNeededWT.push(tempServerNeededWT[i])
            } else if (coreIndex != -1 && serverIndex == -1) {
                serverTarget.push(tempServerTarget[i])
                serverNeededHT.push(Math.min(parseInt(data[10]) - coreNeededHT[coreIndex], tempServerNeededHT[i]))
                serverNeededGT.push(Math.min(parseInt(data[11]) - coreNeededGT[coreIndex], tempServerNeededGT[i]))
                serverNeededWT.push(Math.min(parseInt(data[12]) - coreNeededWT[coreIndex], tempServerNeededWT[i]))
            } else if (coreIndex != -1 && serverIndex != -1) {
                serverNeededHT[serverIndex] = Math.min(parseInt(data[10]) - coreNeededHT[coreIndex], serverNeededHT[serverIndex] + tempServerNeededHT[i])
                serverNeededGT[serverIndex] = Math.min(parseInt(data[11]) - coreNeededGT[coreIndex], serverNeededGT[serverIndex] + tempServerNeededGT[i])
                serverNeededWT[serverIndex] = Math.min(parseInt(data[12]) - coreNeededWT[coreIndex], serverNeededWT[serverIndex] + tempServerNeededWT[i])
            } else if (coreIndex == -1 && serverIndex != -1) {
                serverNeededHT[serverIndex] = Math.min(parseInt(data[25]), serverNeededHT[serverIndex] + tempServerNeededHT[i])
                serverNeededGT[serverIndex] = Math.min(parseInt(data[26]), serverNeededGT[serverIndex] + tempServerNeededGT[i])
                serverNeededWT[serverIndex] = Math.min(parseInt(data[27]), serverNeededWT[serverIndex] + tempServerNeededWT[i])
            }
            if (maxIndex < tempServerTarget.length) {
                maxIndex++
            }
        }
    }
    ns.tprint(`ServerMaxIndex:   ${maxIndex}`)

    /*-------------------------------------------------*/
    if (ns.args[0] != 'test') {
        var jobs = []
        for (let i = 0; i < coreTarget.length; i++) {
            jobs.push(manage(coreTarget[i], 'Core', coreNeededHT[i], coreNeededGT[i], coreNeededWT[i]))
            await ns.asleep(100)
        }
        for (let i = 0; i < serverTarget.length; i++) {
            if (serverNeededHT[i] + serverNeededGT[i] + serverNeededWT[i] > 0) {
                jobs.push(manage(serverTarget[i], 'Server', serverNeededHT[i], serverNeededGT[i], serverNeededWT[i]))
                await ns.asleep(100)
            }
        }
        while (true) {
            await Promise.all(jobs)
            await ns.asleep(1000)
        }
    }
}