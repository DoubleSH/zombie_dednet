const vector = require("../libs/vector.js");
let methods = require('../../modules/methods')
let SyncPed = require('./peds')
require('./peds')
var tickRate = 1000 / 5;
class PedManager {
    constructor() {
        this._pedPool = [];
        this._syncRange = 50;
        this._corpseTimeout = 60 * 1000;
        this.name = "PedManager"
        this.ticker = mp.events.add("server:Tick", () => {
            this.tick();
        });
    }
    tick() {
        this._pedPool.forEach(syncPed => {
            if (syncPed.deletable) return this.removePed(syncPed);
            let position = syncPed.position;
            let nearest_pos = 9999;
            let old_packagelost = 9999;
            let best_syncer = false;
            let nearby_players = [];
            mp.players.forEachInRange(position, this._syncRange, (player) => {
                if (methods.distanceToPos(position, player.position) < nearest_pos) {
                    if (player.packetLoss < old_packagelost) {
                        old_packagelost = player.packetLoss;
                        best_syncer = player;
                        nearest_pos = methods.distanceToPos(position, player.position)
                    }
                }
                nearby_players.push(player);
            });
            nearby_players = nearby_players.filter(e => e != best_syncer)
            if (best_syncer) {
                if (syncPed.controller != best_syncer) {
                    syncPed.setController(best_syncer.id);
                    //console.log("best syncer for", syncPed.id, "is", best_syncer.name);
                }
            } else {
                if (syncPed.controller) {
                    //console.log("clearing sync for", syncPed.id);
                    syncPed.clearController();
                }
            }
        })
    }
    find(id) {
        return this._pedPool.find(e => {
            return e.id == id;
        })
    }
    addPed(SyncPed) {
        //methods.debug("new sync ped", this.name);
        this._pedPool.push(SyncPed);
    }
    removePed(SyncPed) {
        let index = this._pedPool.findIndex(e => e == SyncPed)
        if (index > -1) {
            //methods.debug("delete ped");
            if (this._pedPool[index].ped) this._pedPool[index].ped.destroy();
            this._pedPool.splice(index, 1);
        }
    }
}
class ZombieManager extends PedManager {
    constructor() {
        super();
        this.name = "ZombieManager"
        this._syncRange = 150;
    }
}
module.exports = {
    pedmgr: new PedManager(),
    zombiemgr: new ZombieManager()
}