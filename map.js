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

    function fillStart(str, space = 10) {
        var tempStr = '|__' + str.toString()
        var tempSpace = space
        while (tempSpace > 0) {
            tempStr = ' ' + tempStr
            tempSpace -= 1
        }
        return tempStr
    }

    function dfs(node, level) {
        if (!visited.includes(node)) {
            visited.push(node)
        }
        if (level) {
            buffer.push(`${fill(level, 5)}${fillStart(node, level * 3)}`)
        }
        for (const server of ns.scan(node)) {
            if (!visited.includes(server)) {
                visited.push(server)
                dfs(server, level + 1)
            }
        }
    }

    function replaceAt(str, index, replacement) {
        return str.substr(0, index) + replacement + str.substr(index + replacement.length);
    }

    var visited = ['home']
    var buffer = []

    ns.tprintf('\nDist    Hostname\n0       home')
    dfs('home', 0)
    for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < buffer[i].length; j++) {
            if (buffer[i][j] === '|') {
                for (let k = i - 1; k >= 0; k--) {
                    if (buffer[k][j] == ' ') {
                        buffer[k] = replaceAt(buffer[k], j, '|')
                    } else {
                        k = -1
                    }
                }
            }
        }
    }
    for (let i = 0; i < buffer.length; i++) {
        ns.tprintf(`${buffer[i]}`)
    }
}