/*
    Generate Spawn Map
*/
var MapGenerator = new class {
    constructor() {
        this.start_x = -4000;
        this.start_y = 7000;
        this.current_x = 0;
        this.current_y = 0;
        this.target_x = 3240;
        this.target_y = -5000;
        this.status = 0;
        this.steps = setInterval(() => {
            this.tick();
        }, 100);
    }
    tick() {
        if (!this.status) return;
        if ((this.current_x > this.target_x) && (this.current_y > this.target_y)) {
            this.current_y -= 100;
            this.current_x = this.start_x;
        }
        this.current_x += 100;
        if ((this.current_x < this.target_x) && (this.current_y < this.target_y)) this.status = 0;
        let newPosition = new mp.Vector3(this.current_x, this.current_y, 500)
        let g = newPosition.ground();
        mp.players.local.setCoords(g.x, g.y, g.z + 50, false, false, false, false);
        let pos_map = [];
        for (var cx = this.current_x - 100; cx < this.current_x + 100; cx += 5) {
            for (var cy = this.current_y - 100; cy < this.current_y + 100; cy += 5) {
                let nPos = new mp.Vector3(cx, cy, 500)
                let tPos = new mp.Vector3(cx, cy, -100)
                let raycast = mp.raycasting.testCapsule(nPos, tPos, 0.5, mp.players.local)
                let d = {};
                d.x = cx
                d.y = cy
                d.z = cy
                d.m = 0
                if (raycast && raycast.position && raycast.material) {
                    //methods.debug(raycast.material);
                    d.x = raycast.position.x.toFixed(3);
                    d.y = raycast.position.y.toFixed(3);
                    d.z = raycast.position.z.toFixed(3);
                    d.m = raycast.material;
                    pos_map.push(d);
                }
            }
        }
        mp.events.callRemote('client:generateMap', JSON.stringify(pos_map));
        // let raycast = mp.raycasting.testCapsule(hand_pos, targetPosition, 0.3, mp.players.local, (4 | 8 | 1 | 2 | 16))
        // mp.events.callRemote('client:noise', this.oldNoise.toFixed(2));
    }
    start() {
        this.current_x = this.start_x;
        this.current_y = this.start_y;
        this.status = 1;
    }
}
mp.events.add("playerCommand", (command) => {
    const args = command.split(/[ ]+/);
    const commandName = args[0];
    args.shift();
    // 3240 -5000
    if (commandName === "target") {
        mp.gui.chat.push(`Set Target To ${args.join(",")}`);
        MapGenerator.target_x = args[0];
        MapGenerator.target_y = args[1];
    }
    // -2400 8000
    if (commandName === "origin") {
        mp.gui.chat.push(`Set Origin To ${args.join(",")}`);
        MapGenerator.current_x = args[0];
        MapGenerator.current_y = args[1];
    }
    if (commandName === "start") {
        mp.gui.chat.push(`Started Mapping`);
        MapGenerator.start()
    }
    if (commandName === "stop") {
        mp.gui.chat.push(`Clearing Damagepacks`);
        mp.players.local.clearBloodDamage();
    }
});