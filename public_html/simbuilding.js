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
var hotSpotsHidden;
var land;
var mouse;
var projector;
var insertNewHousePart;
var houseParts = [];
var currentHousePart;
var viewerHeight = 1.3;
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
        initHotspots();
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
        camera.fov = 65;
        camera.aspect = window.innerWidth / window.innerHeight * 0.8;
        camera.updateProjectionMatrix();
        hotSpotsHidden.visible = false;

        renderer.clear();
        composer.render(delta);

        if (irMode) {
            if ($("#ircamera").css("opacity") === "1") {
                var irWidth = 450;
                renderer.setViewport(width / 2 - irWidth / 2 + 10, 200, irWidth, irWidth);
                camera.fov = 25;
                camera.aspect = 1;
                camera.updateProjectionMatrix();
                hotSpotsHidden.visible = true;

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
}

function initHotspots() {
    hotSpotsRoot = new THREE.Object3D();
    scene.add(hotSpotsRoot);
    var hotSpotsVisible = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsVisible);
    hotSpotsHidden = new THREE.Object3D();
    hotSpotsRoot.add(hotSpotsHidden);

    var geom = new THREE.SphereGeometry(0.1, 20, 20);

    var whiteMaterial = new THREE.MeshBasicMaterial();
    var hotSpot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), whiteMaterial);
    hotSpot.userData.id = 0;
    hotSpot.position.set(4, 6, -5.3);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), whiteMaterial);
    hotSpot.userData.id = 1;
    hotSpot.position.set(14.5, 0.8, -2.8);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 2;
    hotSpot.position.set(1.5, 1.2, -3.61);
    hotSpotsHidden.add(hotSpot);
    // Windows
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 5;
    hotSpot.position.set(4.4, 1.6, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 6;
    hotSpot.position.set(6.45, 1.6, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 5;
    hotSpot.position.set(10.53, 1.6, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 5;
    hotSpot.position.set(12.57, 1.6, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 5;
    hotSpot.position.set(4.4, 4.8, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 5;
    hotSpot.position.set(6.45, 4.8, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 5;
    hotSpot.position.set(8.45, 4.8, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 6;
    hotSpot.position.set(10.53, 4.8, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 5;
    hotSpot.position.set(12.57, 4.8, 4.2);
    hotSpotsHidden.add(hotSpot);
    // Baseboard
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 7;
    hotSpot.position.set(3.15, 0.4, 2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 8;
    hotSpot.position.set(5.4, 0.4, 4.2);
    hotSpotsHidden.add(hotSpot);
    var hotSpot = new THREE.Mesh(geom, whiteMaterial);
    hotSpot.userData.id = 8;
    hotSpot.position.set(11.5, 0.4, 4.2);
    hotSpotsHidden.add(hotSpot);

    var shadeMaterial = new THREE.MeshPhongMaterial();
    shadeMaterial.emissive = new THREE.Color(0x555555);
    var hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 20, 1), shadeMaterial);
    hotSpot.userData.id = 3;
    hotSpot.position.set(8.2, 3, 1);
    hotSpotsVisible.add(hotSpot);
    var hotSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 20, 1), shadeMaterial);
    hotSpot.userData.id = 4;
    hotSpot.position.set(10, 3, -2.8);
    hotSpotsVisible.add(hotSpot);
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
//    var p = new THREE.Vector3(mouse.x, mouse.y, 0);
//    projector.unprojectVector(p, camera);
//    var position = camControl.getObject().position.clone();
//    var direction = p.sub(position).normalize();
//    var raycaster = new THREE.Raycaster(position, direction);
//    var intersects = raycaster.intersectObject(hotSpotsRoot, true);
//    var div = $("#applet");
//    if (intersects.length > 0) {
//        var id = intersects[0].object.userData.id;
//        for (i = 0; i < 3; i++)
//            if (i === id) {
//                $("#applet" + i).show();
//                appletTarget = "applet" + i;
//            } else
//                $("#applet" + i).hide();
//        div.fadeIn();
//        camControl.enabled = false;
//    }
}

function handleMouseUp() {
}

function handleMouseMove(event) {
    mouse.x = (event.clientX / width) * 2 - 1;
    mouse.y = -(event.clientY / height) * 2 + 1;
    updateQuiz();
}

function hover() {
}

function pickHotspot(x, y) {
    var p = new THREE.Vector3(x, y, 0);
    projector.unprojectVector(p, camera);
    var position = camControl.getObject().position.clone();
    var direction = p.sub(position).normalize();
    var raycaster = new THREE.Raycaster(position, direction);
    var intersects = raycaster.intersectObject(hotSpotsRoot, true);
    if (intersects.length > 0)
        return intersects[0].object.userData.id;
    else
        return -1;
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