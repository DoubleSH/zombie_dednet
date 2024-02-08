import methods from "../modules/methods";
import vector from "./vector";
const weaponsUtil = [
    ["SniperRifle", 100416529, 0.9],
    ["FireExtinguisher", 101631238, 0.2],
    ["CompactGrenadeLauncher", 125959754, 0.2],
    ["Snowball", 126349499, 0.2],
    ["VintagePistol", 137902532, 0.15],
    ["CombatPDW", 171789620, 0.19],
    ["HeavySniperMk2", 177293209, 2],
    ["HeavySniper", 205991906, 1],
    ["SweeperShotgun", 317205821, 0.5],
    ["MicroSMG", 324215364, 0.2],
    ["Wrench", 419712736, 0.2],
    ["Pistol", 453432689, 0.13],
    ["PumpShotgun", 487013001, 0.35],
    ["APPistol", 584646201, 0.2],
    ["Ball", 600439132, 0.2],
    ["Molotov", 615608432, 0.2],
    ["SMG", 736523883, 0.2],
    ["StickyBomb", 741814745, 0.2],
    ["PetrolCan", 883325847, 0.2],
    ["StunGun", 911657153, 0.2],
    ["AssaultRifleMk2", 961495388, 0.2],
    ["HeavyShotgun", 984333226, 0.2],
    ["Minigun", 1119849093, 0],
    ["GolfClub", 1141786504, 0.2],
    ["FlareGun", 1198879012, 0.2],
    ["Flare", 1233104067, 0.2],
    ["GrenadeLauncherSmoke", 1305664598, 0.2],
    ["Hammer", 1317494643, 0.2],
    ["CombatPistol", 1593441988, 0.2],
    ["Gusenberg", 1627465347, 0.25],
    ["CompactRifle", 1649403952, 0.26],
    ["HomingLauncher", 1672152130, 0.2],
    ["Nightstick", 1737195953, 0.2],
    ["Railgun", 1834241177, 0],
    ["SawnOffShotgun", 2017895192, 1],
    ["SMGMk2", 2024373456, 0.2],
    ["BullpupRifle", 2132975508, 0.25],
    ["Firework", 2138347493, 0],
    ["CombatMG", 2144741730, 0.2],
    ["CarbineRifle", 2210333304, 0.36],
    ["Crowbar", 2227010557, 0.2],
    ["Flashlight", 2343591895, 0.2],
    ["Dagger", 2460120199, 0.2],
    ["Grenade", 2481070269, 0.2],
    ["PoolCue", 2484171525, 0.2],
    ["Bat", 2508868239, 0.2],
    ["Pistol50", 2578377531, 0.24],
    ["Knife", 2578778090, 0.2],
    ["MG", 2634544996, 0.41],
    ["BullpupShotgun", 2640438543, 0.8],
    ["BZGas", 2694266206, 0.2],
    // Unarmed, 2725352035,
    ["GrenadeLauncher", 2726580491, 0.2],
    ["NightVision", 2803906140, 0.2],
    ["Musket", 2828843422, 1],
    ["ProximityMine", 2874559379, 0.2],
    ["AdvancedRifle", 2937143193, 0.34],
    ["RPG", 2982836145, 1],
    ["PipeBomb", 3125143736, 0.2],
    ["MiniSMG", 3173288789, 0.16],
    ["SNSPistol", 3218215474, 0.12],
    ["PistolMk2", 3219281620, 0.2],
    ["AssaultRifle", 3220176749, 0.3],
    ["SpecialCarbine", 3231910285, 0.34],
    ["Revolver", 3249783761, 0.27],
    ["MarksmanRifle", 3342088282, 0.8],
    ["BattleAxe", 3441901897, 0.6],
    ["HeavyPistol", 3523564046, 0.27],
    ["Knuckle", 3638508604, 0.2],
    ["MachinePistol", 3675956304, 0.2],
    ["CombatMGMk2", 3686625920, 0.56],
    ["MarksmanPistol", 3696079510, 0.6],
    ["Machete", 3713923289, 0.2],
    ["SwitchBlade", 3756226112, 0.2],
    ["AssaultShotgun", 3800352039, 0.8],
    ["DoubleBarrelShotgun", 4019527611, 0.9],
    ["AssaultSMG", 4024951519, 0.19],
    ["Hatchet", 4191993645, 0.2],
    ["Bottle", 4192643659, 0.2],
    ["CarbineRifleMk2", 4208062921, 0.38],
    ["Parachute", 4222310262, 0.2],
    ["SmokeGrenade", 4256991824, 0.2],
];
let player_bones = {
    "SKEL_L_UpperArm": {
        bone_id: 45509,
        threshold: 0.4
    },
    "SKEL_R_UpperArm": {
        bone_id: 40269,
        threshold: 0.4
    },
    "SKEL_L_Forearm": {
        bone_id: 61163,
        threshold: 0.4
    },
    "SKEL_R_Forearm": {
        bone_id: 28252,
        threshold: 0.4
    },
    "SKEL_Head": {
        bone_id: 31086,
        threshold: 0.2
    },
    "SKEL_R_Hand": {
        bone_id: 57005,
        threshold: 0.4
    },
    "SKEL_L_Hand": {
        bone_id: 18905,
        threshold: 0.4
    },
    "SKEL_R_Clavicle": {
        bone_id: 10706,
        threshold: 0.3
    },
    "SKEL_L_Clavicle": {
        bone_id: 64729,
        threshold: 0.3
    },
    "SKEL_Spine0": {
        bone_id: 23553,
        threshold: 0.5
    },
    "SKEL_Spine1": {
        bone_id: 24816,
        threshold: 0.5
    },
    "SKEL_Spine2": {
        bone_id: 24817,
        threshold: 0.5
    },
    "SKEL_Spine3": {
        bone_id: 24818,
        threshold: 0.5
    },
    "SKEL_R_Calf": {
        bone_id: 36864,
        threshold: 0.3
    },
    "SKEL_L_Calf": {
        bone_id: 63931,
        threshold: 0.3
    },
    "SKEL_L_Thigh": {
        bone_id: 58271,
        threshold: 0.3
    },
    "SKEL_R_Thigh": {
        bone_id: 51826,
        threshold: 0.3
    },
    "SKEL_R_Foot": {
        bone_id: 52301,
        threshold: 0.3
    },
    "SKEL_L_Foot": {
        bone_id: 14201,
        threshold: 0.3
    }
}
/*
    Calculate if a hit was on bone (regardless of in vehicle or not)
    @returns object(hit,bone,dist)
*/
function getIsHitOnBone(hitPosition, target) {
    let nearest_bone = "";
    let nearest_bone_dist = 99;
    if (target != null) {
        for (let bone in player_bones) {
            let bone_id = player_bones[bone].bone_id;
            let threshold = player_bones[bone].threshold;
            let headPos = mp.players.local.getBoneCoords(12844, 0, 0, 0);
            let pos = target.getBoneCoords(bone_id, 0, 0, 0);
            let raycast = mp.raycasting.testPointToPoint(hitPosition, pos, mp.players.local, (2));
            let hit_dist = mp.game.system.vdist(hitPosition.x, hitPosition.y, hitPosition.z, pos.x, pos.y, pos.z);
            if (hit_dist < 1.6) {
                let vectorr = new mp.Vector3(hitPosition.x - headPos.x, hitPosition.y - headPos.y, hitPosition.z - headPos.z);
                let dist_aim = mp.game.system.vdist(hitPosition.x, hitPosition.y, hitPosition.z, headPos.x, headPos.y, headPos.z);
                let vectorNear = vector.normalizeD(vectorr, dist_aim);
                //....
                let dist = mp.game.system.vdist(pos.x, pos.y, pos.z, headPos.x, headPos.y, headPos.z);
                let vectorAtPos = vector.multiply(vectorNear, dist);
                let aimdist = mp.game.system.vdist(pos.x, pos.y, pos.z, headPos.x + vectorAtPos.x, headPos.y + vectorAtPos.y, headPos.z + vectorAtPos.z)
                if (nearest_bone_dist > aimdist) {
                    if (aimdist <= threshold) {
                        nearest_bone = bone;
                        nearest_bone_dist = aimdist;
                    }
                }
            }
        }
    }
    return {
        hit: (nearest_bone != "" ? true : false),
        bone: nearest_bone,
        dist: nearest_bone_dist
    };
}

