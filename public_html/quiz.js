var score = 0;
var hotspot = -1;
var quizInProgress = false;
var alreadyAnswered = [];
var hotSpotsRoot;
var hotSpotsHidden;

function answer(userAnswer) {
    var expectedAnswer;
    if (hotspot > 2 && hotspot % 2 === 0)
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
    var newHotspot = pickHotspot(0, 0);
    if (hotspot !== newHotspot) {
        hotspot = newHotspot;
        var div = $("#quiz");
        if (newHotspot === -1) {
            quizInProgress = false;
            div.fadeOut();
        } else {
            $("[id^=quiz]").hide();
            var filename;
            if (newHotspot === 1)
                filename = "fireplace.jpg";
            else if (newHotspot === 2)
                filename = "stove.jpg";
            else if (newHotspot === 3)
                filename = "light-good.png";
            else if (newHotspot === 4)
                filename = "light-bad.png";
            else if (newHotspot === 5)
                filename = "window-1g.jpg";
            else if (newHotspot === 6)
                filename = "window-1b.jpg";
            else if (newHotspot === 7)
                filename = "baseboard-1g.jpg";
            else if (newHotspot === 8)
                filename = "baseboard-1b.jpg";
            else if (newHotspot === 9)
                filename = "wall-1g.jpg";
            else if (newHotspot === 10)
                filename = "wall-1b.jpg";
            else if (newHotspot === 11)
                filename = "under-sink-good.jpg";
            else if (newHotspot === 12)
                filename = "under-sink-bad.jpg";
            else if (newHotspot === 13)
                filename = "tub-good.jpg";
            else if (newHotspot === 14)
                filename = "tub-bad.jpg";
            else if (newHotspot === 15)
                filename = "ceiling-1g.jpg";
            else if (newHotspot === 16)
                filename = "ceiling-1b.jpg";
            else if (newHotspot === 17)
                filename = "attic-hatch-good.jpg";
            else if (newHotspot === 18)
                filename = "attic-hatch-bad.jpg";
            else if (newHotspot === 19)
                filename = "wall-2g.jpg";
            else if (newHotspot === 20)
                filename = "wall-2b.jpg";
            else if (newHotspot === 21)
                filename = "wall-3g.jpg";
            else if (newHotspot === 22)
                filename = "wall-3b.jpg";
            div.css("background-image", "url(resources/textures/" + filename + ")");
            div.fadeIn();
            if (alreadyAnswered.indexOf(newHotspot) !== -1)
                $("#quizAlreadyChecked").show();
        }
    }
}

function initHotspots() {
    hotSpotsRoot = new THREE.Object3D();
    scene.add(hotSpotsRoot);
    var hotSpotsVisible = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsVisible);
    hotSpotsHidden = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsHidden);

    var geom = new THREE.SphereGeometry(0.1, 20, 20);
    var whiteMaterial = new THREE.MeshBasicMaterial();

    initHotspotSingle(0, 4, 6, -5.3, geom, whiteMaterial);
    initHotspotSingle(1, 14.5, 0.8, -2.8, geom, whiteMaterial);
    initHotspotSingle(2, 1.5, 1.2, -3.61, geom, whiteMaterial);
    // Windows
    initHotspotSingle(6, 4.4, 1.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 6.45, 1.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 10.53, 1.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 12.57, 1.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 4.4, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 6.45, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 8.45, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 10.53, 4.8, 4.2, geom, whiteMaterial);
    initHotspotSingle(6, 12.57, 4.8, 4.2, geom, whiteMaterial);
    // Baseboard
    initHotspotSingle(8, 3.15, 0.4, 3.5, geom, whiteMaterial);
    initHotspotSingle(7, 3.7, 0.4, -0.19, geom, whiteMaterial);
    initHotspotSingle(7, 13.85, 0.4, 0.5, geom, whiteMaterial);
    initHotspotSingle(8, 13.85, 0.4, -4.7, geom, whiteMaterial);
    initHotspotSingle(7, 13, 0.4, -0.25, geom, whiteMaterial);

    initHotspotSingle(8, 3.15, 3.45, 3.5, geom, whiteMaterial);
    initHotspotSingle(7, 13.85, 3.45, 0, geom, whiteMaterial);
    initHotspotSingle(8, 13.85, 3.45, -4.7, geom, whiteMaterial);
    // Wall
    initHotspotSingle(9, 3.15, 2.5, 2, geom, whiteMaterial);
    initHotspotSingle(10, 13.85, 2.5, 2, geom, whiteMaterial);
    initHotspotSingle(19, 4.4, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(20, 6.45, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(21, 10.53, 0.6, 4.2, geom, whiteMaterial);
    initHotspotSingle(22, 12.57, 0.6, 4.2, geom, whiteMaterial);

    // Under kitchen sink
    initHotspotSingle(12, 2.9, 0.7, -4.8, geom, whiteMaterial);
    // Tub
    initHotspotSingle(14, 2.1, 3.8, -4.3, geom, whiteMaterial);
    // Ceiling
    initHotspotSingle(16, 6.45, 5.8, 2, geom, whiteMaterial);
    initHotspotSingle(16, 11.5, 5.7, 2.5, geom, whiteMaterial);
    // Attic hatch
    initHotspotSingle(17, 10, 5.8, -1, geom, whiteMaterial);


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
}

function initHotspotSingle(id, x, y, z, geometry, material) {
    var hotSpot = new THREE.Mesh(geometry, material);
    hotSpot.userData.id = id;
    hotSpot.position.set(x, y, z);
    hotSpotsHidden.add(hotSpot);
}

function toggleQuizQuestion() {
    if (quizInProgress || alreadyAnswered.indexOf(hotspot) !== -1)
        return;
    var div = $("#quizYesNo");
    if (div.css("display") === "none")
        div.fadeIn();
//    else
//        div.fadeOut();
}