/* global THREE, hotSpotsHidden, hotSpotsRoot */

"use strict";

var UNIT_Y = new THREE.Vector3(0, 1, 0);
var NEG_UNIT_Y = new THREE.Vector3(0, -1, 0);

var clock;
var stats;
var camControl;
var renderer;
var composer, composerIR;
var camera;
var scene;
var sceneRoot;
var land;
var viewerHeight = 1.3;
var hoveredObject;
var doRender;
var firstRender = true;
var irMode = false;
var doorToBeOpened = [];
var doorToBeClosed = [];
var doors = [];
var collisionPartsWithoutDoors = [];
var renderPass, copyPass, colorifyPass;
var selectedTool = -1;
var blowdoorMode = false;
var showHotspots = false;
//var options, spawnerOptions, particleSystem;
//var tick = 0;

function startSimBuilding() {
    polyfill();
    clock = new THREE.Clock();
    stats = initStats();
    window.addEventListener('resize', handleWindowResize, false);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camControl = new THREE.PointerLockControls(camera);
    camControl.init();
    camControl.enabled = true;
    scene.add(camControl.getObject());

    renderer = new THREE.WebGLRenderer({antialias: false});
    renderer.setClearColor(0x062A78);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;

//    particleSystem = new THREE.GPUParticleSystem({
//        maxParticles: 250000
//    });
//    scene.add(particleSystem);

//    options = {
//        position: new THREE.Vector3(),
//        positionRandomness: .3,
//        velocity: new THREE.Vector3(),
//        velocityRandomness: .5,
//        color: 0xaa88ff,
//        colorRandomness: .2,
//        turbulence: .5,
//        lifetime: 2,
//        size: 5,
//        sizeRandomness: 1
//    };
//
//    spawnerOptions = {
//        spawnRate: 100,
//        horizontalSpeed: 1.5,
//        verticalSpeed: 1.33,
//        timeScale: 1
//    }

    initShaders();
    $("#WebGL-output").append(renderer.domElement);

    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('./resources/models/Yorktown.dae',
            function (houseModel) {
                houseModel.scene.traverse(function (child) {
                    if (child instanceof THREE.Mesh)
                        child.geometry.computeFaceNormals();
                });
                initScene(houseModel.scene);
                initLights();
                initQuiz();
                initHotspots();
                updateScore();
                updateFound();
                $("#progressPanel").fadeOut();
                doRender = true;
                setTimeout(render, 100);
            },
            function (callback) {
                $("#progress").attr("value", callback.loaded / callback.total);
            }
    );
}

function render() {
    var doRenderVal = doRender || camControl.needsUpdate() || doorToBeOpened.length !== 0 || doorToBeClosed.length !== 0;
    requestAnimationFrame(render);
    if (doRenderVal) {
        if (!firstRender)
            doRender = false;
        stats.update();
        var delta = clock.getDelta();
        if (camControl.needsUpdate())
            camControl.update(delta);
        if (!firstRender)
            enforceCameraGravity();
        firstRender = false;
        animateDoor();


//        var delta = clock.getDelta() * spawnerOptions.timeScale;
//        tick += delta;
//
//        if (tick < 0)
//            tick = 0;
//
//        if (delta > 0) {
//            options.position.x = Math.sin(tick * spawnerOptions.horizontalSpeed) * 20;
//            options.position.y = Math.sin(tick * spawnerOptions.verticalSpeed) * 10;
//            options.position.z = Math.sin(tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed) * 5;
//
//            for (var x = 0; x < spawnerOptions.spawnRate * delta; x++) {
//                // Yep, that's really it.  Spawning particles is super cheap, and once you spawn them, the rest of
//                // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
//                particleSystem.spawnParticle(options);
//            }
//        }
//
//        particleSystem.update(tick);




        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        camera.fov = 65;
        camera.aspect = window.innerWidth / window.innerHeight * 0.8;
        camera.updateProjectionMatrix();
        hotSpotsHidden.visible = showHotspots && selectedTool > 0;

        renderer.clear();
        composer.render(delta);

        if (irMode) {
            if ($("#tool-ircamera").css("opacity") === "1") {
                var rect = document.getElementById("tool-ircamera").getBoundingClientRect();
                renderer.setViewport(rect.left + rect.width * 0.10, 0 + rect.height * 0.20, rect.width * 0.8, rect.height * 0.7);
                camera.fov = 25;
                camera.aspect = 1;
                camera.updateProjectionMatrix();
                hotSpotsHidden.visible = showHotspots;

                composerIR.render(delta);
            } else
                doRender = true;
        }
    }
}

function initShaders() {
    renderPass = new THREE.RenderPass(scene, camera);
    copyPass = new THREE.ShaderPass(THREE.CopyShader);

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(copyPass);
    copyPass.renderToScreen = true;

    colorifyPass = new THREE.ShaderPass(THREE.ColorifyShader);
    colorifyPass.uniforms[ "color" ].value = new THREE.Color(0x00ff00);
    composerIR = new THREE.EffectComposer(renderer);
    composerIR.addPass(renderPass);
    composerIR.addPass(colorifyPass);
    composerIR.addPass(copyPass);
    copyPass.renderToScreen = true;
}

