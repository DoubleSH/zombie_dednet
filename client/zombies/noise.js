import methods from "../modules/methods";
import user from "../user";

mp.game.audio.startAudioScene("FBI_HEIST_H5_MUTE_AMBIENCE_SCENE");
mp.game.audio.startAudioScene("MIC1_RADIO_DISABLE");

/*
    Update player Noise
*/
class Noise {
    constructor() {
        this.oldNoise = 0;
        this.ticker = new mp.Event("client:Tick", () => {
            this.tick();
        });
    }
    get() {
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
        return localNoise;
    }
    tick() {
        let n = this.get();
        if (n != this.oldNoise) {
            this.oldNoise = n;
            mp.events.callRemote('client:noise', this.oldNoise.toFixed(2));
            methods.debug('client:noise', this.oldNoise.toFixed(2))
        }
    }
}
export default Noise;