
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
    var x = (3 + p.x) / 17.5 * w;
    var y;
    if (secondFloor) {
        $("#upstairsRadio").prop("checked", true);
        switchMapFloor(2);
        y = (5 - p.z) / 11 * h;
    } else {
        $("#downstairsRadio").prop("checked", true);
        switchMapFloor(1);
        y = (4 - p.z) / 11 * h;
    }

    x = Math.max(x, -w / 20);
    x = Math.min(x, w);
    y = Math.max(y, -h / 20);
    y = Math.min(y, h);
    $("#GPS").css("left", x);
    $("#GPS").css("bottom", y);
}