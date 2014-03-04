SIM.UNITY = new THREE.Vector3(0, 1, 0);
SIM.UNITZ = new THREE.Vector3(0, 0, 1);

SIM.isEqual = function(a, b) {
    if (a.distanceTo(b) < 0.01)
        return true;
    else
        return false;
};