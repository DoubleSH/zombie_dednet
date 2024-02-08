const vector = require("../libs/vector.js");
const ZombieManager = require("./pedmanager.js").zombiemgr;
const PedManager = require("./pedmanager.js").pedmgr;
let methods = require('../../modules/methods')
let inventory = require('../../inventory')
require('../../modules/events')
//move_m@drunk@verydrunk
//let style = "move_heist_lester";
//let style = "move_ped_crouched"; // crouched
//let style = "move_m@drunk@verydrunk";
//var walkstyle_to_set = "move_m@generic";
let walkstyle = [
    "clipset@move@trash_fast_turn",
    "missfbi4prepp1_garbageman",
    "move_characters@franklin@fire",
    "move_characters@Jimmy@slow@",
    "move_characters@michael@fire",
    "move_f@flee@a",
    "move_f@scared",
    "move_heist_lester",
    "move_injured_generic",
    "move_m@bag",
    "move_m@brave",
    "move_m@casual@d",
    "MOVE_M@BAIL_BOND_NOT_TAZERED",
    "MOVE_M@BAIL_BOND_TAZERED",
    "move_m@fire",
    "move_m@gangster@var_e",
    "move_m@gangster@var_f",
    "move_m@gangster@var_i",
    "move_m@JOG@",
    "MOVE_P_M_ONE",
    "move_p_m_zero_janitor",
    "move_p_m_zero_slow",
    "MOVE_M@FEMME@",
    "MOVE_M@GANGSTER@NG",
    "MOVE_M@POSH@",
    "MOVE_M@TOUGH_GUY@"
];
let zombType = [
    "walker",
    "runner",
    "sprinter"
];
let zombSkin = [
    "s_m_y_airworker",
    "cs_ashley",
    "s_m_y_armymech_01",
    "g_m_y_ballaeast_01",
    "s_m_m_autoshop_02",
    "s_m_m_autoshop_01",
    "s_m_y_swat_01",
    "csb_prolsec",
    "s_m_y_prisoner_01",
    "s_m_y_prismuscl_01",
    "g_m_y_pologoon_02",
    "ig_old_man2",
    "cs_movpremmale",
    "g_m_y_mexgoon_03",
    "s_m_y_marine_03",
    "s_m_m_marine_01",
    "s_m_y_marine_01",
];
let spawnlistZombie = [
    [-106.58228302001953, 6253.78466796875, 30.333547592163086],
    [235.55178833007812, -844.1741333007812, 29.009389877319336],
    [216.51979064941406, -903.8058471679688, 29.6923770904541],
    [172.3970947265625, -952.7339477539062, 29.09192657470703],
    [151.76373291015625, -1020.7584228515625, 28.39542007446289],
    [42.90248489379883, -975.6321411132812, 28.40955924987793],
    [-38.11796569824219, -957.307861328125, 28.46989631652832],
    [-204.06874084472656, -885.6466064453125, 28.348384857177734],
    [-126.29729461669922, -741.609375, 33.549774169921875],
    [281.8093566894531, -936.6400146484375, 28.246355056762695],
    [228.08303833007812, -1077.11669921875, 28.2959041595459],
    
];
class SyncPed {
    constructor(model, position, dynamic = true, invincible = true) {
        this._ped = mp.peds.new(mp.joaat(model), position, {
            dynamic: dynamic,
            frozen: false,
            invincible: invincible
        });
        this.id = this._ped.id;
        this.controllerId = 0;
        this._type = "syncPed";
        this.canDelete = false;
        this._ped.setVariable("sync_id", this._ped.id);
        this._ped.setVariable("syncPed", true);
        this._ped.setVariable("DEAD", false);
        this.deathtime = 0;
        this.manager = PedManager;
        this._corpseTime = 15 * 60 * 1000;
    }
    get ped() {
        if (!mp.peds.at(this.id)) return false
        if (!this._ped) return false;
        return this._ped;
    }
    get deletable() {
        if (!mp.peds.at(this.id)) return false
        return this.ped.getVariable("DEAD") && (this.deathtime + this._corpseTime < Date.now());
    }
    kill() {
        this.deathtime = Date.now();
        this._ped.setVariable("DEAD", true);
    }
    clearController() {
        if (!mp.peds.at(this.id)) return false
        if (!this._ped) return false;
        let player = mp.players.at(this.controllerId);
        if (!player) return;
        this._ped.controller = null;
        this.controllerId = -1;
        player.call("rejectSync", [this._type, this.id, this.ped.getVariable("DEAD")]);
    }
    get controller() {
        if (!mp.peds.at(this.id)) return false
        if (!this._ped) return false;
        if (!this._ped.controller) return false;
        return this._ped.controller;
    }
    setController(controllerId) {
        this.controllerId = controllerId;
        let player = mp.players.at(this.controllerId);
        if (!player) return;
        this._ped.controller = player;
        player.call("acknowledgeSync", [this._type, this.id]);
        //methods.debug('Контроллер сменился')
    }
    get position() {
        if (!mp.peds.at(this.id)) return new mp.Vector3(0, 0, 0);
        if (!this._ped) return new mp.Vector3(0, 0, 0);
        if (this._ped.getVariable("DEAD")) return new mp.Vector3(0, 0, 0);
        return vector.vector(this._ped.position);
    }
    damage() { }
}
class Zombie extends SyncPed {
    constructor(model, position, zombieType, dim = 0) {
        super(model, position);
        methods.debug("new Zombie", this.id);
        this.dim = dim;
        this.zombieType = zombieType;
        this.init();
        this._type = "zombie";
    }
    init() {
        this.manager = ZombieManager;
        if (!this._ped) return;
        this._ped.dimension = this.dim;
        this._ped.setVariable("zombie", true);
        this._ped.setVariable("DEAD", false);
        this._ped.setVariable("ZOMBIE_TYPE", this.zombieType);
        mp.events.call("ped:create", this._ped);
        let max_hp = 270;
        if (this.zombieType == "runner") max_hp = 200;
        if (this.zombieType == "sprinter") max_hp = 160;
        this._ped.setVariable("HEALTH", max_hp);
        this._ped.setVariable("MAX_HEALTH", max_hp);
        this._ped.setVariable("NOISE_ALERTNESS", 2);
        if (this.zombieType == "runner") this._ped.setVariable("NOISE_ALERTNESS", 2);
        if (this.zombieType == "sprinter") this._ped.setVariable("NOISE_ALERTNESS", 3);
        this._ped.setVariable("WALKSTYLE", 'move_m@drunk@verydrunk');
        if (this.zombieType == "runner") this._ped.setVariable("WALKSTYLE", 'move_m@drunk@verydrunk');
        if (this.zombieType == "sprinter") this._ped.setVariable("WALKSTYLE", 'move_m@drunk@verydrunk');
        this._ped.setVariable("VIEW_DISTANCE", 100);
        if (this.zombieType == "runner") this._ped.setVariable("VIEW_DISTANCE", 140);
        if (this.zombieType == "sprinter") this._ped.setVariable("VIEW_DISTANCE", 200);
        if (!this.manager) return;
        this.manager.addPed(this);
    }
}
function loadZombies() {
    mp.objects.forEach(obj => {
        try {
            if (obj && mp.objects.exists(obj)) {
                if (obj.model == mp.joaat('p_phonebox_01b_s') || obj.model == mp.joaat('p_phonebox_02_s') || obj.model == mp.joaat('prop_atm_02') ||
                    obj.model == mp.joaat('prop_atm_03') || obj.model == mp.joaat('prop_bench_01a') || obj.model == mp.joaat('prop_bench_01b') ||
                    obj.model == mp.joaat('prop_bench_01c') || obj.model == mp.joaat('prop_busstop_02') || obj.model == mp.joaat('prop_busstop_05'))
                    spawnlistZombie.push([obj.position.x, obj.position.y, obj.position.z])

            }
        } catch (e) {
            methods.debug(e)
        }
    });


    spawnlistZombie.forEach(function (item) {
        for (let i = 0; i < 4; i++) {
            let shopPos = new mp.Vector3(item[0], item[1], item[2]);
            let new_pos = vector.vector(shopPos);
            let rtype = methods.getRandomInt(0, zombType.length)
            let rSkin = methods.getRandomInt(0, zombSkin.length)
            new Zombie(zombSkin[rSkin], new_pos, zombType[rtype]);
            methods.sleep(20);
        }

    });
}
mp.events.addRemoteCounted("zombie_new", (player, type) => {
    let new_pos = vector.vector(player.position);
    new Zombie("u_m_y_zombie_01", new_pos, type);
});
mp.events.addRemoteCounted("zombie:damage", (player, zombieId, weapon_hash, hitBone, fireFromVector, hitVector, damage) => {
    let zombie = mp.peds.at(zombieId);
    if (zombie) {
        if (!zombie.getVariable("DEAD") && !zombie.getVariable("pets")) {
            var syncingPlayer = mp.players.toArray().find(p => p == zombie.controller);
            if (!syncingPlayer) return console.log("no syncing player");
            zombie.setVariable("HEALTH", zombie.getVariable('HEALTH') - damage);
            let ragdoll = false;
            let stumble = false;
            if (!zombie.getVariable('CAN_STUMBLE')) ragdoll = false;
            if (!zombie.getVariable('CAN_STUMBLE')) stumble = false;
            if (hitBone == "SKEL_Head") {
                ragdoll = true;
            }
            if (
                (hitBone == "SKEL_L_Thigh") || (hitBone == "SKEL_R_Thigh") || (hitBone == "SKEL_L_Foot") || (hitBone == "SKEL_R_Foot") || (hitBone == "SKEL_L_Calf") || (hitBone == "SKEL_R_Calf")) {
                stumble = true;
            }
            syncingPlayer.call("acknowledgeHit", [zombieId, {
                wepaon: weapon_hash,
                bone: hitBone,
                entry: fireFromVector,
                exit: hitVector,
                ragdoll: ragdoll,
                stumble: stumble
            }]);
            if (zombie.getVariable('HEALTH') <= 0) {
                player.call("client:killmarker");
                let p = ZombieManager.find(zombieId);
                if (p) {
                    p.kill();
                }
            } else {
                player.call("client:hitmarker");
            }
        }
        else if(!zombie.getVariable("DEAD") && !zombie.getVariable("pets")){
            var syncingPlayer = mp.players.toArray().find(p => p == zombie.controller);
            if (!syncingPlayer) return console.log("no syncing player");
            if (hitBone == "SKEL_Head") {
                damage = 200;
            }
            zombie.setVariable("HEALTH", zombie.getVariable('HEALTH') - damage);
            syncingPlayer.call("acknowledgeHit", [zombieId, {
                wepaon: weapon_hash,
                bone: hitBone,
                entry: fireFromVector,
                exit: hitVector,
                ragdoll: ragdoll,
                stumble: stumble
            }]);
            if (zombie.getVariable('HEALTH') <= 0) {
                player.call("client:killmarker");
                let p = ZombieManager.find(zombieId);
                if (p) {
                    p.kill();
                }
            } else {
                player.call("client:hitmarker");
            }
        }
    }
});

