var score = 0;
var hotspot = -1;
var quizInProgress = false;
var alreadyAnswered = [];

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
                filename = "window-good.jpg";
            else if (newHotspot === 6)
                filename = "window-bad.jpg";
            else if (newHotspot === 7)
                filename = "baseboard-good.jpg";
            else if (newHotspot === 8)
                filename = "baseboard-bad.jpg";
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
                filename = "ceiling-good.jpg";
            else if (newHotspot === 16)
                filename = "ceiling-bad.jpg";
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

function toggleQuizQuestion() {
    if (quizInProgress || alreadyAnswered.indexOf(hotspot) !== -1)
        return;
    var div = $("#quizYesNo");
    if (div.css("display") === "none")
        div.fadeIn();
//    else
//        div.fadeOut();
}