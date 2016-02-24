/* global camControl */

var step;
var tutorial = [
    "Welcome to SimBuilding Tutorial<br/><br/>The first thing you need to do is get familiar with the navigation.<br/><br/>To walk forward press the Up Arrow key or the W key on your keyboard.",
    "To walk backward press the Down Arrow key or the S key on your keyboard.",
    "Now to look around use the Right and Left arrow keys. Try it now.",
    "Now to look around use the Right and Left arrow keys. Try it now.",
    "You can also use your mouse to look around. Click and drag your mouse to look around now.",
    "The doors of the house will open automatically when you get close to them. Walk toward the front door, wait for it to open, then walk inside the house.",
    "There is a red toolbox on the lower right corner of your screen. Click on it to open.",
    "There are 3 tools available to you. To learn more about them, hover your mouse over each of them and read their description.",
    "Select IR Camera tool by clicking on it. When IR Camera is on, you can see white HotSpots on various parts of the house such as walls and windows. Find one such HotSpot and point the camera to it.",
    "You can now see the IR image of this part of the house on the IR Camera screen. On left side you see a question along with 3 possible answers. If you are not sure about the answer, click on the Hint button for additional information. When you're ready, click on an answer. If you're correct, the score will increase by one. Otherwise the score will be reduced.",
    "Congradulation you have successfully completed the tutorial. Now continue the game by walking around the house and discovering new HotSpots. Good luck!"
];

function startTutorial() {
    tutorialMode = true;
    step = 0;
    finishedFirstPart = false;
    $("#welcome").hide();
    $("#tutorial").html(tutorial[step]);
    $("#tutorial").delay(2000).fadeIn();
    startGame();
}

function tutorialStep(finishedStep) {
    if (finishedStep === step) {
        step++;
        if (tutorial[step] !== $("#tutorial").html()) {
            $("#tutorial").delay(1000).fadeOut();
            $('#tutorial').delay(1000).queue(function (n) {
                $("#tutorial").html(tutorial[step]);
                $("#tutorial").fadeIn();
                if (step === tutorial.length - 1)
                    $("#tutorial").delay(5000).fadeOut();
                n();
            });
        }
    }
}

function popupToolDescription(tool) {
    if (tool === -1)
        $("#tutorialToolDescription").hide();
    else {
        if (tool === 0)
            $("#tutorialToolDescription").html("IR Camera:<br/>This tool allows you to see the infra-red images of various parts of the house. The yellow shade indicates a hot surface and the purple shade indicates a cold surface. Use it to identify in which areas the cold outside air is leaking into the house.");
        else if (tool === 1)
            $("#tutorialToolDescription").html("Moisture Meter:<br/>This tool allows you to see the moisture level of various parts of the house. 100% means fully wet and 0% means fully dry. Use it to identify in which areas the moisture is leaking into the room from outside or from upper floors.");
        else if (tool === 2)
            $("#tutorialToolDescription").html("Sensor:<br/>This tool allows you to see the temperature and moisture levels during the course of the day.");
        $("#tutorialToolDescription").show();
        tutorialStep(7);
    }

}