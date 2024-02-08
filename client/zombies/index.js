
import "./libs/enums.js";
import "./libs/skeleton.js";
import "./vector.js";
import "./sync.js";
import "./combat.js";
import "./movement.js";
import "./generator.js";
import "./noise.js"
import user from "../user.js";
import methods from "../modules/methods.js";
import ui from "../modules/ui.js";
/*
    Client Tickrate
*/
var tickRate = 1000 / 5;
setInterval(function () {
    if (!user.isLogin()) return;
    mp.events.call("client:Tick");
    mp.events.callRemote('client:noise', getNoise());
}, tickRate);
function getNoise() {
    let localNoise = mp.game.player.getCurrentStealthNoise();
    if (mp.players.local.isInAnyVehicle(false)) {
        localNoise *= 2;
        if (mp.players.local.vehicle.getIsEngineRunning()) {
            localNoise += 15;
        }
        if (mp.players.local.vehicle.isSirenSoundOn()) {
            localNoise += 55;
        }
    }
    return localNoise
}
/*
    shortcut for validating
*/
mp.isValid = function (val) {
    return val != null && val != undefined && val != "";
}
/*
    Max out all stats
*/
var localPlayerBlip = mp.blips.new(9, new mp.Vector3(mp.players.local.position), {
    color: 3,
    scale: 0.2,
    alpha: 100,
    shortRange: true,
    drawDistance: 0
});
mp.events.add("render", () => {
    if (!user.isLogin()) return;
    mp.game.graphics.setBlackout(true);
    let localNoise = mp.game.player.getCurrentStealthNoise();
    if (mp.players.local.isInAnyVehicle(false)) {
        localNoise *= 2;
        if (mp.players.local.vehicle.getIsEngineRunning()) {
            localNoise += 15;
        }
    }
    /* This block represents if a player is taken damage by something */
    if (mp.players.local.hasBeenDamagedByAnyObject() || mp.players.local.hasBeenDamagedByAnyPed() || mp.players.local.hasBeenDamagedByAnyVehicle()) {
    }
});
// setInterval(() => {
//     if (user.isLogin()) {
//         ui.callCef('hud', { type: 'updateSound', sound: `${methods.parseInt(getNoise())}` })
//     }

// }, 3000);
/*
    test zombie spawning
*/
// mp.keys.bind(0x71, true, function () {
//     mp.events.callRemote('zombie_new', "walker");
// });
// mp.keys.bind(0x72, true, function () {
//     mp.events.callRemote('zombie_new', "runner");
// });
// mp.keys.bind(0x73, true, function () {
//     mp.events.callRemote('zombie_new', "sprinter");
// });

/*
    Test Decals
*/