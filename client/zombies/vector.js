
let vector = {}
/*
    gets point from rotation, distance and rotation offset
    @returns vector
*/
vector.findRot = function(rz, dist, rot) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    let degrees = (rz + rot) * (Math.PI / 180);
    nVector.x = this.x + dist * Math.cos(degrees);
    nVector.y = this.y + dist * Math.sin(degrees);
    return nVector;
}

/*
    get rotation to point
    @returns float
*/
vector.rotPoint = function(pos) {
    let temp = new mp.Vector3(this.x, this.y, this.z);
    let temp1 = new mp.Vector3(pos.x, pos.y, pos.z);
    let gegenkathete = temp1.z - temp.z
    let a = temp.x - temp1.x;
    let b = temp.y - temp1.y;
    let ankathete = Math.sqrt(a * a + b * b);
    let winkel = Math.atan2(gegenkathete, ankathete) * 180 / Math.PI
    return winkel;
}
/*
    vector to screen
    @returns object(x,y)
*/
vector.toPixels = function() {
    let clientScreen = mp.game.graphics.getScreenActiveResolution(0, 0);
    let toScreen = mp.game.graphics.world3dToScreen2d(new mp.Vector3(pos.x, pos.y, pos.z)) || {
        x: 0,
        y: 0
    };
    return {
        x: Math.floor(clientScreen.x * toScreen.x) + "px",
        y: Math.floor(clientScreen.y * toScreen.y) + "px"
    };
}
/*
    lerp vector
    @returns vector
*/
vector.lerp = function(vector2, deltaTime) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    nVector.x = this.x + (vector2.x - this.x) * deltaTime
    nVector.y = this.y + (vector2.y - this.y) * deltaTime
    nVector.z = this.z + (vector2.z - this.z) * deltaTime
    return nVector;
}

/*
    multiply vector by n
    @returns vector
*/
vector.multiply = function(vec, n) {
    let nVector = new mp.Vector3(vec.x, vec.y, vec.z);
    nVector.x = vec.x * n;
    nVector.y = vec.y * n;
    nVector.z = vec.z * n;
    return nVector;
}
/*
    calc 3d(x,y,z) dist to vector
    @returns float
*/
vector.dist = function(to) {
    let a = this.x - to.x;
    let b = this.y - to.y;
    let c = this.z - to.z;
    return Math.sqrt(a * a + b * b + c * c);
}

/*
    calc 2d(x,y) dist to vector
    @returns float
*/
vector.dist2d = function(to) {
    let a = this.x - to.x;
    let b = this.y - to.y;
    return Math.sqrt(a * a + b * b);
}
/*
    get offset from Vector
    @returns vector
*/
vector.getOffset = function(to) {
    let x = this.x - to.x;
    let y = this.y - to.y;
    let z = this.z - to.z;
    return new mp.Vector3(x, y, z);
}

/*
   return crossproduct of vector
    @returns vector
*/
vector.cross = function(to) {
    let vector = new mp.Vector3(0, 0, 0);
    vector.x = this.y * to.z - this.z * to.y;
    vector.y = this.z * to.x - this.x * to.z;
    vector.z = this.x * to.y - this.y * to.x;
    return vector;
}
/*
    normalize vector
    @returns vector
*/
vector.normalize = function(vec) {
    let vectorr = new mp.Vector3(0, 0, 0);
    let mag = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    vectorr.x = vec.x / mag;
    vectorr.y = vec.y / mag;
    vectorr.z = vec.z / mag;
    return vectorr;
}
vector.normalizeD = function(vec, dist) {
    let vectorr = new mp.Vector3(0, 0, 0);
    let mag = dist;
    vectorr.x = vec.x / mag;
    vectorr.y = vec.y / mag;
    vectorr.z = vec.z / mag;
    return vectorr;
}
/*
    returns vector dot
    @returns float
*/
vector.dot = function(to) {
    return this.x * to.x + this.y * to.y + this.z * to.z;
}
/*
    returns vector length
    @returns float
*/
vector.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}

/*
    calculate angel from this vector to other vector
    @returns float
*/
vector.angle = function(to) {
    return Math.acos(vector.normalize(vector.dot(vector.normalize(normalize))));
}

/*
    gets ground vector for position (GTA Native)
    @returns vector
*/
vector.ground = function(vectorr) {
    let nVector = new mp.Vector3(vectorr.x, vectorr.y, vectorr.z);
    let z = mp.game.gameplay.getGroundZFor3dCoord(nVector.x, nVector.y, nVector.z, 0, false)
    let z1 = mp.game.gameplay.getGroundZFor3dCoord(nVector.x + 0.01, nVector.y + 0.01, nVector.z, 0, false)
    let z2 = mp.game.gameplay.getGroundZFor3dCoord(nVector.x - 0.01, nVector.y - 0.01, nVector.z, 0, false)
    nVector.z = z;
    if ((z + 0.1 < z1) || (z + 0.1 < z2)) {
        if (z1 < z2) {
            nVector.z = z2;
        } else {
            nVector.z = z1;
        }
    }
    return nVector;
}

/*
    gets ground vector for position (raycast)
    @returns vector
*/
vector.ground2 = function(ignore) {
    let nVector = new mp.Vector3(this.x, this.y, this.z);
    let r = mp.raycasting.testPointToPoint(nVector.add(0, 0, 1), nVector.sub(0, 0, 100), ignore, (1 | 16));
    if ((r) && (r.position)) {
        nVector = mp.vector(r.position);
    }
    return nVector;
}
/*
    sub x,y,z from vector
    @returns vector
*/
vector.sub = function(x, y, z) {
    return new mp.Vector3(this.x - x, this.y - y, this.z - z);
};
/*
    add x,y,z to vector
    @returns vector
*/
vector.add = function(x, y, z) {
    return new mp.Vector3(this.x + x, this.y + y, this.z + z);
};
/*
    check if point is inside array of points
    @returns bool
*/
vector.insidePolygon = function(polygon) {
    let x = this.x,
        y = this.y; 
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i][0],
            yi = polygon[i][1];
        let xj = polygon[j][0],
            yj = polygon[j][1];
        let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};
export default vector
/*
    converts vector to new vector (with vector class support, as ragemp is kindla ugly with prototyping)
    @returns vector
*/
mp.vector = function(vec) {
    return new mp.Vector3(vec.x, vec.y, vec.z);
}
/*
    shuffle array
    @returns array
*/
Array.prototype.shuffle = function() {
    let i = this.length;
    while (i) {
        let j = Math.floor(Math.random() * i);
        let t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}