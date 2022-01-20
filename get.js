const baseUrl = 'https://raw.githubusercontent.com/hospotho/Bitburner-script/main/'
const filesToDownload = [
 "best.js" ,
 "buyServer.js" ,
 "checkRam.js" ,
 "formula.js" ,
 "g.js" , 
 "getMax.js" ,
 "h.js" ,
 "health.js" ,
 "index.d.ts" ,
 "init.js" ,
 "killall.js" ,
 "map.js" ,
 "master.js" ,
 "reset.js" ,
 "start.js" ,
 "test.js" ,
 "w.js" ,
 "worm.js" ,
]

export async function main(ns) {
 for (let i = 0; i < filesToDownload.length; i++) {
    const filename = filesToDownload[i]
    const path = baseUrl + filename
    await ns.scriptKill(filename, 'home')
    await ns.rm(filename)
    await ns.sleep(100)
    await ns.wget(path, filename)
 }

 ns.spawn('start.js', 1)
}
