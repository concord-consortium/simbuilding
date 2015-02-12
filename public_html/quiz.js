var score = 0;
var expectedAnswer = true;
var hotspot = -1;

function answer(userAnswer) {
    if (expectedAnswer === userAnswer)
        score++;
    $("#score").text(score);
}

function updateQuiz() {
    var newHotspot = pickHotspot(0, 0);
    if (hotspot !== newHotspot) {
        var div = $("#quiz");
        if (newHotspot === -1)
            div.fadeOut();
        else {
            if (newHotspot === 1)
                div.css("background-image", "url(resources/textures/fireplace.jpg)");
            else if (newHotspot === 2)
                div.css("background-image", "url(resources/textures/stove.jpg)");
            div.fadeIn();
        }
        hotspot = newHotspot;
    }
}

function toggleQuizQuestion() {
    var div = $("#quizQuestion");
    if (div.css("display") === "none")
        div.fadeIn();
    else
        div.fadeOut();
}