function initScene(houseModel) {
    var axis = new THREE.AxisHelper(20);
    scene.add(axis);
    sceneRoot = new THREE.Object3D();
    scene.add(sceneRoot);
    land = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial());
    land.rotation.x = -Math.PI / 2;
    land.position.y = -0.1;
    land.geometry.computeBoundingBox();
//    sceneRoot.add(land);
    collisionPartsWithoutDoors.push(land);

    sceneRoot.add(houseModel);
    houseModel.children[0].children.forEach(function (child) {
        if (child.children[0]) {
            var doorComponentName = child.children[0].name;
            var offset;
            if (doorComponentName === "Door")
                offset = new THREE.Vector3(0, 0, -2);
            else if (doorComponentName === "DoorOut")
                offset = new THREE.Vector3(38, 0, -2);
            else if (doorComponentName === "DoorGlass")
                offset = new THREE.Vector3(25, 0, -25);

            if (offset) {
                var door = child;
                doors.push(door);
                door.position.add(offset.clone().applyEuler(door.rotation));

                door.children.forEach(function (doorChild) {
                    doorChild.position.add(offset.negate());
                });

                if (Math.abs(door.rotation.y) < 0.0001) {
                    door.userData.startAngle = 0;
                    door.userData.endAngle = Math.PI / 2;
                } else {
                    door.userData.startAngle = -Math.PI / 2;
                    door.userData.endAngle = -Math.PI;
                }

                var reverse = door.name === "R";
                if (reverse) {
                    door.userData.endAngle = door.userData.startAngle - (door.userData.endAngle - door.userData.startAngle);
                }
            } else
                collisionPartsWithoutDoors.push(child);
        } else
            collisionPartsWithoutDoors.push(child);
    });
}

function initLights() {
    var light = new THREE.DirectionalLight();
    light.intensity = 0.3;
    light.position.set(0, -1, 0);
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0.4;
    light.angle = Math.PI / 2;
    light.position.set(5, 3, 2);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0;
    light.angle = Math.PI / 2;
    light.position.set(5, 5.8, 2);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0.4;
    light.angle = Math.PI / 2;
    light.position.set(12, 3, 2);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0;
    light.angle = Math.PI / 2;
    light.position.set(12, 5.8, 2);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0.4;
    light.angle = Math.PI / 2;
    light.position.set(11, 3, -3);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0.4;
    light.angle = Math.PI / 2;
    light.position.set(4, 3, -4);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0.2;
    light.angle = Math.PI / 2;
    light.position.set(12, 5.8, -4);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0.2;
    light.angle = Math.PI / 2;
    light.position.set(8, 5.8, -3.5);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1;
    light.exponent = 0;
    light.angle = Math.PI / 2;
    light.position.set(2.5, 5.8, -4.5);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0;
    light.angle = Math.PI / 2;
    light.position.set(-2, 3, 1);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);

    var light = new THREE.SpotLight();
    light.distance = 8;
    light.intensity = 1.5;
    light.exponent = 0.4;
    light.angle = Math.PI / 2.5;
    light.position.set(8.5, 4, 7);
    light.target.position.set(light.position.x, 0, light.position.z);
    light.target.updateMatrixWorld();
    scene.add(light);
}

function initStats() {
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    $("#Stats-output").append(stats.domElement);
    return stats;
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer)
        composer.setSize(window.innerWidth, window.innerHeight);
    doRender = true;
}

function pickHotspot(x, y) {
    if (!showHotspots)
        return undefined;
    var p = new THREE.Vector3(x, y, 0);
    p.unproject(camera);
    var position = camControl.getObject().position.clone();
    var direction = p.sub(position).normalize();
    var raycaster = new THREE.Raycaster(position, direction);
    var intersects = raycaster.intersectObject(scene, true);
    if (intersects.length > 0)
        return intersects[0].object;
    else
        return undefined;
}

function closestPoint(p1, v1, p2, v2) {
    var EPS = 0.0001;
    var p13;
    var d1343, d4321, d1321, d4343, d2121;
    var numer, denom;
    p13 = new THREE.Vector3().subVectors(p1, p2);
    if (Math.abs(v2.x) < EPS && Math.abs(v2.y) < EPS && Math.abs(v2.z) < EPS)
        return null;
    if (Math.abs(v1.length()) < EPS)
        return null;
    d1343 = p13.x * v2.x + p13.y * v2.y + p13.z * v2.z;
    d4321 = v2.x * v1.x + v2.y * v1.y + v2.z * v1.z;
    d1321 = p13.x * v1.x + p13.y * v1.y + p13.z * v1.z;
    d4343 = v2.x * v2.x + v2.y * v2.y + v2.z * v2.z;
    d2121 = v1.x * v1.x + v1.y * v1.y + v1.z * v1.z;
    denom = d2121 * d4343 - d4321 * d4321;
    if (Math.abs(denom) < EPS)
        return null;
    numer = d1343 * d4321 - d1321 * d4343;
    var mua = numer / denom;
    var pa = new THREE.Vector3(p1.x + mua * v1.x, p1.y + mua * v1.y, p1.z + mua * v1.z);
    return pa;
}

