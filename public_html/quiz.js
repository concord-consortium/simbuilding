/* global THREE, scene, blowdoorMode, selectedTool */

"use strict";
var score = 0;
var found = 0;
var hotspot = undefined;
var quizInProgress = false;
var alreadyAnswered = [];
var hotSpotsRoot;
var hotSpotsHidden;
var quizData;
var whiteMaterial = new THREE.MeshBasicMaterial();
var greyMaterial = new THREE.MeshBasicMaterial({color: 0x555555});

function initQuiz() {
    $.getJSON('scenarios.json', function (data) {
        quizData = data;
    });
}

function answer(userAnswer) {
    var expectedAnswer;
    if (hotspot.indexOf("g", hotspot.length - 1) === -1)
        expectedAnswer = true;
    else
        expectedAnswer = false;
    quizInProgress = true;
    $("#quizYesNo").hide();
    if (expectedAnswer === userAnswer) {
        if (expectedAnswer === false) {
            score++;
            $("#score").text(score);
            $("#quizCorrect").fadeIn();
            alreadyAnswered.push(hotspot);
            return;
        }
    } else {
        $("#quizIncorrect").fadeIn();
        alreadyAnswered.push(hotspot);
        return;
    }

    var question;
    var answers = [];
    if (hotspot === 4) {
        question = "What did the builder do wrong?";
        answers.push("Forgot to air seal the recessed");
        answers.push("Forgot to air seal the attic correctly");
    } else if (hotspot === 5) {
        question = "What did the builder do wrong?";
        answers.push("Forgot to air seal the recessed");
        answers.push("Forgot to air seal the attic correctly");
    } else {
        score++;
        $("#score").text(score);
        $("#quizCorrect").fadeIn();
        alreadyAnswered.push(hotspot);
        return;
    }

    $("#quizMulti p").text(question);
    $("#quizMulti").fadeIn();
    $("input[name=answer]").hide();
    $("label").hide();
    for (var i = 0; i < answers.length; i++) {
        var radio = $("input[id=quiz" + i + "]");
        radio.show();
        var label = $("input[id=quiz" + i + "] + label");
        label.text(answers[i]);
        label.show();
    }
}

function answerMulti() {
    var expectedAnswer;
    switch (hotspot) {
        case 4:
            expectedAnswer = 0;
            break;
    }

    $("#quizMulti").hide();
    if ($("input[id=quiz" + expectedAnswer + "]").is(':checked')) {
        score++;
        $("#score").text(score);
        $("#quizCorrect").fadeIn();
    } else
        $("#quizIncorrect").fadeIn();
    alreadyAnswered.push(hotspot);
}

