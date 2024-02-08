require("./models/peds.js")
require("./models/pedmanager")
require("./libs/vector")
var tickRate = 1000 / 5;
setInterval(function() {
    mp.events.call("server:Tick");
}, tickRate);


/*
    creates account class and sets basic stuff
*/
mp.events.add("playerJoin", (player) => {
    player.setVariable("movementNoise", 0);
});
