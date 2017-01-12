/* global camControl, houseModel, atticModel */

function toggleMap() {
    $("#map").fadeToggle();
    tutorialStep(10);
}

function switchMapFloor(floor) {
    $("#mapDownstairs").hide();
    $("#mapUpstairs").hide();
    $("#mapAttic").hide();
    if (floor === 1) {
        $("#mapDownstairs").show();
    } else if (floor === 2) {
        $("#mapUpstairs").show();
    } else if (floor === 3) {
        $("#mapAttic").show();
    }
}

function updateMapGPS() {
    var p = camControl.getObject().position;
    var secondFloor = p.y > 4;
    var w = $("#GPS").parent().width();
    var h = $("#GPS").parent().height();
    var left = (3 + p.x) / 17.5 * w;
    var top;
    if (localStorage.floor === "3") {
        if (!$("#atticRadio").prop("checked")) {
            $("#atticRadio").prop("checked", true);
            switchMapFloor(3);
        }
        left = (5.6 + p.x) / 11.3 * w;
        top = h - (3.2 - p.z) / 6 * h;
    } else if (secondFloor) {
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
    var isAttic = $("#atticRadio").is(':checked');
    atticModel.visible = isAttic;
    houseModel.visible = !isAttic;
    var linkA = $("#" + roomId);
    var left = linkA.position().left;
    var top = linkA.position().top;
    var w = $("#GPS").parent().width();
    var h = $("#GPS").parent().height();
    var x;
    var y;
    var secondFloor = $("#upstairsRadio").is(':checked');
    if (isAttic) {
        x = left * 11.3 / w - 5.6;
        y = -((h - top) * 6 / h - 3.2);
        localStorage.floor = "3";
    } else {
        x = left * 17.5 / w - 3;
        if (secondFloor) {
            y = -((h - top) * 11 / h - 5);
            localStorage.floor = "2";
        } else {
            y = -((h - top) * 11 / h - 4);
            localStorage.floor = "1";
        }
    }
    camControl.getObject().position.set(x, secondFloor ? 5 : 1, y);
    camControl.getObject().rotation.y = -Math.PI / 2.0;
    
    updateMapGPS();
    doRender = true;
}
