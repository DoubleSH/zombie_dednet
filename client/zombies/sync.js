
import methods from "../modules/methods.js";
import Pathfinder from "./path.js";
import Flags from './libs/enums'
import vector from './vector'

mp.vector = function (vec) {
    return new mp.Vector3(vec.x, vec.y, vec.z);
}
function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}
function applyZombieAttributes(ped) {
    if (!ped) return;
    //methods.debug("applyZombieAttributes")
    ped.setMaxHealth(200);
    ped.setHealth(200);
    ped.setSweat(100);
    ped.setSuffersCriticalHits(false);
    ped.freezePosition(false);
    ped.setCombatAbility(100);
    ped.setCombatMovement(3);
    for (var i = 1; i < 64; i += 2) {
        ped.setFleeAttributes(i, false);
    }
    ped.setFleeAttributes(0, false);
    ped.setCombatAttributes(17, true);
    ped.setCombatAttributes(16, true);
    ped.setBlockingOfNonTemporaryEvents(true);
    ped.setProofs(false, false, false, true, false, false, false, false);
    ped.setCanBeDamaged(true);
    ped.setInvincible(true);
    ped.setOnlyDamagedByPlayer(true);
    ped.setCanRagdoll(true);
    ped.setCanRagdollFromPlayerImpact(false);
    ped.setRagdollFlag(0);
    //this._ped.setRandomComponentVariation(false);
    ped.applyDamagePack("BigHitByVehicle", 100, 1);
    /*ped.applyDamagePack("Explosion_Med", 100, 1);
    ped.applyDamagePack("Explosion_Large", 100, 1);
    ped.applyDamagePack("SCR_Torture", 100, 1);
    ped.applyDamagePack("SCR_Shark", 100, 1);
    ped.applyDamagePack("BigRunOverByVehicle", 100, 1);*/
    //mp.events.call("attachments:resync", ped);
    mp.game.invoke('0x90D2156198831D69', ped.handle, true); // не будет реагировать на выстрелы и т.д 1             
    mp.game.invoke('0x9F8AA94D6D97DBF4', ped.handle, true); // не будет реагировать на выстрелы и т.д 2
}
var SyncWorld = new class {
    constructor() {
        this._syncedPeds = [];
    }
    acknowledge(type, remoteId) {
        //methods.debug("acknowledgeSync", type, remoteId);
        if (type == "ped") {
            this._syncedPeds.push(new SyncPed(remoteId));
        }
        if (type == "zombie") {
            this._syncedPeds.push(new Zombie(remoteId));
        }
    }
    getByID(remote_id) {
        return this._syncedPeds.find(e => {
            return e._remote_id == remote_id;
        })
    }
    reject(type, remoteId, killIt) {
        let pIndex = this._syncedPeds.findIndex(e => {
            return remoteId == e._remote_id;
        });
        if (pIndex > -1) {
            if (killIt) this._syncedPeds[pIndex].kill();
            this._syncedPeds[pIndex].destroy();
            this._syncedPeds[pIndex] = undefined;
            this._syncedPeds.splice(pIndex, 1);
        }
    }
}
/*
    Basic Ped Sync Class (extended for other modules)
    includes basic tick event and destroy class.
*/
class SyncPed {
    constructor(remote_id) {
        this._remote_id = remote_id;
        this._ped = mp.peds.atRemoteId(this._remote_id);
        // methods.debug("got SyncPed", this._remote_id, this._ped)
        // methods.debug("sync_id", this._ped.getVariable('sync_id'))
        this.ticker = mp.events.add("client:Tick", () => {
            this.tick();
        });
    }
    /*
        Destroys a Synced Ped clientside (drop syncer)
    */
    destroy() {
        //methods.debug("DROP SYNCER")
        if (this.ticker) {
            this.ticker.destroy();
        }
        if (this._renderEvent) {
            this._renderEvent.destroy();
        }
    }
    /*
        Resync ped clothing attributes etc
    */
    resync() { }
    tick() {
        //methods.debug("default tick");
    }
}
/*
    Extended SyncPed class for Zombie AI
    @TODO add arguments for noiseAlertness, viewDistance for different zombieTypes
*/
class Zombie extends SyncPed {
    constructor(remoteId) {
        super(remoteId);
        this.noiseAlertness = this._ped.getVariable('NOISE_ALERTNESS'); // Noise level 4 on 3 meter distance
        this.viewDistance = this._ped.getVariable('VIEW_DISTANCE');
        this.meeleDistance = 1;
        this.zombieType = this._ped.getVariable('ZOMBIE_TYPE')
        this.walkStyle = this._ped.getVariable('WALKSTYLE')
        this.pathfinder = new Pathfinder(this.viewDistance, this.noiseAlertness, this.zombieType);
        this.blip = mp.blips.new(9, new mp.Vector3(this._ped.position.x, this._ped.position.y, this._ped.position.z), {
            color: 3,
            scale: 0.1,
            alpha: 100,
            drawDistance: 0
        });
        this.combatTarget = undefined;
        this.flag = Flags.WALKING;
        this.init();
        this._renderEvent = mp.events.add("render", () => {
            this.render();
        });
    }
    /*
        Resync ped clothing attributes etc
    */
    resync() {
        //methods.debug("resync")
        this.loadPedAttributes();
        this.loadPedAttributes();
    }
    /*
        Check if ped has abnormal status
    */
    status() {
        if (!mp.peds.atRemoteId(this._remote_id)) return;
        if (this._ped.getVariable('DEAD')) this.flag = Flags.DEAD;
        if (this._ped.isRagdoll()) this.flag = Flags.RAGDOLL;
        if (this._ped.isFalling()) this.flag = Flags.FALLING;
        if ((this.flag == Flags.FALLING) && (!this._ped.isFalling())) this.flag = Flags.RAGDOLL;
        if ((this.flag == Flags.RAGDOLL) && (!this._ped.isRagdoll())) {
            this.flag = Flags.IDLE
            mp.peds.forEachInStreamRange((ped) => {
                if (!ped.getVariable('zombie')) return;
                ped.setNoCollision(this._ped.handle, true);
            })
        }
        if ((this.flag == Flags.RAGDOLL)) {
            mp.peds.forEachInStreamRange((ped) => {
                if (!ped.getVariable('zombie')) return;
                ped.setNoCollision(this._ped.handle, false);
            })
        }
        //if (this._ped.isDeadOrDying(true)) this.flag = Flags.DEAD;
    }
    /*
        Debug render info
    */
    render() {
        try {
            if (!mp.peds.atRemoteId(this._remote_id)) return false;
            mp.game.invoke(`0xE43A13C9E4CCCBCF`, this._ped.handle, true); // ЗАБЛОКИРОВАТЬ СОБЫТИЯ ПОРАЖЕНИЯ МЕРТВЫМ ТЕЛОМ
            mp.game.invoke(`0x9D64D7405520E3D3`, this._ped.handle, true); // ОСТАНОВИТЬ ГОВОРИТЬ
            mp.game.invoke(`0xA9A41C1E940FB0E8`, this._ped.handle, true); // ОТКЛЮЧИТЬ ЗВУК ПЕДА БОЛИ
            this._ped.setCanPlayAmbientBaseAnims(false); // набор может воспроизводить базовую анимацию окружающей среды
            this._ped.setCanPlayAmbientAnims(false); //  набор может воспроизводить окружающие анимации
            this._ped.setCanPlayGestureAnims(false); // набор может воспроизводить анимацию жестов
            this._ped.setCanPlayVisemeAnims(false, false); // набор может воспроизводить анимации визем
            this.pathfinder.render();
            let position = mp.vector(vector.ground(this._ped.getCoords(true)));
            let dist = methods.distanceToPos(position, mp.players.local.position);
            let threshold = this.noiseAlertness * dist
            if (this.currentTargetPosition) {
                if (position.x == 0 || position.z == 0 || this.currentTargetPosition.x == 0 || this.currentTargetPosition.y == 0) return;
            }
        } catch (e) {
            //methods.debug(e)
        }

    }
    /*
        Set ped attributes so it doesnt flee and cower
    */
    loadPedAttributes() {
        if (!mp.peds.atRemoteId(this._remote_id)) return;
        this._ped.setMaxHealth(200);
        this._ped.setHealth(200);
        this._ped.setSweat(100);
        this._ped.setSuffersCriticalHits(false);
        this._ped.freezePosition(false);
        this._ped.setCombatAbility(100);
        this._ped.setCombatMovement(3);
        for (var i = 1; i < 64; i += 2) {
            this._ped.setFleeAttributes(i, false);
        }
        this._ped.setFleeAttributes(0, false);
        this._ped.setCombatAttributes(17, true);
        this._ped.setCombatAttributes(16, true);
        this._ped.setBlockingOfNonTemporaryEvents(true);
        this._ped.setProofs(false, false, false, true, false, false, false, false);
        this._ped.setCanBeDamaged(true);
        this._ped.setInvincible(true);
        this._ped.setOnlyDamagedByPlayer(true);
        this._ped.setCanRagdoll(true);
        this._ped.setCanRagdollFromPlayerImpact(false);
        this._ped.setRagdollFlag(0);
        //this._ped.setRandomComponentVariation(false);
        this._ped.applyDamagePack("BigHitByVehicle", 100, 1);
        this._ped.setMaxHealth((100 + methods.parseInt(this._ped.getVariable('MAX_HEALTH'))));
        this._ped.setHealth((100 + methods.parseInt(this._ped.getVariable('HEALTH'))));
        mp.game.invoke('0x90D2156198831D69', this._ped.handle, true); // не будет реагировать на выстрелы и т.д 1             
        mp.game.invoke('0x9F8AA94D6D97DBF4', this._ped.handle, true); // не будет реагировать на выстрелы и т.д 2
    }
    /*
        Apply hit to player (make it stumble and so on)
    */
    applyHit(hitData) {
        try {
            if (!mp.peds.atRemoteId(this._remote_id)) return false;
            this._ped.setMaxHealth((100 + methods.parseInt(this._ped.getVariable('MAX_HEALTH'))));
            this._ped.setHealth((100 + methods.parseInt(this._ped.getVariable('HEALTH'))));
            if (this.flag != Flags.RAGDOLL) {
                //methods.debug("applyHit", hitData);
                let time = 1000;
                if (hitData.stumble) {
                    this._ped.setToRagdoll(time, time, 2, false, false, false);
                } else if (hitData.ragdoll == true) {
                    this._ped.setToRagdoll(time, time, 0, false, false, false);
                }
                // let position = this._ped.getCoords(true);
                // //mp.game.graphics.drawLine(position.x + hitData.hitVector.x, position.y + hitData.hitVector.y, position.z + hitData.hitVector.z, position.x + hitData.hitVector.x - hitData.x, position.y + hitData.hitVector.y - hitData.y, position.z + hitData.hitVector.z - hitData.z, 255, 9, 9, 255);
                // let entry = new mp.Vector3(position.x + hitData.exit.x + hitData.entry.x, position.y + hitData.exit.y + hitData.entry.y, position.z + hitData.exit.z + hitData.entry.z);
                // let targetPosition = new mp.Vector3(position.x + hitData.exit.x, position.y + hitData.exit.y, position.z + hitData.exit.z);
                // let dirVector = vector.normalize(new mp.Vector3(targetPosition.x - entry.x, targetPosition.y - entry.y, targetPosition.z - entry.z));
                // if (hitData.ragdoll == true) {
                //     this._ped.applyForceTo(3, entry.x, entry.y, entry.z, dirVector.x, dirVector.y, dirVector.z, 0, true, false, false, false, false);
                //     this._ped.applyForceTo(5, entry.x, entry.y, entry.z, dirVector.x, dirVector.y, dirVector.z, 0, true, false, false, false, false);
                // }
                // this._ped.applyForceTo(2, entry.x, entry.y, entry.z, dirVector.x, dirVector.y, dirVector.z, 0, true, false, false, false, false);
                // this._ped.setVelocity(dirVector.x, dirVector.y, dirVector.z)
                //mp.game.invoke("0x8E04FEDD28D42462", this._ped.handle, "GENERIC_CURSE_HIGH", "SPEECH_PARAMS_SHOUTED", 0);
                mp.game.invoke("0x8E04FEDD28D42462", this._ped.handle, "GENERIC_CURSE_MED", "SPEECH_PARAMS_SHOUTED", 0);
                this.loadPedAttributes();
            }
        } catch (e) {
            methods.debug(e)
        }
    }
    /*
        Kill Ped
    */
    kill() {
        if (!mp.peds.atRemoteId(this._remote_id)) return;
        this._ped.setHealth(0);
        this._ped.setToRagdoll(1000, 1000, 3, false, false, false);
        this.flag = Flags.DEAD;
    }
    /*
        On Init (load walkstyle etc)
    */
    init() {
        try {
            if (!mp.peds.atRemoteId(this._remote_id)) return false;
            if (!mp.game.streaming.hasClipSetLoaded(this.walkStyle.toString())) {
                mp.game.streaming.requestClipSet(this.walkStyle.toString());
                while (!mp.game.streaming.hasClipSetLoaded(this.walkStyle.toString())) mp.game.wait(0);
            }
            this._ped.setMovementClipset(this.walkStyle.toString(), 0.0);
            this.loadPedAttributes();
        } catch (e) {
            methods.debug(e)
        }

    }
    /*
       on IDLE
       TODO
    */
    idle() {
        //this.flag = Flags.IDLE;
        //methods.debug("PED", this.flag);
    }
    /*
       Walk to position
       
    */
    walk(position) {
        if (!mp.peds.atRemoteId(this._remote_id)) return false;
        this._ped.taskGoToCoordAnyMeans(position.x, position.y, position.z, 1, 0, false, 786603, 0);
        //this._ped.taskGoStraightToCoord(position.x, position.y, position.z, 0.4, 15000, this.newHeading, 0);
        if ((this.position.z > position.z + 2) || this.straight) {
            this._ped.taskWanderStandard(10.00, 10);

        }

    }
    /*
       Run to position
       
    */
    run(position) {
        if (!mp.peds.atRemoteId(this._remote_id)) return false;
        if (!position) return false;
        if (!this.position) return false;
        this._ped.taskGoToCoordAnyMeans(position.x, position.y, position.z, 3, 0, false, 786603, 0);
        if ((this.position.z > position.z + 2) || this.straight) {
            this._ped.taskWanderStandard(10.00, 10);

        }
    }
    /*
       Sprint to position
       
    */
    sprint(position) {
        if (!mp.peds.atRemoteId(this._remote_id)) return false;
        if (!position) return false;
        if (!this.position) return false;
        this._ped.taskGoToCoordAnyMeans(position.x, position.y, position.z, 12.4, 0, false, 786603, 0);
        if ((this.position.z > position.z + 1) || this.straight) {
            this._ped.taskWanderStandard(10.00, 10);

        }
    }
    /*
       Meele target
       
    */
    meele(targetHandle) {
        if (!mp.peds.atRemoteId(this._remote_id)) return false;
        this._ped.taskPutDirectlyIntoMelee(targetHandle.handle, 0.0, -1.0, 1.0, false);
        //this._ped.taskPlayAnim("melee@unarmed@streamed_core", "running_punch_no_target", 8.0, 1.0, -1, 1, 1.0, false, false, false);
        //this._ped.taskPlayAnim("melee@unarmed@streamed_core", "walking_punch_no_target", 32.0, 1.0, -1, 1, 1.0, false, false, false);
        //this._ped.taskPlayAnim("melee@unarmed@streamed_core", "running_punch_no_target", 8.0, 1.0, -1, 1, 1.0, false, false, false);
    }
    /*
       Initiate Combat
       
    */
    combat(targetType, remoteId) {
        if (!mp.peds.atRemoteId(this._remote_id)) return false;
        this.straight = false;
        var tagetEntity = false;
        if (targetType == "player") {
            tagetEntity = mp.players.toArray().find(element => element.remoteId == remoteId);
        } else {
            tagetEntity = mp.vehicles.toArray().find(element => element.remoteId == remoteId);
        }
        if (tagetEntity) {
            let tEntityPos = new mp.Vector3(tagetEntity.position.x, tagetEntity.position.y, tagetEntity.position.z);
            if (methods.distanceToPos(tEntityPos, this._ped.position) > this.viewDistance) {
                this.combatTarget = undefined;
                this.flag = Flags.WALKING;
                return false;
            } else if (methods.distanceToPos(tEntityPos, this._ped.getCoords(false)) < this.meeleDistance) {
                this.meele(tagetEntity);
                return true;
            }
            if (tagetEntity.type == "player" && tagetEntity.isOnVehicle()) this.straight = true;
            this.currentTargetPosition = tEntityPos;
            if (this.zombieType == "runner") this.run(tEntityPos);
            if (this.zombieType == "walker") this.walk(tEntityPos);
            if (this.zombieType == "sprinter") this.sprint(tEntityPos);
        }
    }
    /*
       Find new position, pathfinding etc
       
    */
    tick() {
        if (!mp.peds.atRemoteId(this._remote_id)) {
            //methods.debug("no remote", this._remote_id);
            SyncWorld.reject("zombie", this._remote_id, true);
            return;
        }
        this.status();
        if (this.flag != Flags.DEAD) {
            this.position = this._ped.getCoords(false);
            this.pathfinder.update(this.flag, new mp.Vector3(this.position.x, this.position.y, this.position.z), this._ped.getHeading());
            //methods.debug("tick");
            //this._ped.resetRagdollTimer();
            //this._ped.clearTasksImmediately();
            let next = this.pathfinder.next();
            this.flag = next.flag;
            this.currentTargetPosition = mp.vector(vector.ground(next.position));
            switch (next.flag) {
                case Flags.WALKING:
                    {
                        this.walk(next.position);
                        break;
                    }
                case Flags.RUNNING:
                    {
                        this.run(next.position);
                        break;
                    }
                case Flags.SPRINT:
                    {
                        this.sprint(next.position);
                        break;
                    }
                case Flags.COMBAT:
                    {
                        this.combat(next.targetType, next.targetID);
                        break;
                    }
                case Flags.IDLE:
                    {
                        this.idle();
                        break;
                    }
                case Flags.RAGDOLL:
                    {
                        this.idle();
                        break;
                    }
                default:
                    {
                        this.idle();
                        break;
                    }
            }
            if (this._ped.hasBeenDamagedByAnyObject() || this._ped.hasBeenDamagedByAnyPed() || this._ped.hasBeenDamagedByAnyVehicle()) {
                //methods.debug("hit")
            }
        } else {
            this._ped.setHealth(0);
            this._ped.setToRagdoll(1000, 1000, 3, false, false, false);
        }
        //this._ped.taskWanderStandard(10.00, 10);
    }
}
/*
    Called when ped controller changes to resync attributes
*/
mp.events.add('resyncPed', (type, remoteId) => {
    //methods.debug("resyncPed", remoteId);
    let SyncedPed = SyncWorld.getByID(remoteId);
    if (SyncedPed) {
        SyncedPed.resync();
    } else {
        if (type == "zombie") applyZombieAttributes(mp.peds.atRemoteId(remoteId));
    }
});
/*
    Called when a players gets the job to sync a Server-NPC
*/
mp.events.add('acknowledgeSync', (type, remote_id) => {
    //methods.debug("acknowledgeSync", type, remote_id);
    SyncWorld.acknowledge(type, remote_id);
});
/*
    Called when a players loses the job to sync a Server-NPC
*/
mp.events.add('rejectSync', (type, remote_id, kill) => {
    //methods.debug("rejectSync", type, remote_id);
    SyncWorld.reject(type, remote_id, kill);
});
/*
    Called when a player shot a Server-NPC (to call .applyHit() and simulate ai)
*/
mp.events.add('acknowledgeHit', (remote_id, hitData) => {
    //methods.debug("acknowledgeHit", remote_id, hitData);
    let SyncedPed = SyncWorld.getByID(remote_id);
    if (SyncedPed) {
        SyncedPed.applyHit(hitData);
    }
});