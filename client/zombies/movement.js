import methods from "../modules/methods";
import user from "../user";
let stamina = 100;
//mp.canCrouch = true;
const loadAnimDict = (AnimDictName) => {
    if (!mp.game.streaming.hasAnimDictLoaded(AnimDictName)) {
        mp.game.streaming.requestAnimDict(AnimDictName);
        while (mp.game.streaming.hasAnimDictLoaded(AnimDictName)) mp.game.wait(1);
    }
};


mp.events.add("entityStreamIn", (entity) => {
    if (entity.type === "player" && entity.getVariable("isCrouched")) {
        entity.setMovementClipset(movementClipSet, clipSetSwitchTime);
        entity.setStrafeClipset(strafeClipSet);
    }
});
setInterval(() => {
    if (user.isLogin()) {
        mp.game.player.setRunSprintMultiplierFor(1);
        if (mp.players.local.isSprinting()) {
            stamina = stamina - 10
        }
        if (!mp.players.local.isSprinting()) {
            stamina = stamina + 5
        }
        if (stamina < 30) {
            mp.game.controls.disableControlAction(2, 21, true);
        }
        if (stamina > 100) {
            stamina = 100
        }
        //ui.callCef('hud', { type: 'updateStamina', stamina: `${stamina}` })
    }
}, 1000);
