/** @param {NS} ns **/
export async function main(ns) {
    if (ns.args.length < 1) {
        ns.tprint('Need a target')
        return
    }
    var target = ns.args[0]
    var mode = ns.args[1] ? ns.args[1] : 'view'
    await ns.write(target + '.txt', '', 'w')
    ns.rm(target + '.txt', 'home')

    if (ns.getHackingLevel() / 1.5 < ns.getServerRequiredHackingLevel(target)) {
        if (mode === 'view') {
            ns.tprintf('\n')
            ns.tprintf(`WARNING HackLv:   ${ns.getHackingLevel()}   Require:   ${ns.getServerRequiredHackingLevel(target)}`)
            ns.tprintf(`WARNING HackLv too low`)
        }
        return
    }

    var s = ns.getServer(target)
    var p = ns.getPlayer()
    var error = 0;
    var minSecLv = ns.getServerMinSecurityLevel(target)
    var secLv = s.hackDifficulty
    var reqHLv = s.requiredHackingSkill
    if (secLv > minSecLv) {
        error = secLv - minSecLv
        if (mode === 'view') {
            ns.tprintf('\n')
            ns.tprintf(`WARNING SecLvDiff:  ${secLv - minSecLv}`)
            ns.tprintf('WARNING SecLvDiff exist, the result may not be accuray')
        }
    }
    if (mode === 'view') {
        ns.tprintf(`\ngetMax.js Target: ${target}`)
    }

    var core = ns.getServer('home').cpuCores
    var maxMoney = s.moneyMax
    if (!maxMoney) {
        if (mode === 'view') {
            ns.tprintf('Not a farmable server')
        }
        return
    }

    function calcuHackePercent(secLv, reqHLv, player) {
        const balanceFactor = 240;
        const difficultyMult = (100 - secLv) / 100;
        const skillMult = (player.hacking - (reqHLv - 1)) / player.hacking;
        const percentMoneyHacked = (difficultyMult * skillMult * player.hacking_money_mult /* ns.getBitNodeMultipliers().ScriptHackMoney*/ ) / balanceFactor;
        if (percentMoneyHacked < 0) {
            return 0;
        }
        if (percentMoneyHacked > 1) {
            return 1;
        }
        return percentMoneyHacked;
    }

    var secRate = ns.hackAnalyzeChance(target)
    var hTime = ns.getHackTime(target) / 1000

    var bestHT_PerTS = 0
    var bestHT_Per1k = 0
    var bestHT_Per97 = 0
    var bestHT_CorePerTS = 0
    var bestHT_CorePer1k = 0
    var bestHT_CorePer97 = 0
    var bestIncome_PerTS = 0
    var bestIncome_Per1k = 0
    var bestIncome_Per97 = 0
    var bestIncome_CorePerTS = 0
    var bestIncome_CorePer1k = 0
    var bestIncome_CorePer97 = 0

    function calcData(ht) {
        var tempSecLv = minSecLv
        var firstMoney = maxMoney - maxMoney * Math.min(calcuHackePercent(tempSecLv, reqHLv, p) * ht, 1)
        tempSecLv += ht * 0.002
        var secondMoney = firstMoney - maxMoney * Math.min(calcuHackePercent(tempSecLv, reqHLv, p) * ht, 1)
        tempSecLv += ht * 0.002
        var thirdMoney = secondMoney - maxMoney * Math.min(calcuHackePercent(tempSecLv, reqHLv, p) * ht, 1)
        var income = (maxMoney - thirdMoney) * secRate

        var neededGT = Math.ceil(ns.growthAnalyze(target, maxMoney / Math.max(thirdMoney, 1)))
        var neededWT = Math.ceil((ht * 0.002 + neededGT * 0.004) / 0.05)
        var incomePerTS = income / (ht + neededGT + neededWT) / (hTime * 4)

        var neededCoreGT = Math.ceil(ns.growthAnalyze(target, maxMoney / Math.max(thirdMoney, 1), core))
        var neededCoreWT = Math.ceil((ht * 0.002 + neededGT * 0.004) / ns.weakenAnalyze(1, core))
        var incomeCorePerTs = income / (ht + neededCoreGT + neededCoreWT) / (hTime * 4)

        return [income, neededGT, neededWT, incomePerTS, neededCoreGT, neededCoreWT, incomeCorePerTs]
    }

    for (var hT = 1; hT < 50000; hT++) {
        var [income, neededGT, neededWT, incomePerTS, neededCoreGT, neededCoreWT, incomeCorePerTs] = calcData(hT)
        if (incomePerTS >= bestIncome_PerTS) {
            bestHT_PerTS = hT
            bestIncome_PerTS = incomePerTS
        }
        if (bestIncome_Per1k == 0 && (hT + neededGT + neededWT) >= 1000) {
            bestHT_Per1k = hT
            bestIncome_Per1k = income
        }
        if (bestIncome_Per97 == 0 && (income / secRate / maxMoney) > 0.97) {
            bestHT_Per97 = hT
            bestIncome_Per97 = income
        }

        if (incomePerTS >= bestIncome_CorePerTS) {
            bestHT_CorePerTS = hT
            bestIncome_CorePerTS = incomeCorePerTs
        }
        if (bestIncome_CorePer1k == 0 && (hT + neededCoreGT + neededCoreWT) >= 1000) {
            bestHT_CorePer1k = hT
            bestIncome_CorePer1k = income
        }
        if (bestIncome_CorePer97 == 0 && (income / secRate / maxMoney) > 0.97) {
            bestHT_CorePer97 = hT
            bestIncome_CorePer97 = income
        }
    }

    var data_PerTS = calcData(bestHT_PerTS)
    var income_PerTS = data_PerTS[0]
    var neededGT_PerTS = data_PerTS[1]
    var neededWT_PerTS = data_PerTS[2]
    var incomePerTS_PerTS = data_PerTS[3]

    var data_Per1k = calcData(bestHT_Per1k)
    var income_Per1k = data_Per1k[0]
    var neededGT_Per1k = data_Per1k[1]
    var neededWT_Per1k = data_Per1k[2]
    var incomePerTS_Per1k = data_Per1k[3]

    var data_Per97 = calcData(bestHT_Per97)
    var income_Per97 = data_Per97[0]
    var neededGT_Per97 = data_Per97[1]
    var neededWT_Per97 = data_Per97[2]
    var incomePerTS_Per97 = data_Per97[3]
    /*----------------------------------------------------------------*/
    var data_CorePerTS = calcData(bestHT_CorePerTS)
    var income_CorePerTS = data_CorePerTS[0]
    var neededGT_CorePerTS = data_CorePerTS[4]
    var neededWT_CorePerTS = data_CorePerTS[5]
    var incomePerTS_CorePerTS = data_CorePerTS[6]

    var data_CorePer1k = calcData(bestHT_CorePer1k)
    var income_CorePer1k = data_CorePer1k[0]
    var neededGT_CorePer1k = data_CorePer1k[4]
    var neededWT_CorePer1k = data_CorePer1k[5]
    var incomePerTS_CorePer1k = data_CorePer1k[6]

    var data_CorePer97 = calcData(bestHT_CorePer97)
    var income_CorePer97 = data_CorePer97[0]
    var neededGT_CorePer97 = data_CorePer97[4]
    var neededWT_CorePer97 = data_CorePer97[5]
    var incomePerTS_CorePer97 = data_CorePer97[6]
    /*----------------------------------------------------------------*/
    function fill(str, space = 10) {
        var temp = str.toString()
        var needed_space = space - temp.length
        while (needed_space > 0) {
            temp += ' '
            needed_space--
        }
        return temp
    }

    function unit(income) {
        var temp = parseInt(income)
        const list = ['', 'K', 'M', 'G', 'T', 'P']
        var count = 0
        while ((temp / 1000) > 1) {
            temp = temp / 1000
            count++
        }
        return fill(temp.toPrecision(5) + list[count])
    }

    if (mode === 'view') {
        ns.tprintf('CorePerTS                     CorePer1k                     CorePer97')
        ns.tprintf(`best maxT:       ${fill(bestHT_CorePerTS + neededGT_CorePerTS + neededWT_CorePerTS)}   best maxT:       ${fill(bestHT_CorePer1k + neededGT_CorePer1k + neededWT_CorePer1k)}   best maxT:       ${fill(bestHT_CorePer97 + neededGT_CorePer97 + neededWT_CorePer97)}`)
        ns.tprintf(`best maxhT:      ${fill(bestHT_CorePerTS)}   best maxhT:      ${fill(bestHT_CorePer1k)}   best maxhT:      ${fill(bestHT_CorePer97)}`)
        ns.tprintf(`best maxgT:      ${fill(neededGT_CorePerTS)}   best maxgT:      ${fill(neededGT_CorePer1k)}   best maxgT:      ${fill(neededGT_CorePer97)}`)
        ns.tprintf(`best maxwT:      ${fill(neededWT_CorePerTS)}   best maxwT:      ${fill(neededWT_CorePer1k)}   best maxwT:      ${fill(neededWT_CorePer97)}`)
        ns.tprintf(`best income:     ${unit(income_CorePerTS)}   best income:     ${unit(income_CorePer1k)}   best income:     ${unit(income_CorePer97)}`)
        ns.tprintf(`score:           ${fill(incomePerTS_CorePerTS.toFixed(2))}   score:           ${fill(incomePerTS_CorePer1k.toFixed(2))}   score:           ${fill(incomePerTS_CorePer97.toFixed(2))}`)
        ns.tprintf('\n')
        ns.tprintf('PerTS                         Per1k                         Per97')
        ns.tprintf(`best maxT:       ${fill(bestHT_PerTS + neededGT_PerTS + neededWT_PerTS)}   best maxT:       ${fill(bestHT_Per1k + neededGT_Per1k + neededWT_Per1k)}   best maxT:       ${fill(bestHT_Per97 + neededGT_Per97 + neededWT_Per97)}`)
        ns.tprintf(`best maxhT:      ${fill(bestHT_PerTS)}   best maxhT:      ${fill(bestHT_Per1k)}   best maxhT:      ${fill(bestHT_Per97)}`)
        ns.tprintf(`best maxgT:      ${fill(neededGT_PerTS)}   best maxgT:      ${fill(neededGT_Per1k)}   best maxgT:      ${fill(neededGT_Per97)}`)
        ns.tprintf(`best maxwT:      ${fill(neededWT_PerTS)}   best maxwT:      ${fill(neededWT_Per1k)}   best maxwT:      ${fill(neededWT_Per97)}`)
        ns.tprintf(`best income:     ${unit(income_PerTS)}   best income:     ${unit(income_Per1k)}   best income:     ${unit(income_Per97)}`)
        ns.tprintf(`score:           ${fill(incomePerTS_PerTS.toFixed(2))}   score:           ${fill(incomePerTS_Per1k.toFixed(2))}   score:           ${fill(incomePerTS_Per97.toFixed(2))}`)
        ns.tprintf('\n')
    }

    //0-4   CorePerTS   5-9   CorePer1k   10-14 CorePer97
    //15-19 PerTS       20-24 Per1k       25-29 Per97       30 error
    var data = []
    data.push(bestHT_CorePerTS, neededGT_CorePerTS, neededWT_CorePerTS, income_CorePerTS, incomePerTS_CorePerTS)
    data.push(bestHT_CorePer1k, neededGT_CorePer1k, neededWT_CorePer1k, income_CorePer1k, incomePerTS_CorePer1k)
    data.push(bestHT_CorePer97, neededGT_CorePer97, neededWT_CorePer97, income_CorePer97, incomePerTS_CorePer97)
    data.push(bestHT_PerTS, neededGT_PerTS, neededWT_PerTS, income_PerTS, incomePerTS_PerTS)
    data.push(bestHT_Per1k, neededGT_Per1k, neededWT_Per1k, income_Per1k, incomePerTS_Per1k)
    data.push(bestHT_Per97, neededGT_Per97, neededWT_Per97, income_Per97, incomePerTS_Per97)
    data.push(error)

    await ns.write(target + '.txt', data, 'w')
}