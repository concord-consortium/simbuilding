var score = 0;
var expectedAnswer = true;
var hotspot = -1;

function answer(userAnswer) {
    if (expectedAnswer === userAnswer)
        score++;
    $("#score").text(score);

    var question;
    var answers = [];
    if (newHotspot === 4) {
        question = "What did the builder do wrong?";
        anwers.push("Forgot to air seal the recessed");
        anwers.push("Forgot to air seal the attic correctly");
    }
    var div = $("#quizMulti");
    div.children()
    for (var i = 0; i < 4; i++)
        $("input[name=quiz" + i + "]").css("display: none");

    for (var i = 0; i < answers.length; i++) {
        var radio = $("input[name=quiz" + i + "]");
        radio.val(answers[i]);
        radio.fadeIn();
    }
}

function answer() {

}

function updateQuiz() {
    var newHotspot = pickHotspot(0, 0);
    if (hotspot !== newHotspot) {
        var div = $("#quiz");
        if (newHotspot === -1)
            div.fadeOut();
        else {
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
        }
        hotspot = newHotspot;
    }
}

function toggleQuizQuestion() {
    var div = $("#quizYesNo");
    if (div.css("display") === "none")
        div.fadeIn();
//    else
//        div.fadeOut();
}