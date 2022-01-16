## Bitburner scripts

Hacking scripts and debug tools.
To start hacking `run start.js`, other scripts will exec when they need to.

## Main scripts

Peek needed ram for start.js
= 2.75(start.js) + 3.9(buyServer.js) + 5.2(reset.js) + 8.5(init.js)
= 20.35GB

Minimum needed ram when master.js is up
= 2.75(start.js) + 3.75(master.js)
= 6.5GB

better run killall.js before start when some other script is running

| Script       | Ram    | Dscription                                                                  |
| ------------ | ------ | --------------------------------------------------------------------------- |
| start.js     | 2.75GB | start buyServer.js and reset.js and restart reset.js when needed            |
| reset.js     | 5.2GB  | run worm.js, getMax.js, best.js and init.js to reset env then run master.js |
| worm.js      | 2.35GB | scan and nuke all server and output rooted server list to `rooted.txt`      |
| getMax.js    | 7.15GB | ouput hack data of  a server to `{server}.txt`                              |
| best.js      | 1.7GB  | ouput best hack list to `best.txt` using all `{server}.txt`                 |
| init.js      | 8.5GB  | init needed server using data in `best.txt`, 10GB ram preserved for user    |
| master.js    | 3.75GB | manage all hack using data in `best.txt`, 10GB ram preserved for user       |
| buyServer.js | 3.9GB  | buy server, lower ram value in script when mult is low                      |
| formula.js   | 0GB    | functions for calc                                                          |
| h.js         | 1.7GB  | for hack server                                                             |
| g.js         | 1.7GB  | for grow server                                                             |
| w.js         | 1.7GB  | for weaken server                                                           |

## Tool Scripts

Use them when debugging

| Script      | Ram    | Dscription                               |
| ----------- | ------ | ---------------------------------------- |
| test.js     | 7.75GB | print useful data of a server            |
| health.js   | 3.6GB  | print health of top server in `best.txt` |
| checkRam.js | 1.7GB  | print ram info of home and servers       |
| killall.js  | 3.1GB  | run killall at all server                |
