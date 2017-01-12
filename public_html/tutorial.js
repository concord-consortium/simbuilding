/* global camControl, hotSpotsHidden */

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
    "Select IR Camera tool by clicking on it. When IR Camera is on, you can see HotSpots on various parts of the house such as walls and windows. Find one such HotSpot and point the camera to it.",
    "You can now see the IR image of this part of the house on the IR Camera screen. On left side you see a question along with 3 possible answers. If you are not sure about the answer, click on the Hint button for additional information. When you're ready, click on an answer. If you're correct, the score will increase by one. Otherwise the score will be reduced.",
    "To see where you are, you can use the map. The red dot on the map indicates your current position. To open the map, click on the map button located on the right side of the screen.",
    "You can jump to another room by clicking on the room name on the map. Click on Kitchen to jump to it now.",
    "You can switch to another floor by clicking Upstairs or Attic. Click on Upstairs now.",
    "Now that the Upstairs floormap is displayed you can jump to one of its rooms by clicking on the name of that room. Click on Master Bedroom now."
];

function startTutorial() {
    tutorialMode = true;
    step = 0;
    finishedFirstPart = false;
    $("#welcome").hide();
    $("#tutorial").html(tutorial[step]);
    $("#tutorial").delay(2000).fadeIn();
    startGame();
    tutorial.push("Congratulations you have successfully completed the tutorial. Now continue the game by walking around the house and discovering new HotSpots. There are " + hotSpotsHidden.children.length + " HotSpots in this house. Good luck!");
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
                    $("#tutorial").delay(15000).fadeOut();
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
            $("#tutorialToolDescription").html("IR Camera:<br/>This tool allows you to see the infrared images of various parts of the house. The red/yellow shade indicates a warmer surface and the purple/blue shade indicates a cooler surface. Use it to identify in which areas the cold outside air is leaking into the house.");
        else if (tool === 1)
            $("#tutorialToolDescription").html("Moisture Meter:<br/>This tool allows you to see the moisture level of various parts of the house. 100% means fully wet and 0% means fully dry. Use it to identify in which areas there is moisture on the surface or inside of the walls from leaks.");
        else if (tool === 2)
            $("#tutorialToolDescription").html("Sensor:<br/>This tool allows you to see the temperature and moisture levels during the course of the day.");
        else if (tool === 3)
            $("#tutorialToolDescription").html("Blower Door:<br/>This is a machine used to measure the airtightness of buildings. It can help locate air leakage sites in the building envelope. When looking at a hot spot using IR Camera, you can turn on the blower door to see if the IR image changes. If it changes then we probably have air leakage.");
        $("#tutorialToolDescription").show();
        tutorialStep(7);
    }

}