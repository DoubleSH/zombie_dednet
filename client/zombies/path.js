
import methods from '../modules/methods';
import Flags from './libs/enums'
/*
    Previous attempt to generate Navmesh for zombies
*/
class Wall {
    constructor(points) {
        this.points = points;
        this.material = 0;
    }
    removeDuplicates() {
        this.points = [...new Set(this.points)];
    }
    isPart(position) {
        return this.points.findIndex(e => {
            return e.x == position.x && e.y == position.y && e.z == position.z;
        })
    }
    get type() {
        return "wall";
    }
}
/*
    Previous attempt to generate Navmesh for zombies
*/
class Node {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.material = 0;
        this.material = 0;
        this.data = undefined,
            this.target_x = 0;
        this.target_y = 0;
        this.target_z = 0;
    }
    get target_pos() {
        return new mp.Vector3(this.target_x, this.target_y, this.target_z);
    }
    get pos() {
        return new mp.Vector3(this.x, this.y, this.z);
    }
}


/*
    Pathfinder class for Zombies
*/
var Pathfinder = class {
    constructor(viewDistance, noiseAlertness, zombieType) {
        this.viewDistance = viewDistance;
        this.noiseAlertness = noiseAlertness;
        this.vision = [];
        this.zombieType = zombieType || "walker";
        this.tempNodes = [];
        this.updateDistance = 15;
        this._updateCounter = 0;
        this.maxIdleTicks = 5;
        this.IdleTicks = 0;
        this.position = new mp.Vector3(0, 0, 0);
        this.nextAction = {
            flag: Flags.IDLE,
            position: new mp.Vector3(0, 0, 0)
        };
        if (this.zombieType == "walker") this.maxIdleTicks = 3;
        if (this.zombieType == "runner") this.maxIdleTicks = 6;
        if (this.zombieType == "sprinter") this.maxIdleTicks = 10;
    }
    /*
        Render Pathfinder logic

    */
    render() {

    }
    /*
        Is from-to LOS Clear
    */
    isValid(from, to) {
        return mp.raycasting.testCapsule(from, to, 0.5, null, (1 | 2 | 16 | 256)) ? false : true;
    }
    /*
        Get Position in LOS to vector
    */
    getNearest(from, to) {
        let rc = mp.raycasting.testCapsule(from, to, 0.2, null, (1 | 2 | 16 | 256));
        return rc ? rc.position : false;
    }
    /*
        get nearest noise location without LOS
    */
    getNearestAttention() {
        let targetPosition = false;
        var attentionPlayers = [];
        mp.players.forEachInStreamRange((player) => {
            if (methods.distanceToPos(this.position, player.position) > this.viewDistance) return;
            if ((player.getVariable("movementNoise") >= (this.noiseAlertness * methods.distanceToPos(this.position, player.position)))) {
                attentionPlayers.push(player);
            }
        })
        if (attentionPlayers.length > 0) {
            let loudest = attentionPlayers.sort((a, b) => {
                let noise_a = a.getVariable("movementNoise") || 0;
                let noise_b = b.getVariable("movementNoise") || 0;
                if (noise_a > noise_b) {
                    return -1;
                }
                if (noise_a < noise_b) {
                    return 1;
                }
                // a muss gleich b sein
                return 0;
            })
            if (loudest[0]) {
                targetPosition = this.getNearest(this.position.add(0,0,1), loudest[0].position)
            }
        }
        return targetPosition;
    };
    /*
        get best target in LoS
    */
    getBestTarget() {
        var visiblePlayers = [];
        mp.players.forEachInStreamRange((player) => {
            if (methods.distanceToPos(this.position, player.position) > this.viewDistance) return;
            // if (!mp.raycasting.testCapsule(this.position, player.position, 0.5, null, (1 | 16 | 256))) {
                visiblePlayers.push(player);
           // }
        })
        if (visiblePlayers) {
            let targets = visiblePlayers.filter(player => {
                let dist = methods.distanceToPos(this.position, player.position);
                return player.getVariable("movementNoise") >= (this.noiseAlertness * dist);
            })
            if (targets.length > 1) {
                targets = targets.sort((a, b) => {
                    if (a.getHealth() > b.getHealth()) {
                        return -1;
                    }
                    if (a.getHealth() < b.getHealth()) {
                        return 1;
                    }
                    // a muss gleich b sein
                    return 0;
                })
            }
            return targets[0];
        }
        return false;
    }/*
        get random location for idle walk
    */
    getRandomPosition() {
        if (!this.position) return false;
        if (!this.failedLastRandomPos) this.failedLastRandomPos = 1;
        let dist = 10;
        if ((this.zombieType == "runner") && (this.failedLastRandomPos == 1)) dist = 15;
        if ((this.zombieType == "sprinter") && (this.failedLastRandomPos == 1)) dist = 15;
        var randomHeading = this.heading + ((Math.random() * 1.0) - 0.5);
        var headingX = Math.cos(randomHeading) * dist;
        var headingY = Math.sin(randomHeading) * dist;
        let newPos = new mp.Vector3(this.position.x + headingX, this.position.y + headingY, this.position.z + 0.4);
        let valid = this.isValid(this.position, newPos);
        if (valid) {
            this.failedLastRandomPos = 1;
            return newPos;
        }
        this.failedLastRandomPos = 2;
        return false;
    }/*
        update next move
    */
    evaluate() {
        if (this._updateCounter < 2) return;
        this._updateCounter = 0;
        let temp_action = {
            flag: Flags.IDLE,
            position: new mp.Vector3(0, 0, 0),
            targetID: false,
            targetType: "player"
        };
        let bestTarget = this.getBestTarget();
        if (!bestTarget) {
            let attention = this.getNearestAttention();
            if (!attention) {
                if (this.IdleTicks > this.maxIdleTicks) {
                    let new_position = this.getRandomPosition();
                    if (new_position) {
                        this.IdleTicks = 0;
                        temp_action.flag = Flags.WALKING;
                        temp_action.position = new_position;
                    }
                }
            } else {
                this.IdleTicks = 0;
                temp_action.flag = Flags.WALKING;
                if (this.zombieType != "walker") temp_action.flag = Flags.RUNNING;
                temp_action.position = attention;
            }
        } else {
            this.IdleTicks = 0;
            temp_action.flag = Flags.COMBAT;
            if (bestTarget.isInAnyVehicle(false)) {
                bestTarget = bestTarget.vehicle;
                temp_action.targetType = "vehicle";
            }
            temp_action.targetID = bestTarget.remoteId;
        }
        if (this.flag == Flags.RAGDOLL) {
            temp_action.flag = Flags.RAGDOLL;
        }
        if (this.flag == Flags.FALLING) {
            temp_action.flag = Flags.FALLING;
        }
        this.nextAction = temp_action;

    }
    /*
        insert info
    */
    update(flag, position, heading) {
        this._updateCounter += 1;
        this.position = position;
        this.flag = flag;
        this.heading = heading += 90;
        //  this.cleanup(position);
        //  this.evaluate();
        if (this.flag == Flags.IDLE) {
            this.IdleTicks += 1;
        }
        this.evaluate();
    }
    /*
        get next move
    */
    next() {
        return this.nextAction;
    }
}
export default Pathfinder;