/* global camControl, houseModel, atticModel */

function toggleMap() {
    $("#map").fadeToggle();
}

function switchMapFloor(floor) {
    if (floor === 1) {
        $("#mapUpstairs").hide();
        $("#mapDownstairs").show();
    } else if (floor === 2) {
        $("#mapDownstairs").hide();
        $("#mapUpstairs").show();
    } else if (floor === 3) {
        $("#mapUpstairs").hide();
        $("#mapDownstairs").hide();
        localStorage.floor = floor;
        houseModel.visible = false;
        atticModel.visible = true;
        camControl.resetAtticView();        
        doRender = true;
    }
}

function updateMapGPS() {
    if (localStorage.floor === "3")
        return;
    var p = camControl.getObject().position;
    var secondFloor = p.y > 4;
    var w = $("#GPS").parent().width();
    var h = $("#GPS").parent().height();
    var left = (3 + p.x) / 17.5 * w;
    var top;
    if (secondFloor) {
        $("#upstairsRadio").prop("checked", true);
        switchMapFloor(2);
        top = h - (5 - p.z) / 11 * h;
    } else {
        $("#downstairsRadio").prop("checked", true);
        switchMapFloor(1);
        top = h - (4 - p.z) / 11 * h;
    }

    left = Math.max(left, -w / 20);
    left = Math.min(left, w);
    top = Math.max(top, -h / 20);
    top = Math.min(top, h);
    $("#GPS").css("left", left);
    $("#GPS").css("top", top);
}

function moveToRoom(roomId) {
    atticModel.visible = false;
    houseModel.visible = true;
    var linkA = $("#" + roomId);
    var left = linkA.position().left;
    var top = linkA.position().top;
    var w = $("#GPS").parent().width();
    var h = $("#GPS").parent().height();
    var x = left * 17.5 / w - 3;
    var y;
    var secondFloor = $("#upstairsRadio").is(':checked');
    if (secondFloor) {
        y = -((h - top) * 11 / h - 5);
        localStorage.floor = "2";
    } else {
        y = -((h - top) * 11 / h - 4);
        localStorage.floor = "1";
    }
    camControl.getObject().position.set(x, secondFloor ? 5 : 1, y);
    updateMapGPS();
    doRender = true;
}