function enforceCameraGravity() {
    var camera = camControl.getObject();
    var raycaster = new THREE.Raycaster(camera.position, NEG_UNIT_Y);
    var intersects = raycaster.intersectObjects(collisionPartsWithoutDoors, true);
    if (intersects.length > 0)
        camera.position.y = intersects[0].point.y + viewerHeight;
}

function animateDoor() {
    if (doorToBeOpened.length !== 0)
        for (var i = 0; i < doorToBeOpened.length; i++) {
            var door = doorToBeOpened[i];
            var startAngle = door.userData.startAngle;
            var endAngle = door.userData.endAngle;
            if (door.rotation.y !== endAngle) {
                var isIncreasing = endAngle > startAngle;
                if (isIncreasing)
                    door.rotation.y = Math.min(endAngle, door.rotation.y + 0.1);
                else
                    door.rotation.y = Math.max(endAngle, door.rotation.y - 0.1);
                var index = doorToBeClosed.indexOf(door);
                if (index !== -1)
                    doorToBeClosed.splice(index, 1);
            } else {
                if (doorToBeClosed.indexOf(door) === -1)
                    doorToBeClosed.push(door);
                door.userData.doorTimeout = 100;
                var index = doorToBeOpened.indexOf(door);
                if (index !== -1)
                    doorToBeOpened.splice(index, 1);
            }
        }

    if (doorToBeClosed.length !== 0)
        for (var i = 0; i < doorToBeClosed.length; i++) {
            var door = doorToBeClosed[i];
            if (door.userData.doorTimeout > 0)
                door.userData.doorTimeout--;
            else {
                var startAngle = door.userData.endAngle;
                var endAngle = door.userData.startAngle;
                if (door.rotation.y !== endAngle) {
                    var isIncreasing = endAngle > startAngle;
                    if (isIncreasing)
                        door.rotation.y = Math.min(endAngle, door.rotation.y + 0.1);
                    else
                        door.rotation.y = Math.max(endAngle, door.rotation.y - 0.1);
                } else {
                    var index = doorToBeClosed.indexOf(door);
                    if (index !== -1)
                        doorToBeClosed.splice(index, 1);
                }
            }
        }
}

function toggleTool(tool) {
    hotspot = null;
    if (tool === 3) {
        blowdoorMode = !blowdoorMode;
        document.getElementById("fan").src = "resources/images/retrotec-" + (blowdoorMode ? "animated2.gif" : "still.gif");
        hotspot = null;
        updateQuiz();
    } else {
        selectedTool = tool;
        if (tool !== 0)
            $("#tool-ircamera-small").animate({opacity: 1});
        if (tool !== 1)
            $("#tool-moisture-small").animate({opacity: 1});
        if (tool !== 2)
            $("#tool-temperature-small").animate({opacity: 1});

        $("#tool-ircamera").fadeOut();
        $("#tool-moisture").fadeOut();
        $("#tool-temperature").fadeOut();

        irMode = false;
        var opacityOff = 0.3;

        if (tool === 0) {
            $("#tool-ircamera").fadeIn();
            $("#tool-ircamera-small").animate({opacity: opacityOff});
            irMode = true;
        } else if (tool === 1) {
            $("#tool-moisture").fadeIn();
            $("#tool-moisture-small").animate({opacity: opacityOff});
        } else if (tool === 2) {
            $("#sensor-graph").hide();
            $("#temperature-target").show();
            $("#tool-temperature").fadeIn();
            $("#tool-temperature-small").animate({opacity: opacityOff});
        }
    }
    doRender = true;
}

function polyfill() {
    Number.isInteger = Number.isInteger || function (value) {
        return typeof value === "number" &&
                isFinite(value) &&
                Math.floor(value) === value;
    };
}

function toggleToolbox(state) {
    if (state === "open" || state === "close") {
        var function_name = state + 'Toolbox';
        window[function_name]();
    } else {
        var toolbox = document.getElementById('toolbox');
        var toolbox_bg = toolbox.currentStyle || window.getComputedStyle(toolbox, false);
        if (toolbox_bg.backgroundImage.search('closed') > -1) {
            openToolbox();
        } else {
            closeToolbox();
        }
    }
}

function openToolbox() {
    var toolbox = document.getElementById('toolbox');
    var tool_links = document.querySelectorAll('#toolbox a');
    toolbox.style.backgroundImage = 'url(resources/images/toolbox-open.png)';
    for (var i = 0; i < tool_links.length; i++) {
        tool_links[i].style.display = 'inline';
    }
}

function closeToolbox() {
    var toolbox = document.getElementById('toolbox');
    var tool_links = document.querySelectorAll('#toolbox a');
    toolbox.style.backgroundImage = 'url(resources/images/toolbox-closed.png)';
    for (var i = 0; i < tool_links.length; i++) {
        tool_links[i].style.display = 'none';
    }
}
