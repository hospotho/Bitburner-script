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

	var getHomeT = () => Math.floor((ns.getServer('home').maxRam - ns.getServer('home').ramUsed - 10) / gwRam)

	var getServerT = () => {
		var maxServerT = 0
		var servers = ns.read('rooted.txt').split(',')
		for (const server of servers) {
			maxServerT += Math.floor((ns.getServer(server).maxRam - ns.getServer(server).ramUsed) / gwRam)
		}
		return maxServerT
	}

	async function weakServer(_target) {
		var s = ns.getServer(_target)
		var diff = s.hackDifficulty - s.minDifficulty
		var pass_flag = s.hackDifficulty / s.minDifficulty
		const perCoreW = ns.weakenAnalyze(1, core)
		const perServerW = ns.weakenAnalyze(1)

		if (diff > 0) {
			ns.tprint(`Reducing ${_target} SecLV`)
		}
		while (diff > 0) {
			var sleepTime = ns.getHackTime(_target)
			var homeWT = Math.min(Math.ceil(diff / perCoreW), getHomeT())
			ns.exec('w.js', 'home', homeWT, _target, 'weak')
			diff -= homeWT * perCoreW

			var serverWT = Math.min(Math.ceil(diff / perServerW), getServerT())
			for (const server of rooted) {
				let s = ns.getServer(server)
				let thisWT = Math.min(Math.floor((s.maxRam - s.ramUsed) / gwRam), serverWT)
				if (thisWT > 0) {
					ns.exec('w.js', server, thisWT, _target, 'weak')
					serverWT -= thisWT
					diff -= thisWT * perServerW
				}
			}
			if (pass_flag < 1.2 || diff === 0) {
				await ns.asleep(1000)
				break
			} else {
				await ns.asleep(sleepTime * 4 + 1000)
				pass_flag = (diff + s.minDifficulty) / s.minDifficulty
			}
		}
		return growServer(_target)
	}

	function growServer(_target) {
		var moneyPert = ns.getServer(_target).moneyMax / Math.max(ns.getServer(_target).moneyAvailable, 1)

		var needCoreG = () => Math.ceil(ns.growthAnalyze(_target, ns.getServer(_target).moneyMax / Math.max(ns.getServer(_target).moneyAvailable, 1), core))
		var needCoreW = () => Math.ceil((needCoreG() * 0.004) / (ns.weakenAnalyze(1, core)))
		var coreGWRatio = 1 + ns.weakenAnalyze(1, core) / 0.004
		var serverGWRatio = 1 + ns.weakenAnalyze(1) / 0.004

		if (moneyPert > 1) {
			ns.tprint(`Growing money on ${_target}`)
		}
		while (moneyPert < 1) {
			var sleepTime = ns.getHackTime(_target)

			var homeMaxGT = Math.floor(getHomeT() / coreGWRatio * (coreGWRatio - 1))
			var homeMaxWT = Math.ceil(getHomeT() / coreGWRatio)
			var homeGT = Math.min(homeMaxGT, needCoreG())
			var homeWT = Math.min(homeMaxWT, needCoreW())
			ns.exec('g.js', 'home', homeGT, _target, 'grow')
			ns.exec('w.js', 'home', homeWT, _target, 'grow')
			moneyPert *= growPercent(player, s, homeGT, core)
			if (moneyPert >= 1) {
				await ns.asleep(sleepTime * 4 + 1000)
				return 0
			}

			var serverMaxGT = Math.floor(getServerT() / serverGWRatio * (serverGWRatio - 1))
			var serverMaxWT = Math.ceil(getServerT() / serverGWRatio)
			var serverGT = serverMaxGT
			var serverWT = serverMaxWT

			var maxPert = moneyPert
			//test max grow on server
			for (const server of rooted) {
				var thisServer = ns.getServer(server)
				var thisMaxT = Math.floor((thisServer.maxRam - thisServer.ramUsed) / gwRam)
				if (serverGT > 0) {
					var thisGT = Math.min(thisMaxT, serverGT)
					thisMaxT -= thisGT
					serverGT -= thisGT
					maxPert *= growPercent(player, ns.getServer(_target), thisGT)
					if (maxPert >= 1) {
						serverGT = serverMaxGT - serverGT
						serverWT = Math.ceil(serverGT * 0.004 / (ns.weakenAnalyze(1)))
						break
					}
				}
				if (serverWT > 0) {
					var thisWT = Math.min(thisMaxT, serverWT)
					serverWT -= thisWT
				}
			}
			if (maxPert < 0) {
				serverGT = serverMaxGT
				serverWT = serverMaxWT
			}
			//run script here
			for (const server of rooted) {
				var thisServer = ns.getServer(server)
				var thisMaxT = Math.floor((thisServer.maxRam - thisServer.ramUsed) / gwRam)
				if (serverGT > 0) {
					var thisGT = Math.min(thisMaxT, serverGT)
					ns.exec('g.js', server, thisGT, _target, 'grow')
					thisMaxT -= thisGT
					serverGT -= thisGT
					moneyPert *= growPercent(player, ns.getServer(_target), thisGT)
				}
				if (serverWT > 0) {
					var thisWT = Math.min(thisMaxT, serverWT)
					ns.exec('w.js', server, thisWT, _target, 'grow')
					serverWT -= thisWT
				}
			}
			await ns.asleep(sleepTime * 4 + 1000)
		}
		return 0
	}
	/*------------------------------------------------------------------------------------------------*/

	if (ns.args[0] != 'best') {
		try {
			ns.getServer(ns.args[0])
		} catch (e) {
			return ns.tprint('No such server')
		}
		await weakServer(ns.args[0])
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
		jobs.push(weakServer(server))
		await ns.asleep(100)
	}
	await Promise.all(jobs)
	await ns.sleep(1000)
	ns.tprint('All init tasks complete')
	ns.exec('best.js', 'home', 1, 'reset')
}