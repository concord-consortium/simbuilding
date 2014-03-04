SIM.isEqual = function(a, b) {
    if (a.distanceTo(b) < 0.01)
        return true;
    else
        return false;
}