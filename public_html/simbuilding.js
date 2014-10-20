var UNIT_Y = new THREE.Vector3(0, 1, 0);
var NEG_UNIT_Y = new THREE.Vector3(0, -1, 0);

var clock;
var stats;
var camControl;
var renderer;
var composer;
var camera;
var scene;
var sceneRoot;
var hotSpotsRoot;
var land;
var mouse;
var projector;
var insertNewHousePart;
var houseParts = [];
var currentHousePart;
var viewerHeight = 1.7;
var hoveredObject;
var doRender;
var width = window.innerWidth || 2;
var height = window.innerHeight || 2;
var irMode = false;
var doorToBeOpened = null;
var doorToBeClosed = null;
var doors = [];
var collisionPartsWithoutDoors = [];
var appletTarget = "applet1";

function startSimBuilding() {
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    projector = new THREE.Projector();
    stats = initStats();
    initGui();
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mousedown', handleMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('keyup', handleKeyUp, false);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camControl = new THREE.PointerLockControls(camera);
    camControl.enabled = true;
    scene.add(camControl.getObject());
    camControl.getObject().position.x = 8.5;
    camControl.getObject().position.z = 10;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0x062A78);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;

    initShaders();
    $("#WebGL-output").append(renderer.domElement);

    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load('./resources/models/Yorktown.dae', function (houseModel) {
        initScene(houseModel.scene);
        initLights();
        doRender = true;
        setTimeout(render, 100);
    });
}

function render() {
    var doRenderVal = doRender || camControl.needsUpdate() || doorToBeOpened !== null || doorToBeClosed !== null;
    doRender = false;

    var delta = clock.getDelta();
    stats.update();

    camControl.update(delta);
//	hover();

    requestAnimationFrame(render);
    if (doRenderVal) {
        enforceCameraGravity();
        animateDoor();

        renderer.setViewport(0, 0, width, height);
        camera.fov = 45;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        hotSpotsRoot.visible = false;

        renderer.clear();
        composer.render(delta);

        if (irMode) {
            if ($("#ircamera").css("opacity") === "1") {
                var irWidth = 450;
                renderer.setViewport(width / 2 - irWidth / 2 + 10, 200, irWidth, irWidth);
                camera.fov = 25;
                camera.aspect = 1;
                camera.updateProjectionMatrix();
                hotSpotsRoot.visible = true;

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
//	var axis = new THREE.AxisHelper(20);
//	scene.add(axis);

    sceneRoot = new THREE.Object3D();
    scene.add(sceneRoot);
    land = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial());
    land.rotation.x = -Math.PI / 2;
    land.position.y = -0.1;
    land.geometry.computeBoundingBox();
//	land.material.color.setHex(0x00FF00);
    sceneRoot.add(land);
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
    hotSpotsRoot = new THREE.Object3D();
    scene.add(hotSpotsRoot);
    var hotSpot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), new THREE.MeshBasicMaterial());
    hotSpot.userData.id = 0;
    hotSpot.position.set(4, 6, -5.3);
    hotSpotsRoot.add(hotSpot);
    var hotSpot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), new THREE.MeshBasicMaterial());
    hotSpot.userData.id = 1;
    hotSpot.position.set(14.5, 0.8, -2.8);
    hotSpotsRoot.add(hotSpot);
}

function initLights() {
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

function initGui() {
    var controls = new function () {
        this.platform = function () {
            currentHousePart = new SIM.Platform();
            sceneRoot.add(currentHousePart.root);
            insertNewHousePart = true;
        };
        this.wall = function () {
            currentHousePart = new SIM.Wall();
            insertNewHousePart = true;
        };
        this.window = function () {
            currentHousePart = new SIM.Window();
            insertNewHousePart = true;
        };
        this.roof = function () {
            currentHousePart = new SIM.Roof();
            insertNewHousePart = true;
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'platform');
    gui.add(controls, 'wall');
    gui.add(controls, 'window');
    gui.add(controls, 'roof');
}

function handleKeyUp(event) {
    if (event.keyCode === 46 && currentHousePart) {
        currentHousePart.root.parent.remove(currentHousePart.root);
        houseParts.splice(houseParts.indexOf(currentHousePart), 1);
        currentHousePart = null;
    } else if (event.keyCode === 73) { // 'i'
        if ($("#ircamera").css("display") === "none") {
            $("#ircamera").fadeIn();
            $("#ircamera-small").fadeOut();
            irMode = true;
        } else {
            $("#ircamera").fadeOut();
            $("#ircamera-small").fadeIn();
            irMode = false;
        }
        doRender = true;
    }
}

function handleMouseDown() {
    var p = new THREE.Vector3(mouse.x, mouse.y, 0);
    projector.unprojectVector(p, camera);
    var position = camControl.getObject().position.clone();
    var direction = p.sub(position).normalize();
    var raycaster = new THREE.Raycaster(position, direction);
    var intersects = raycaster.intersectObject(hotSpotsRoot, true);
    var div = $("#applet");
    if (intersects.length > 0) {
        var id = intersects[0].object.userData.id;
        for (i = 0; i < 2; i++)
            if (i === id) {
                $("#applet" + (i + 1)).show();
                appletTarget = "applet" + (i + 1);
            } else
                $("#applet" + (i + 1)).hide();
        div.fadeIn();
//        camControl.enabled = false;
    }
//    else {
//        div.fadeOut();
//        camControl.freeze = false;
//    }
}

function handleMouseUp() {
//    if (currentHousePart && !currentHousePart.isCompleted()) {
//        currentHousePart.complete();
//        if (insertNewHousePart)
//            houseParts.push(currentHousePart);
//    }
//    insertNewHousePart = false;
//    camControl.enabled = true;
}

function handleMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
//    doRender = true;
}

function hover() {
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
    if (doorToBeOpened !== null) {
        var startAngle = doorToBeOpened.userData.startAngle;
        var endAngle = doorToBeOpened.userData.endAngle;
        if (doorToBeOpened.rotation.y !== endAngle) {
            console.log("Door opening");
            var isIncreasing = endAngle > startAngle;
            if (isIncreasing)
                doorToBeOpened.rotation.y = Math.min(endAngle, doorToBeOpened.rotation.y + 0.1);
            else
                doorToBeOpened.rotation.y = Math.max(endAngle, doorToBeOpened.rotation.y - 0.1);
            if (doorToBeClosed === doorToBeOpened)
                doorToBeClosed = null;
        } else {
            doorToBeClosed = doorToBeOpened;
            doorTimeout = 100;
            doorToBeOpened = null;
        }
    }

    if (doorToBeClosed !== null)
        if (doorTimeout > 0)
            doorTimeout--;
        else {
            var startAngle = doorToBeClosed.userData.endAngle;
            var endAngle = doorToBeClosed.userData.startAngle;
            if (doorToBeClosed.rotation.y !== endAngle) {
                console.log("Door closing");
                var isIncreasing = endAngle > startAngle;
                if (isIncreasing)
                    doorToBeClosed.rotation.y = Math.min(endAngle, doorToBeClosed.rotation.y + 0.1);
                else
                    doorToBeClosed.rotation.y = Math.max(endAngle, doorToBeClosed.rotation.y - 0.1);
            } else
                doorToBeClosed = null;
        }
}