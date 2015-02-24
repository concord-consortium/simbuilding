var score = 0;
var hotspot = -1;
var quizInProgress = false;
var alreadyAnswered = [];

function answer(userAnswer) {
    var expectedAnswer;
    switch (hotspot) {
        case 3:
            expectedAnswer = false;
            break;
        case 4:
            expectedAnswer = true;
            break;
    }

    quizInProgress = true;

    $("#quizYesNo").hide();

    if (expectedAnswer === userAnswer) {
        score++;
        $("#score").text(score);
        if (expectedAnswer === false) {
            $("#quizCorrect").fadeIn();
            alreadyAnswered.push(hotspot);
            return;
        }
    } else {
        $("#quizIncorrect").fadeIn();
        alreadyAnswered.push(hotspot);
        return;
    }

    $("#quizMulti").fadeIn();
    $("input[name=answer]").hide();
    $("label").hide();

    var question;
    var answers = [];
    if (hotspot === 3) {
        question = "What did the builder do wrong?";
        answers.push("Forgot to air seal the recessed");
        answers.push("Forgot to air seal the attic correctly");
    } else if (hotspot === 4) {
        question = "What did the builder do wrong?";
        answers.push("Forgot to air seal the recessed");
        answers.push("Forgot to air seal the attic correctly");
    }

    $("#quizMulti p").text(question);

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
            div.css("background-image", "url(resources/textures/" + filename + ")");
            div.fadeIn();
            if (alreadyAnswered.indexOf(newHotspot) !== -1)
                $("#quizAlreadyChecked").show();
        }
    }
}

function toggleQuizQuestion() {
    if (quizInProgress)
        return;
    var div = $("#quizYesNo");
    if (div.css("display") === "none")
        div.fadeIn();
//    else
//        div.fadeOut();
}