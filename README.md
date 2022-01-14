#Bitburner scripts

Hacking scripts and debug tools.
To start hacking `run start.js`, other scripts will exec when they need to.

##Main scripts

Peek needed ram = 21.1GB
= 2.75(start.js) + 4.25(buyServer.js) + 5.30(reset.js) + 8.8(init.js)

| Script       | Ram    | Dscription                                                                  |
| ------------ | ------ | --------------------------------------------------------------------------- |
| start.js     | 2.75GB | start buyServer.js and reset.js and restart reset.js when needed            |
| reset.js     | 5.3GB  | run worm.js, getMax.js, best.js and init.js to reset env then run master.js |
| worm.js      | 2.35GB | scan and nuke all server and output rooted server list to `rooted.txt`      |
| getMax.js    | 8.4GB  | ouput hack data of  a server to `{server}.txt`                              |
| best.js      | 1.7GB  | ouput best hack list to `best.txt` using all `{server}.txt`                 |
| init.js      | 8.8GB  | init needed server using data in `best.txt`                                 |
| master.js    | 3.75GB | manage all hack using data in `best.txt`                                    |
| buyServer.js | 4.25GB | buy server, change ram to lower the cost when mult is low                   |
| formula.js   | 0GB    | functions for calc                                                          |
| g.js         | 1.7GB  | for grow server                                                             |
| h.js         | 1.7GB  | for hack server                                                             |
| w.js         | 1.7GB  | for weaken server                                                           |

##Tool Scripts

Use them when needed to debug

| Script      | Ram    | Dscription                               |
| ----------- | ------ | ---------------------------------------- |
| test.js     | 7.85GB | print useful data of a server            |
| health.js   | 3.7GB  | print health of top server in `best.txt` |
| checkRam.js | 1.7GB  | print ram info of home and servers       |
| killall.js  | 3.1GB  | killall at all server                    |
