
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

function updateMapGPS() {
    var p = camControl.getObject().position;
    var secondFloor = p.y > 4;
    var w = $("#GPS").parent().width();
    var h = $("#GPS").parent().height();
    if (secondFloor) {
        $("#upstairsRadio").prop("checked", true);
        switchMapFloor(2);
        $("#GPS").css("bottom", (5 - p.z) / 11 * h);
    } else {
        $("#downstairsRadio").prop("checked", true);
        switchMapFloor(1);
        $("#GPS").css("bottom", (4 - p.z) / 11 * h);
    }
    $("#GPS").css("left", (3 + p.x) / 17.5 * w);
}