var list = [];
function add(a, b, rgb) { let push = { amount: a, position: b, count: 0, color: rgb }; list.push(push); }
function weaponshoot() { list.forEach(element => { mp.game.graphics.drawText("" + element.amount.toString(), [element.position.x, element.position.y, element.position.z + 1], { font: 0, centre: true, color: [element.color[0], element.color[1], element.color[2], element.color[3] - element.count], scale: [0.3, 0.3], outline: true }); element.count += 3; element.position.z += 0.02; if (element.count > 250) { var find = list.findIndex(elemen => elemen == element); list.splice(find, 1); } }); }
// mp.events.add('render', () => {
// 	weaponshoot();
// 	mp.players.forEachInStreamRange((_player) => {
// 		if (_player.hasBeenDamagedByAnyPed() == 1) {
// 			let max_health = mp.game.invoke(`0x15D757606D170C3C`, _player.handle);
// 			let health = _player.getHealth();
// 			let damage = Number(health) - Number(max_health);
// 			add(damage, _player.getCoords(false));
// 			mp.game.invoke(`0x166E7CF68597D8B5`, _player.handle, health);
// 			_player.clearLastDamage();
// 		}
// 	});
// });

mp.events.add('playerWeaponShot', (targetPosition, targetEntity) => {
    try {
        let weapon_hash = mp.game.invoke('0x0A6DB4965674D243', mp.players.local.handle);
        let damage = 20
        weaponsUtil.forEach((item) => {
            try {
                if (item[1] == weapon_hash) {
                    let d = methods.getRandomInt(60, 150)

                    damage = methods.parseInt(d * item[2]);
                }
            }
            catch (e) {
                methods.debug(e);
            }
        });
        if (!targetEntity) {
            let hand_pos = mp.players.local.getBoneCoords(57005, 0, 0, 0);
            // let raycast = mp.raycasting.testPointToPoint(hand_pos, targetPosition, mp.players.local, (4 | 8));
            let raycast = mp.raycasting.testCapsule(hand_pos, targetPosition, 0.1, mp.players.local, (4 | 8 | 1 | 2 | 16))
            if (raycast && raycast.entity) {
                if (typeof raycast.entity == "object") {
                    if (raycast) {
                        //mp.game.graphics.addDecal(1110 /*splatters_blood2 */ , targetPosition.x, targetPosition.y, targetPosition.z, 0 /*dirX*/ , 0 /*dirY*/ , -1 /*dirZ*/ , 0, /*rot*/ 1, 0, 4 /*width*/ , 4 /*height*/ , 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 0 /*dirX*/, 0 /*dirY*/, 0 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 0 /*dirX*/, 0 /*dirY*/, -1 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 0 /*dirX*/, 0 /*dirY*/, 1 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 0 /*dirX*/, 0 /*dirY*/, 0 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 0 /*dirX*/, -1 /*dirY*/, 0 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 0 /*dirX*/, 1 /*dirY*/, 0 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 0 /*dirX*/, 0 /*dirY*/, 0 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, -1 /*dirX*/, 0 /*dirY*/, 0 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                        mp.game.graphics.addDecal(1110, raycast.position.x, raycast.position.y, raycast.position.z, 1 /*dirX*/, 0 /*dirY*/, 0 /*dirZ*/, 0, /*rot*/ 1, 0, 1 /*width*/, 1 /*height*/, 255, 0.1, 0.1, 1.0, 150.0, false, false, false);
                    }
                    if (raycast.entity.type == "ped") {
                        let localPed = mp.peds.atRemoteId(raycast.entity.remoteId);
                        if (localPed) {
                            if (localPed.getVariable('syncPed') || localPed.getVariable('pets')) {
                                if (localPed.getVariable('DEAD')) return;
                                let hitData = getIsHitOnBone(targetPosition, localPed);
                                let vector = new mp.Vector3(targetPosition.x - hand_pos.x, targetPosition.y - hand_pos.y, targetPosition.z - hand_pos.z);
                                let hitVector = localPed.getOffsetFromGivenWorldCoords(targetPosition.x, targetPosition.y, targetPosition.z);
                                mp.events.callRemote("zombie:damage", localPed.getVariable('sync_id'), weapon_hash, hitData.hit ? hitData.bone : false, vector, hitVector, damage);
                            }
                        }

                    }
                    if (raycast.entity.type == "player") {
                        let localPed = mp.players.atRemoteId(raycast.entity.remoteId);
                        let hitData = getIsHitOnBone(targetPosition, localPed);
                        if (localPed) {
                            mp.events.callRemote("player:damage", raycast.entity.remoteId, weapon_hash, hitData.hit ? hitData.bone : false, damage);
                        }
                    }

                }
            }
        } else {
        }
    } catch (e) {
        methods.debug(e)
    }


});
/*
    Hitmarker 
*/
var timerHitmarker = 0;
var timerHitmarkerKill = 0;

mp.events.add("render", () => {
    if (!mp.game.graphics.hasStreamedTextureDictLoaded("hud_reticle")) {
        mp.game.graphics.requestStreamedTextureDict("hud_reticle", true);
    }
    if (mp.game.graphics.hasStreamedTextureDictLoaded("hud_reticle")) {
        if ((Date.now() / 1000 - timerHitmarker) <= 0.1) {
            mp.game.graphics.drawSprite("hud_reticle", "reticle_ar", 0.5, 0.5, 0.025, 0.040, 45, 255, 255, 255, 150);
        }
        if ((Date.now() / 1000 - timerHitmarkerKill) <= 0.1) {
            mp.game.graphics.drawSprite("hud_reticle", "reticle_ar", 0.5, 0.5, 0.025, 0.040, 45, 200, 0, 0, 150);
        }
    }
});
mp.events.add("client:hitmarker", () => {
    timerHitmarker = Date.now() / 1000;
});
mp.events.add("client:killmarker", () => {
    timerHitmarkerKill = Date.now() / 1000;
});