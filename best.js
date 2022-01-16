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

    await ns.write('best.txt', '', 'w')

    var printF = ns.args[0] === 'reset' ? (str) => {} : ns.tprintf
    var displaySize = ns.args[0] === 'long' ? 30 : ns.args[0] === 'all' ? 100000 : 10
    var rooted = ns.read('rooted.txt').split(',')
    var data = []
    for (const server of rooted) {
        if (ns.fileExists(server + '.txt')) {
            var temp = ns.read(server + '.txt').split(',')
            if (temp.length === 30) {
                data.push([server, 'CorePerTS', temp[0], temp[1], temp[2], temp[3], temp[4], temp[30]])
                data.push([server, 'CorePer1k', temp[5], temp[6], temp[7], temp[8], temp[9], temp[30]])
                data.push([server, 'CorePer97', temp[10], temp[11], temp[12], temp[13], temp[14], temp[30]])
            }
        }
    }
    data.sort((a, b) => {
        return parseFloat(b[6]) - parseFloat(a[6])
    })

    printF('         PTS           Income         Error          Hostname              Type')
    for (let i = 0; i < Math.min(data.length, displaySize); i++) {
        printF(`${fill((i + 1) + '.', 5)}    ${unit(data[i][6])}    ${unit(data[i][5])}     ${fill(parseFloat(data[i][7]).toFixed(4))}     ${fill(data[i][0], 18)}    ${fill(data[i][1])}`)
    }
    for (let i = 0; i < data.length; i++) {
        await ns.write('best.txt', `${data[i]},`, 'a')
    }
    /*-------------------------------------*/
    data = []
    for (const server of rooted) {
        if (ns.fileExists(server + '.txt')) {
            var temp = ns.read(server + '.txt').split(',')
            if (temp.length === 30) {
                data.push([server, 'PerTS', temp[15], temp[16], temp[17], temp[18], temp[19], temp[30]])
                data.push([server, 'Per1k', temp[20], temp[21], temp[22], temp[23], temp[24], temp[30]])
                data.push([server, 'Per97', temp[25], temp[26], temp[27], temp[28], temp[29], temp[30]])
            }
        }
    }
    data.sort((a, b) => {
        return parseFloat(b[6]) - parseFloat(a[6])
    })

    printF('         PTS           Income         Error          Hostname              Type')
    for (let i = 0; i < Math.min(data.length, displaySize); i++) {
        printF(`${fill((i + 1) + '.', 5)}    ${unit(data[i][6])}    ${unit(data[i][5])}     ${fill(parseFloat(data[i][7]).toFixed(4))}     ${fill(data[i][0], 18)}    ${fill(data[i][1])}`)
    }
    for (let i = 0; i < data.length; i++) {
        await ns.write('best.txt', `${data[i]},`, 'a')
    }
}