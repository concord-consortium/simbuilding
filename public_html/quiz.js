/* global THREE, scene, blowdoorMode, selectedTool, camControl */

"use strict";
var hotspot = undefined;
var quizInProgress = false;
var alreadyAnswered;
var hotSpotsRoot;
var hotSpotsHidden;
var hotSpotsVisible;
var quizData;
var whiteMaterial = new THREE.MeshBasicMaterial();
var greyMaterial = new THREE.MeshBasicMaterial({color: 0x555555});
var idCounter = 0;

function initQuiz() {
    if (localStorage.alreadyAnswered)
        alreadyAnswered = JSON.parse(localStorage.alreadyAnswered);
    else {
        alreadyAnswered = [];
        localStorage.score = 0;
        localStorage.found = 0;
    }
    $.ajaxSetup({
        async: false
    });
    $.getJSON('scenarios.json', function (data) {
        quizData = data;
    });
    $.ajaxSetup({
        async: true
    });
}

function resetQuiz() {
    localStorage.clear();

    for (var i = 0; i < hotSpotsHidden.children.length; i++)
        hotSpotsHidden.children[i].material = whiteMaterial;

    camControl.reset();
    initQuiz();
    updateFound();
    updateQuiz();
}

function updateQuiz() {
    var y = 0;
    var target;
    if (selectedTool === 1)
        target = "moisture-target";
    else if (selectedTool === 2)
        target = "temperature-target";

    if (target) {
        var bound = document.getElementById(target).getBoundingClientRect();
        var centerY = bound.top + bound.height / 2;
        y = -(centerY / window.innerHeight * 2.0 - 1);
    }

    var newHotspot = pickHotspot(0, y);
    if (newHotspot)
        if (!Number.isInteger(newHotspot.userData.id))
            newHotspot = undefined;

    if (hotspot === newHotspot)
        return;
    else if (!newHotspot) {
        hotspot = undefined;
        quizInProgress = false;
        $("#moisture-value").text("");
        $("#temperature-value").html("");
        $("#quizQuestionAnswers").stop(true, false).fadeOut();
        $("#quizCorrect").fadeOut();
        $("#quizIncorrect").fadeOut();
        $("#quizAlreadyChecked").fadeOut();
        $("#quizImage").fadeOut();
        $("#temperature-high").fadeOut();
        $("#temperature-low").fadeOut();
        $("#minimize").fadeOut();
    } else {
        hotspot = newHotspot;
        $("[id^=quiz]").hide();
        var selectedQuizData = findQuiz(hotspot.userData.quizID);
        if (selectedTool === 0) {
            $("#question").text(selectedQuizData.Question);
            if (alreadyAnswered[hotspot.userData.id]) {
                $("#lastAnswer").show();
                $("#lastAnswer").html("(Your last answer is <span style='color: " + (alreadyAnswered[hotspot.userData.id].Correct ? "green'>" : "red'>") + (alreadyAnswered[hotspot.userData.id].Correct ? "correct" : "incorrect") + "</span>)");
            } else
                $("#lastAnswer").hide();
            $("#answers").empty();
            for (var i = 0; i < selectedQuizData.Answers.length; i++) {
                var answer = selectedQuizData.Answers[i].Answer;
                var answerTag = jQuery('<input/>', {
                    type: 'radio',
                    id: answer
                });
                if (alreadyAnswered[hotspot.userData.id] && answer === alreadyAnswered[hotspot.userData.id].Answer)
                    answerTag.attr("checked", "checked");
                answerTag.appendTo('#answers');
                var labelTag = jQuery('<label/>', {
                    for : answer
                });
                labelTag.text(answer);
                labelTag.appendTo('#answers');

                answerTag.click(selectedQuizData.Answers[i], function (e) {
                    $("#quizQuestionAnswers").hide();
                    if (!alreadyAnswered[hotspot.userData.id]) {
                        localStorage.found++;
                        updateFound();
                    }
                    alreadyAnswered[hotspot.userData.id] = e.data;
                    localStorage.alreadyAnswered = JSON.stringify(alreadyAnswered);
                    var resultDiv;
                    if (e.data.Correct) {
                        resultDiv = $("#quizCorrect");
                        localStorage.score++;
                        $("#score").css("background-color", "green");
                        changeToGrey(hotspot.userData.id);
                    } else {
                        localStorage.score--;
                        $("#score").css("background-color", "red");
                        resultDiv = $("#quizIncorrect");
                    }
                    $("#score").animate({
                        opacity: 0.25
                    }, 1000, function () {
                        updateScore();
                    }).animate({
                        opacity: 1
                    }, 1000, function () {
                        $("#score").css("background-color", "black");
                    });
                    resultDiv.html("<br/>" + e.data.Feedback);
                    resultDiv.fadeIn();
                });
            }
            $("#answers").append("<br/><br/>");
            var tipTag = jQuery('<input/>', {
                type: "button",
                value: "Hint"
            });
            tipTag.appendTo('#answers');
            tipTag.click(selectedQuizData, function (e) {
                if (!$("#answers").children().last().is("p"))
                    $("#answers").append("<p>" + e.data.Tip + "</p>");
            });
            var filename;
            if (blowdoorMode)
                filename = selectedQuizData.ThermogramWithBlowerDoor;
            else
                filename = selectedQuizData.ThermogramWithoutBlowerDoor;
            $("#quizImage").attr("src", "resources/images/" + filename);
            $("#quizImage").fadeIn();
            $("#temperature-high").fadeIn();
            $("#temperature-low").fadeIn();
            $("#minimize").attr("value", "\u25B2");
            $("#minimize").delay(1000).fadeIn();
            if (alreadyAnswered.indexOf(hotspot.userData.id) !== -1)
                $("#quizAlreadyChecked").show();
            else
                $("#quizQuestionAnswers").delay(1000).fadeIn();
        } else if (selectedTool === 1) {
            $("#moisture-value").text(selectedQuizData.Moisture ? (selectedQuizData.Moisture + ".0") : "--");
        } else if (selectedTool === 2) {
            $("#temperature-value").text(selectedQuizData.Temperature ? (selectedQuizData.Temperature + ".0") : "--");
        }
    }
}

