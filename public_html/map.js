
function toggleMap() {
    $("#map").fadeToggle();
}

function switchMapFloor(floor) {
    if (floor === 1) {
        $("#mapUpstairs").hide();
        $("#mapDownstairs").show();
    } else {
        $("#mapDownstairs").hide();
        $("#mapUpstairs").show();
    }
}

