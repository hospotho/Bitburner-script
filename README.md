## Bitburner scripts

Hacking scripts and debug tools.
To start hacking `run start.js`, other scripts will exec when they need to.

## Main scripts

Peek needed ram = 2.75(start.js) + 3.9(buyServer.js) + 5.2(reset.js) + 8.5(init.js) = 20.35GB

| Script       | Ram    | Dscription                                                                  |
| ------------ | ------ | --------------------------------------------------------------------------- |
| start.js     | 2.75GB | start buyServer.js and reset.js and restart reset.js when needed            |
| reset.js     | 5.2GB  | run worm.js, getMax.js, best.js and init.js to reset env then run master.js |
| worm.js      | 2.35GB | scan and nuke all server and output rooted server list to `rooted.txt`      |
| getMax.js    | 7.15GB | ouput hack data of  a server to `{server}.txt`                              |
| best.js      | 1.7GB  | ouput best hack list to `best.txt` using all `{server}.txt`                 |
| init.js      | 8.5GB  | init needed server using data in `best.txt`                                 |
| master.js    | 3.75GB | manage all hack using data in `best.txt`                                    |
| buyServer.js | 3.9GB  | buy server, change ram to lower the cost when mult is low                   |
| formula.js   | 0GB    | functions for calc                                                          |
| h.js         | 1.7GB  | for hack server                                                             |
| g.js         | 1.7GB  | for grow server                                                             |
| w.js         | 1.7GB  | for weaken server                                                           |

## Tool Scripts

Use them when to debug

| Script      | Ram    | Dscription                               |
| ----------- | ------ | ---------------------------------------- |
| test.js     | 7.75GB | print useful data of a server            |
| health.js   | 3.6GB  | print health of top server in `best.txt` |
| checkRam.js | 1.7GB  | print ram info of home and servers       |
| killall.js  | 3.1GB  | run killall at all server                |
