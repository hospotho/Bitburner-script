import {
	growPercent
} from 'formula.js'
/** @param {NS} ns **/
export async function main(ns) {
	const rooted = ns.read('rooted.txt').split(',')
	const player = ns.getPlayer()
	const h = ns.getServer('home')
	const core = h.cpuCores
	const gwRam = 1.75

	var getHomeT = () => Math.floor((ns.getServer('home').maxRam - ns.getServer('home').ramUsed - 20) / gwRam)

	var getServerT = () => {
		var maxServerT = 0
		for (const server of rooted) {
			maxServerT += Math.floor((ns.getServer(server).maxRam - ns.getServer(server).ramUsed) / gwRam)
		}
		return maxServerT
	}

	async function toMax(_target) {
		var s = ns.getServer(_target)
		const perCoreW = ns.weakenAnalyze(1, core)
		const perServerW = ns.weakenAnalyze(1)

		const diff = s.hackDifficulty - s.minDifficulty
		const coreMaxW = perCoreW * getHomeT()
		const serverMaxW = perServerW * getServerT()
		const maxW = coreMaxW + serverMaxW
		const remainDiff = diff % maxW

		var initWCount = Math.floor(diff / maxW)
		const initWCoreExtra_flag = Math.ceil(remainDiff / coreMaxW)
		const initWServerExtra_flag = Math.ceil(Math.max((remainDiff - coreMaxW), 0) / serverMaxW)

		if (initWCount + initWCoreExtra_flag | initWServerExtra_flag) {
			await ns.asleep(1000)
			ns.tprint(`Reducing ${_target} SecLV, ${initWCount + initWCoreExtra_flag | initWServerExtra_flag} round needed`)
		}

		while (initWCount--) {
			ns.exec('w.js', 'home', maxHomeT, _target, 'weak')
			for (const server of rooted) {
				let s = ns.getServer(server)
				let maxT = Math.floor((s.maxRam - s.ramUsed) / gwRam)
				if (maxT) {
					ns.exec('w.js', server, maxT, _target, 'weak')
				}
			}
			if (diff > 2) {
				await ns.asleep(ns.getWeakenTime(_target) + 1000)
			} else(
				await ns.asleep(1000)
			)
		}
		if (initWCoreExtra_flag) {
			let neededT = Math.ceil(remainDiff / perCoreW)
			ns.exec('w.js', 'home', neededT, _target, 'weak')
		}
		if (initWServerExtra_flag) {
			let neededT = Math.ceil((remainDiff - coreMaxW) / perCoreW)
			for (const server of rooted) {
				if (neededT > 0) {
					let s = ns.getServer(server)
					let maxT = Math.floor((s.maxRam - s.ramUsed) / gwRam)
					if (maxT) {
						ns.exec('w.js', server, Math.min(maxT, neededT), _target, 'weak')
						neededT -= maxT
					}
				}
			}
		}
		if (initWCoreExtra_flag || initWServerExtra_flag) {
			if (s.hackDifficulty - s.minDifficulty > 2) {
				await ns.asleep(ns.getWeakenTime(_target) + 1000)
			} else {
				await ns.asleep(1000)
			}
		}

		/*------------------------------------------------------------------------------------------------*/
		var needCoreG = () => Math.ceil(ns.growthAnalyze(_target, s.moneyMax / Math.max(s.moneyAvailable, 1), core))
		var needCoreW = () => Math.ceil((needCoreG() * 0.004) / (ns.weakenAnalyze(1, core)))
		var coreGWRatio = 1 + ns.weakenAnalyze(1, core) / 0.004
		if (needCoreG() + needCoreW()) {
			ns.tprint(`Growing money on ${_target}`)
		} else {
			return
		}
		while (needCoreG() + needCoreW() > getHomeT()) {
			var sleepTime = ns.getHackTime(_target)
			var homeGT = Math.floor(Math.min(getHomeT(), needCoreG()) / coreGWRatio * (coreGWRatio - 1))
			var homeWT = Math.max(Math.ceil(Math.min(getHomeT() / coreGWRatio, needCoreW())), Math.min(getHomeT() - homeGT, needCoreW()))
			if (homeGT) {
				ns.exec('g.js', 'home', homeGT, _target, sleepTime * 0.75, 'grow')
			}
			if (homeWT) {
				ns.exec('w.js', 'home', homeWT, _target, 'grow')
			}
			var needServerG = Math.ceil(ns.growthAnalyze(_target, ns.s.moneyMax / Math.max((s.moneyAvailable, 1) * growPercent(player, s, Math.min(homeGT, needCoreG()), core))) * 1.05)
			var serverGT = needServerG > Math.floor(getServerT() / 27 * 25) ? Math.floor(getServerT() / 27 * 25) : needServerG
			var serverWT = needServerG > Math.floor(getServerT() / 27 * 25) ? Math.ceil(getServerT() / 27 * 2) : needServerT
			for (const server of rooted) {
				if ((serverGT + serverWT) > 0) {
					let s = ns.getServer(server)
					let maxT = Math.floor((s.maxRam - s.ramUsed) / gwRam)
					if (serverGT && maxT) {
						if (serverGT >= maxT) {
							ns.exec('g.js', server, maxT, _target, 'grow')
							serverGT -= maxT
							maxT = 0
						} else {
							ns.exec('g.js', server, serverGT, _target, 'grow')
							serverGT = 0
							maxT -= serverGT
						}
					}
					if (serverWT && maxT) {
						if (serverWT >= maxT) {
							ns.exec('w.js', server, maxT, _target, 'grow')
							serverWT -= maxT
							maxT = 0
						} else {
							ns.exec('w.js', server, serverWT, _target, 'grow')
							serverWT = 0
							maxT -= serverWT
						}
					}
				}
			}
			await ns.asleep(sleepTime * 4 + 1000)
		}
		if (needCoreG() + needCoreW()) {
			var sleepTime = ns.getHackTime(_target)
			ns.exec('g.js', 'home', needCoreG(), _target, sleepTime * 0.75, 'grow')
			ns.exec('w.js', 'home', needCoreW(), _target, 'grow')
			await ns.asleep(sleepTime * 4 + 1000)
		}

		ns.tprint(`${_target} init complete`)
		ns.run('getMax.js', 1, _target, ns.args[1] === 'reset' ? 'reset' : 'view')
		return 0
	}
	/*------------------------------------------------------------------------------------------------*/

	if (ns.args[0] != 'best') {
		try {
			ns.getServer(ns.args[0])
		} catch (e) {
			return ns.tprint('No such server')
		}
		await toMax(ns.args[0])
		return
	}

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

	var homeRam = h.maxRam - h.ramUsed - 20
	var coreTarget = []
	var coreNeededHT = []
	var coreNeededGT = []
	var coreNeededWT = []
	var maxIndex = 0
	for (let i = 0; i < tempCoreTarget.length; i++) {
		if (homeRam > 0) {
			homeRam = homeRam - tempCoreNeededHT[i] * 1.7 - tempCoreNeededGT[i] * 1.75 - tempCoreNeededWT[i] * 1.75
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
	var serversT = 0
	for (const server of rooted) {
		serversT += Math.floor((ns.getServer(server).maxRam - ns.getServer(server).ramUsed) / 1.75)
	}
	var serverTarget = []
	var serverNeededHT = []
	var serverNeededGT = []
	var serverNeededWT = []
	for (let i = maxIndex; i < tempServerTarget.length; i++) {
		if (serversT > 0) {
			serversT = serversT - tempServerNeededHT[i] - tempServerNeededGT[i] - tempServerNeededWT[i]
			var serverIndex = serverTarget.indexOf(tempServerTarget[i])
			if (serverIndex == -1) {
				serverTarget.push(tempServerTarget[i])
				serverNeededHT.push(tempServerNeededHT[i])
				serverNeededGT.push(tempServerNeededGT[i])
				serverNeededWT.push(tempServerNeededWT[i])
			} else {
				var coreIndex = coreTarget.indexOf(tempServerTarget[i])
				var data = ns.read(coreTarget[coreIndex] + '.txt').slice(0, -1).split(',')
				serverNeededHT[serverIndex] = Math.min(parseInt(data[10]) - coreNeededHT[coreIndex], serverNeededHT[serverIndex] + tempServerNeededHT[i])
				serverNeededGT[serverIndex] = Math.min(parseInt(data[11]) - coreNeededGT[coreIndex], serverNeededGT[serverIndex] + tempServerNeededGT[i])
				serverNeededWT[serverIndex] = Math.min(parseInt(data[12]) - coreNeededWT[coreIndex], serverNeededWT[serverIndex] + tempServerNeededWT[i])
			}
		}
	}

	var target = []
	for (const server of coreTarget) {
		target.push(server)
	}
	for (const server of serverTarget) {
		if (!target.includes(server)) {
			target.push(server)
		}
	}

	ns.tprint(target)
	var jobs = []
	for (const server of target) {
		jobs.push(toMax(server))
	}
	await Promise.all(jobs)
	await ns.sleep(1000)
	ns.tprint('All init tasks complete')
	ns.exec('best.js', 'home', 1, 'reset')
}