mp.events.addRemoteCounted("player:damage", (player, zombieId, weapon_hash, hitBone, damage) => {
    let zombie = mp.players.at(zombieId);
    if (zombie) {
        if (player.vehicle) {
            if (player.vehicle.model == mp.joaat('trailersmall2')) {
                damage = methods.getRandomInt(45, 75)
            }
        }
        if (hitBone == "SKEL_Head") {
            zombie.health = zombie.health - 150
        }
        if ((hitBone == "SKEL_L_Thigh") || (hitBone == "SKEL_R_Thigh") || (hitBone == "SKEL_L_Foot") || (hitBone == "SKEL_R_Foot") || (hitBone == "SKEL_L_Calf") || (hitBone == "SKEL_R_Calf")) {
            zombie.health = zombie.health - damage
        }
        if (zombie.health <= 0) {
            player.call("client:killmarker");
        } else {
            player.call("client:hitmarker");
        }

    }
});
mp.events.addRemoteCounted("zombie:damage:outgoing", (player, zombieId, weapon, boneIndex, damage) => {
    return;
    let zombie = mp.peds.at(zombieId);
    // methods.debug("zombie:damage:outgoing", zombieId, weapon, boneIndex);
    if (zombie) {
        if (!zombie.getVariable("DEAD")) {
            if (weapon == 911657153) return false;
            if (boneIndex < 1000) { //проверка попадания в скелет человека
                if (weapon == 2460120199 || weapon == 2508868239 || weapon == 4192643659 || weapon == 2227010557 ||
                    weapon == 2227010557 || weapon == 2343591895 || weapon == 1141786504 ||
                    weapon == 1317494643 || weapon == 4191993645 || weapon == 3638508604 ||
                    weapon == 2578778090 || weapon == 3713923289 || weapon == 3756226112 || weapon == 1737195953 ||
                    weapon == 419712736 || weapon == 3441901897 || weapon == 2484171525) {
                    damage = damage * 0.1
                }
            }

            var syncingPlayer = mp.players.toArray().find(p => p == zombie.controller);
            if (!syncingPlayer) return methods.debug("no syncing player");
            methods.debug("acknowledgeHit")
            let ragdoll = false;
            let stumble = false;
            if (boneIndex == 20) {
                ragdoll = true;
            }
            if (!zombie.getVariable('CAN_STUMBLE')) ragdoll = false;
            if (!zombie.getVariable('CAN_STUMBLE')) stumble = false;
            syncingPlayer.call("acknowledgeHit", [zombieId, {
                wepaon: weapon,
                bone: boneIndex,
                ragdoll: ragdoll,
                stumble: stumble
            }]);
            zombie.setVariable("HEALTH", zombie.getVariable('HEALTH') - damage);
            if (zombie.getVariable('HEALTH') <= 0) {
                player.call("client:killmarker");
                let p = ZombieManager.find(zombieId);
                if (p) {
                    p.kill();
                }
            } else {
                player.call("client:hitmarker");
            }
        }
    }
});
setTimeout(() => {
    loadZombies();
}, 25000);

module.exports = SyncPed
module.exports = Zombie