function findQuiz(id) {
    for (var i = 0; i < quizData.length; i++)
        if (quizData[i].ID === id)
            return quizData[i];
}

function toggleQuizMinimize() {
    var invisible = $("#quizQuestionAnswers").css("display") === "none";
    $("#minimize").attr("value", invisible ? "\u25B2" : "\u25BC");
    if (invisible)
        $("#quizQuestionAnswers").fadeIn();
    else
        $("#quizQuestionAnswers").fadeOut();
}

function initHotspots() {
    hotSpotsRoot = new THREE.Object3D();
    scene.add(hotSpotsRoot);
    hotSpotsVisible = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsVisible);
    hotSpotsHidden = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsHidden);
    var geom = new THREE.SphereGeometry(0.1, 20, 20);
    // Windows
    initHotspotSingle(24, 4.4, 2.35, 4.2, geom, whiteMaterial);
    initHotspotSingle(23, 6.45, 2.35, 4.2, geom, whiteMaterial);
    initHotspotSingle(23, 10.53, 2.5, 4.2, geom, whiteMaterial);
    initHotspotSingle(30, 10.9, 0.9, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-2b", 12.57, 2.5, 4.2, geom, whiteMaterial);
    initHotspotSingle(29, 13, 0.9, 4.2, geom, whiteMaterial);
    initHotspotSingle(2, 4.4, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(1, 6.45, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(28, 8.45, 5.3, 4.2, geom, whiteMaterial);
    initHotspotSingle(27, 10.53, 5.3, 4.2, geom, whiteMaterial);
    initHotspotSingle(25, 12.57, 5.3, 4.2, geom, whiteMaterial);
    initHotspotSingle(24, 12.57, 2.35, -5.5, geom, whiteMaterial);
    initHotspotSingle(24, 12.57, 5.3, -5.5, geom, whiteMaterial);
    initHotspotSingle(24, 8.97, 2.35, -5.5, geom, whiteMaterial);
    initHotspotSingle(24, 8.97, 5.3, -5.5, geom, whiteMaterial);
    // Baseboard
    initHotspotSingle(5, 3.15, 0.4, 3.5, geom, whiteMaterial);
    initHotspotSingle(6, 3.7, 0.4, -0.19, geom, whiteMaterial);
    initHotspotSingle(6, 13.85, 0.4, 0.5, geom, whiteMaterial);
    initHotspotSingle(5, 13.85, 0.4, -4.7, geom, whiteMaterial);
    initHotspotSingle(5, 13.85, 3.45, 0, geom, whiteMaterial);
    initHotspotSingle(6, 13, 0.4, -0.25, geom, whiteMaterial);
    initHotspotSingle(6, 3.15, 3.45, 3.5, geom, whiteMaterial);
    initHotspotSingle(6, 13.85, 3.45, -4.7, geom, whiteMaterial);
    // Wall
    initHotspotSingle(14, 3.15, 2.5, 2, geom, whiteMaterial);
    initHotspotSingle(13, 13.85, 2.5, 2, geom, whiteMaterial);
    initHotspotSingle(16, 4.4, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(15, 6.45, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(16, 10.53, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(15, 12.57, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(18, 13.85, 3, -0.5, geom, whiteMaterial);
//    initHotspotSingle("wall-4g", 13, 4, 0.5, geom, whiteMaterial);
    initHotspotSingle(19, 9.9, 4, -4.5, geom, whiteMaterial);
    initHotspotSingle(22, 12, 3, -0.25, geom, whiteMaterial);
    initHotspotSingle(21, 3.15, 5, 1, geom, whiteMaterial);
    // Ceiling
    initHotspotSingle(7, 3.15, 5.8, 3.3, geom, whiteMaterial);
    initHotspotSingle(8, 13.85, 5.7, 1.3, geom, whiteMaterial);
    initHotspotSingle(10, 13.2, 5.7, 4.2, geom, whiteMaterial);
    initHotspotSingle(9, 8.9, 5.7, 4.2, geom, whiteMaterial);
    // Attic hatch
    initHotspotSingle(3, 10, 5.8, -1, geom, whiteMaterial);
    initHotspotSingle(4, 3.65, 5.8, 1, geom, whiteMaterial);

    var shadeMaterial = new THREE.MeshPhongMaterial();
    shadeMaterial.emissive = new THREE.Color(0x555555);
    var hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 20, 1), shadeMaterial);
    hotSpot.userData.id = idCounter++;
    hotSpot.userData.quizID = 31;
    hotSpot.position.set(8.2, 3, 1);
    hotSpotsVisible.add(hotSpot);
    var hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 20, 1), shadeMaterial);
    hotSpot.userData.id = idCounter++;
    hotSpot.userData.quizID = 32;
    hotSpot.position.set(10, 3, -2.8);
    hotSpotsVisible.add(hotSpot);

    $("#found").text("Found: 0 / Total: " + hotSpotsHidden.children.length);
}

function initHotspotSingle(quizID, x, y, z, geometry, material) {
    if (!findQuiz(quizID))
        throw "Quiz id not found: " + quizID;
    var hotSpot = new THREE.Mesh(geometry, material);
    var id = idCounter++;
    hotSpot.userData.id = id;
    hotSpot.userData.quizID = quizID;
    hotSpot.position.set(x, y, z);
    if (alreadyAnswered[id])
        hotSpot.material = greyMaterial;
    hotSpotsHidden.add(hotSpot);
}

function changeToGrey(id) {
    for (var i = 0; i < hotSpotsHidden.children.length; i++)
        if (hotSpotsHidden.children[i].userData.id === id) {
            hotSpotsHidden.children[i].material = greyMaterial;
            break;
        }
}

function updateScore() {
    $("#score").text("Score: " + localStorage.score);
}

function updateFound() {
    $("#found").text("Found: " + localStorage.found + " / Total: " + hotSpotsHidden.children.length);
}

function exportQuiz() {
    var result = "Id,Grade,Quiz Question,Student Answer,\n";
    for (var i = 0; i < hotSpotsHidden.children.length; i++) {
        result += i + ",";
        var userData = hotSpotsHidden.children[i].userData;
        if (!alreadyAnswered[userData.id])
            result += ",";
        else
            result += alreadyAnswered[userData.id].Correct ? "Correct," : "Wrong,";
        result += findQuiz(userData.quizID).Question + ",";
        if (alreadyAnswered[userData.id])
            result += alreadyAnswered[userData.id].Answer + ",";
        result += "\n";
    }

    camControl.setEnabled(false);
    var filename = localStorage.prevFileName ? localStorage.prevFileName : 'quiz.csv';
    $('#save_to_disk_dialog').html('<div style="font-family: Arial; line-height: 30px; font-size: 90%;">Export quiz result as:<br><input type="text" id="save_filename" style="position: relative; z-index: 100; width: 260px;" value="' + filename + '">');
    $('#save_to_disk_dialog').dialog({
        resizable: false,
        modal: true,
        title: "Save",
        height: 220,
        width: 300,
        position: {
            my: 'center center',
            at: 'center center',
            of: window
        },
        buttons: {
            'OK': function () {
                $(this).dialog('close');
                var filename = document.getElementById('save_filename').value;
                var vpa = "text/json;charset=utf-8," + encodeURIComponent(result);
                var link = document.getElementById("invisible_link");
                link.download = filename;
                link.href = 'data:' + vpa;
                link.click();
                camControl.setEnabled(true);
            },
            'Cancel': function () {
                $(this).dialog('close');
                camControl.setEnabled(true);
            }
        }
    });

    return result;
}