function updateQuiz() {
    var y = 0;
    if (selectedTool === 1)
        y = 0.5;
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
        var selectedQuizData;
        for (var i = 0; i < quizData.length && !selectedQuizData; i++)
            if (quizData[i].ID === hotspot.userData.id)
                selectedQuizData = quizData[i];
        if (selectedTool === 0) {
            $("#question").text(selectedQuizData.Question);
            if (alreadyAnswered[hotspot.id]) {
                $("#lastAnswer").show();
                $("#lastAnswer").html("(Your last answer is <span style='color: " + (alreadyAnswered[hotspot.id].Correct ? "green'>" : "red'>") + (alreadyAnswered[hotspot.id].Correct ? "correct" : "incorrect") + "</span>)");
            } else
                $("#lastAnswer").hide();
            $("#answers").empty();
            for (var i = 0; i < selectedQuizData.Answers.length; i++) {
                var answer = selectedQuizData.Answers[i].Answer;
                var answerTag = jQuery('<input/>', {
                    type: 'radio',
                    id: answer
                });
                if (alreadyAnswered[hotspot.id] && answer === alreadyAnswered[hotspot.id].Answer)
                    answerTag.attr("checked", "checked");
                answerTag.appendTo('#answers');
                var labelTag = jQuery('<label/>', {
                    for : answer
                });
                labelTag.text(answer);
                labelTag.appendTo('#answers');

                answerTag.click(selectedQuizData.Answers[i], function (e) {
                    $("#quizQuestionAnswers").hide();
                    if (!alreadyAnswered[hotspot.id])
                        $("#found").text("Found: " + ++found + " / Total: " + hotSpotsHidden.children.length);
                    alreadyAnswered[hotspot] = e.data;
                    var resultDiv;
                    if (e.data.Correct) {
                        resultDiv = $("#quizCorrect");
                        score++;
                        $("#score").css("background-color", "green");
                        for (var i = 0; i < hotSpotsHidden.children.length; i++)
                            if (hotSpotsHidden.children[i] === hotspot) {
                                hotSpotsHidden.children[i].material = greyMaterial;
                                break;
                            }
                    } else {
                        score--;
                        $("#score").css("background-color", "red");
                        resultDiv = $("#quizIncorrect");
                    }
                    $("#score").animate({
                        opacity: 0.25
                    }, 1000, function () {
                        $("#score").text("Score: " + score);
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
            if (alreadyAnswered.indexOf(hotspot.id) !== -1)
                $("#quizAlreadyChecked").show();
            else
                $("#quizQuestionAnswers").delay(1000).fadeIn();
        } else if (selectedTool === 1) {
            $("#moisture-value").text(selectedQuizData.Moisture ? (selectedQuizData.Moisture + ".0") : "");
        }
    }
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
    var hotSpotsVisible = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsVisible);
    hotSpotsHidden = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsHidden);
    var geom = new THREE.SphereGeometry(0.1, 20, 20);
    // Windows
//    initHotspotSingle("window-1g", 4.4, 2.35, 4.2, geom, whiteMaterial);
    initHotspotSingle(24, 4.4, 2.35, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-1b", 6.45, 2.35, 4.2, geom, whiteMaterial);
    initHotspotSingle(23, 6.45, 2.35, 4.2, geom, whiteMaterial);
    initHotspotSingle(26, 10.53, 2.5, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-2g", 10.53, 2.5, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-5g", 10.9, 0.9, 4.2, geom, whiteMaterial);
    initHotspotSingle(30, 10.9, 0.9, 4.2, geom, whiteMaterial);
    initHotspotSingle("window-2b", 12.57, 2.5, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-5b", 13, 0.9, 4.2, geom, whiteMaterial);
    initHotspotSingle(29, 13, 0.9, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-3g", 4.4, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(2, 4.4, 4.8, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-3b", 6.45, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(1, 6.45, 4.8, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-4g", 8.45, 5.3, 4.2, geom, whiteMaterial);
    initHotspotSingle(28, 8.45, 5.3, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-4b", 10.53, 5.3, 4.2, geom, whiteMaterial);
    initHotspotSingle(27, 10.53, 5.3, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-1g", 12.57, 5.3, 4.2, geom, whiteMaterial);
    initHotspotSingle(25, 12.57, 5.3, 4.2, geom, whiteMaterial);
//    initHotspotSingle("window-1g", 12.57, 2.35, -5.5, geom, whiteMaterial);
//    initHotspotSingle("window-1g", 12.57, 5.3, -5.5, geom, whiteMaterial);
//    initHotspotSingle("window-1g", 8.97, 2.35, -5.5, geom, whiteMaterial);
//    initHotspotSingle("window-1g", 8.97, 5.3, -5.5, geom, whiteMaterial);
    initHotspotSingle(24, 12.57, 2.35, -5.5, geom, whiteMaterial);
    initHotspotSingle(24, 12.57, 5.3, -5.5, geom, whiteMaterial);
    initHotspotSingle(24, 8.97, 2.35, -5.5, geom, whiteMaterial);
    initHotspotSingle(24, 8.97, 5.3, -5.5, geom, whiteMaterial);
//
    // Baseboard
//    initHotspotSingle("baseboard-1b", 3.15, 0.4, 3.5, geom, whiteMaterial);
    initHotspotSingle(5, 3.15, 0.4, 3.5, geom, whiteMaterial);
//    initHotspotSingle("baseboard-1g", 3.7, 0.4, -0.19, geom, whiteMaterial);
    initHotspotSingle(6, 3.7, 0.4, -0.19, geom, whiteMaterial);
//    initHotspotSingle("baseboard-1g", 13.85, 0.4, 0.5, geom, whiteMaterial);
    initHotspotSingle(6, 13.85, 0.4, 0.5, geom, whiteMaterial);
//    initHotspotSingle("baseboard-1b", 13.85, 0.4, -4.7, geom, whiteMaterial);
//    initHotspotSingle("baseboard-1b", 13.85, 3.45, 0, geom, whiteMaterial);
    initHotspotSingle(5, 13.85, 0.4, -4.7, geom, whiteMaterial);
    initHotspotSingle(5, 13.85, 3.45, 0, geom, whiteMaterial);
//    initHotspotSingle("baseboard-1g", 13, 0.4, -0.25, geom, whiteMaterial);
//    initHotspotSingle("baseboard-1g", 3.15, 3.45, 3.5, geom, whiteMaterial);
//    initHotspotSingle("baseboard-1g", 13.85, 3.45, -4.7, geom, whiteMaterial);
    initHotspotSingle(6, 13, 0.4, -0.25, geom, whiteMaterial);
    initHotspotSingle(6, 3.15, 3.45, 3.5, geom, whiteMaterial);
    initHotspotSingle(6, 13.85, 3.45, -4.7, geom, whiteMaterial);
    // Wall
//    initHotspotSingle("wall-1g", 3.15, 2.5, 2, geom, whiteMaterial);
    initHotspotSingle(14, 3.15, 2.5, 2, geom, whiteMaterial);
//    initHotspotSingle("wall-1b", 13.85, 2.5, 2, geom, whiteMaterial);
    initHotspotSingle(13, 13.85, 2.5, 2, geom, whiteMaterial);
//    initHotspotSingle("wall-2g", 4.4, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(16, 4.4, 0.6, 4.2, geom, whiteMaterial);
//    initHotspotSingle("wall-2b", 6.45, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(15, 6.45, 0.6, 4.2, geom, whiteMaterial);
//    initHotspotSingle("wall-2g", 10.53, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(16, 10.53, 0.6, 4.2, geom, whiteMaterial);
//    initHotspotSingle("wall-2b", 12.57, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(15, 12.57, 0.6, 4.2, geom, whiteMaterial);
//    initHotspotSingle("wall-3g", 3.15, 3, 0.2, geom, whiteMaterial);
    initHotspotSingle(18, 13.85, 3, -0.5, geom, whiteMaterial);
//    initHotspotSingle("wall-4g", 13, 4, 0.5, geom, whiteMaterial);
    initHotspotSingle(20, 13, 4, 0.5, geom, whiteMaterial);
//    initHotspotSingle("wall-4b", 9.9, 4, -4.5, geom, whiteMaterial);
    initHotspotSingle(19, 9.9, 4, -4.5, geom, whiteMaterial);
//    initHotspotSingle("wall-5g", 12, 3, -0.25, geom, whiteMaterial);
    initHotspotSingle(22, 12, 3, -0.25, geom, whiteMaterial);
//    initHotspotSingle("wall-5b", 3.15, 5, 1, geom, whiteMaterial);
    initHotspotSingle(21, 3.15, 5, 1, geom, whiteMaterial);
    // Ceiling
//    initHotspotSingle("ceiling-1b", 3.15, 5.8, 3.3, geom, whiteMaterial);
    initHotspotSingle(7, 3.15, 5.8, 3.3, geom, whiteMaterial);
//    initHotspotSingle("ceiling-1g", 13.85, 5.7, 1.3, geom, whiteMaterial);
    initHotspotSingle(8, 13.85, 5.7, 1.3, geom, whiteMaterial);
//    initHotspotSingle("ceiling-2g", 13.2, 5.7, 4.2, geom, whiteMaterial);
    initHotspotSingle(10, 13.2, 5.7, 4.2, geom, whiteMaterial);
//    initHotspotSingle("ceiling-2b", 8.9, 5.7, 4.2, geom, whiteMaterial);
    initHotspotSingle(9, 8.9, 5.7, 4.2, geom, whiteMaterial);
    // Attic hatch
//    initHotspotSingle("attic-1b", 10, 5.8, -1, geom, whiteMaterial);
    initHotspotSingle(3, 10, 5.8, -1, geom, whiteMaterial);
//    initHotspotSingle("attic-1g", 3.65, 5.8, 1, geom, whiteMaterial);
    initHotspotSingle(4, 3.65, 5.8, 1, geom, whiteMaterial);
    var shadeMaterial = new THREE.MeshPhongMaterial();
    shadeMaterial.emissive = new THREE.Color(0x555555);
    var hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 20, 1), shadeMaterial);
    hotSpot.userData.id = 3;
    hotSpot.position.set(8.2, 3, 1);
    hotSpotsVisible.add(hotSpot);
    var hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 20, 1), shadeMaterial);
    hotSpot.userData.id = 4;
    hotSpot.position.set(10, 3, -2.8);
    hotSpotsVisible.add(hotSpot);

    $("#found").text("Found: 0 / Total: " + hotSpotsHidden.children.length);
}

function initHotspotSingle(id, x, y, z, geometry, material) {
    var hotSpot = new THREE.Mesh(geometry, material);
    hotSpot.userData.id = id;
    hotSpot.position.set(x, y, z);
    hotSpotsHidden.add(hotSpot);
}
