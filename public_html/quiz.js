var score = 0;
var expectedAnswer = true;

function answer(userAnswer) {
    if (expectedAnswer === userAnswer)
        score++;
    $("#score").text(score);
}