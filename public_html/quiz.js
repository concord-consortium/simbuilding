var score = 0;
var hotspot = -1;
var quizInProgress = false;

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

    if (expectedAnswer === userAnswer) {
        score++;
        $("#score").text(score);
    }

    $("#quizYesNo").hide();
    if (expectedAnswer === false)
        return;

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
    if (hotspot === 3)
        expectedAnswer = 0;

    if ($("input[id=quiz" + expectedAnswer + "]").is(':checked')) {
        score++;
        $("#score").text(score);
    }

    $("#quizMulti").fadeOut();
}

function updateQuiz() {
    var selectedHotspot = pickHotspot(0, 0);
    if (hotspot !== selectedHotspot) {
        var div = $("#quiz");
        if (selectedHotspot === -1)
            div.fadeOut();
        else {
            var filename;
            if (selectedHotspot === 1)
                filename = "fireplace.jpg";
            else if (selectedHotspot === 2)
                filename = "stove.jpg";
            else if (selectedHotspot === 3)
                filename = "light-good.png";
            else if (selectedHotspot === 4)
                filename = "light-bad.png";
            div.css("background-image", "url(resources/textures/" + filename + ")");
            div.fadeIn();
        }

        hotspot = selectedHotspot;

        if (hotspot === -1) {
            $("[id^=quiz]").fadeOut();
            quizInProgress = false;
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