/** @param {NS} ns **/
export async function main(ns) {
	var target = ns.args[0]
	try {
		ns.getServer(target)
	} catch (e) {
		return ns.tprint('No such server')
	}

	var s = ns.getServer(target)
	var core = ns.getServer('home').cpuCores

	var hTime = ns.getHackTime(target) / 1000
	var gTime = ns.getGrowTime(target) / 1000
	var wTime = ns.getWeakenTime(target) / 1000

	var moneyN = s.moneyAvailable
	var moneyM = s.moneyMax
	var moneyPer = moneyN / moneyM * 100
	var gr = s.serverGrowth

	var secLv = s.hackDifficulty
	var secNLv = s.minDifficulty
	var reqHLv = s.requiredHackingSkill

	var hChance = ns.hackAnalyzeChance(target) * 100
	var hPer = ns.hackAnalyze(target) * 100
	var gAC = ns.growthAnalyze(target, s.moneyMax / Math.max(moneyN, 1), core)
	var gA = ns.growthAnalyze(target, s.moneyMax / Math.max(moneyN, 1))
	var wAC = ns.weakenAnalyze(1, core)

	function fill(str, space = 10) {
		var temp = str.toString()
		var needed_space = space - temp.length
		while (needed_space > 0) {
			temp += ' '
			needed_space--
		}
		return temp
	}


	ns.tprintf('\n')
	ns.tprintf(`Target:         ${fill(target)}`);
	ns.tprintf(`HackTime:       ${fill(hTime.toPrecision(5) + 's')}    GrowthRate:     ${gr}`)
	ns.tprintf(`GrowTime:       ${fill(gTime.toPrecision(5) + 's')}    ReqHackLv:      ${reqHLv}`)
	ns.tprintf(`WeakenTime:     ${fill(wTime.toPrecision(5) + 's')}    MinSecLevel:    ${secNLv}`)
	ns.tprintf(`Money%%:         ${fill(moneyPer.toPrecision(5) + '%%', 11)}    SecLevel:       ${secLv.toFixed(6)}`)
	ns.tprintf('\n')
	ns.tprintf(`Heck%%:          ${fill(hPer.toPrecision(5) + '%%', 11)}    HackChance:     ${hChance.toPrecision(5)}%%`)
	ns.tprintf(`NeedGrow(c):    ${fill(gAC.toPrecision(5))}    NeedGrow:       ${gA.toPrecision(5)}`)
	ns.tprintf(`WeakEffect(c):  ${fill(wAC.toPrecision(5))}    WeakEffect:     0.05   `)
	ns.tprintf(`NeedWeak(c):    ${fill(((secLv - secNLv) / wAC).toPrecision(5))}    NeedWeak:       ${((secLv - secNLv) / 0.05).toPrecision(5)}`)
	ns.tprintf('\n')
}