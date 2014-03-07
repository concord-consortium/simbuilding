SIM.UNIT_Y = new THREE.Vector3(0, 1, 0);

SIM.isEqual = function(a, b) {
    if (a.distanceTo(b) < 0.01)
        return true;
    else
        return false;
};

SIM.angleBetween = function(a, b, n) {
    return Math.atan2(b.dot(n.clone().cross(a)), b.dot(a));
};