var clock;
var stats;
var camControl;
var renderer;
var scene;
var camera;
var mouse;
var projector;
var raycaster;
var land;
var insertNewHousePart;
var sceneRoot;
var houseParts = [];
var currentHousePart;
var hoveredUserData;

function startSimBuilding() {
    SIM.loadTextures();
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    projector = new THREE.Projector();
    raycaster = new THREE.Raycaster();
    stats = initStats();
    initGui();
    document.addEventListener('mousemove', handleMouseMove, false);
    document.addEventListener('mousedown', handleMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 2;
    camera.position.y = 6;
    camera.position.z = -10;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

//    camControls = new THREE.FirstPersonControls(camera);
//    camControls.lookSpeed = 0.4;
//    camControls.movementSpeed = 20;
//    camControls.noFly = true;
//    camControls.lookVertical = true;
//    camControls.constrainVertical = true;
//    camControls.verticalMin = 1.0;
//    camControls.verticalMax = 2.0;
//    camControls.lon = -150;
//    camControls.lat = 120;

    camControl = new THREE.OrbitControls(camera);
    camControl.userPanSpeed = 0.05;

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xEEEEEE);
    renderer.setSize(window.innerWidth, window.innerHeight);

    land = new THREE.Mesh(new THREE.PlaneGeometry(100, 100));
    land.rotation.x = -Math.PI / 2;
    land.geometry.computeBoundingBox();
    scene.add(land);

    var axis = new THREE.AxisHelper(20);
    scene.add(axis);

    sceneRoot = new THREE.Object3D();
    scene.add(sceneRoot);

    initLights();

    $("#WebGL-output").append(renderer.domElement);
    render();
}

function render() {
    var delta = clock.getDelta();
    stats.update();

    hover();

    camControl.update(delta);
    renderer.clear();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function initLights() {
    var ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);

    var spotLight = new THREE.SpotLight();
    spotLight.position.x = 2;
    spotLight.position.y = 6;
    spotLight.position.z = 5;
    scene.add(spotLight);
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
    var controls = new function() {
        this.platform = function() {
            currentHousePart = new SIM.Platform();
            sceneRoot.add(currentHousePart.root);
            insertNewHousePart = true;
        };
        this.wall = function() {
            currentHousePart = new SIM.Wall();
            insertNewHousePart = true;
        };
        this.window = function() {
            currentHousePart = new SIM.Window();
            insertNewHousePart = true;
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'platform');
    gui.add(controls, 'wall');
    gui.add(controls, 'window');
}

function handleMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function handleMouseDown() {
    if (insertNewHousePart) {
        currentHousePart.setCurrentEditPointIndex(currentHousePart.getCurrentEditPointIndex() + 1);
        camControl.enabled = false;
    } else if (hoveredUserData && hoveredUserData.housePart) {
        currentHousePart = hoveredUserData.housePart;
        if (hoveredUserData.editPointIndex !== undefined) {
            currentHousePart.setCurrentEditPointIndex(hoveredUserData.editPointIndex);
            camControl.enabled = false;
        }
    }
}

function handleMouseUp() {
    if (currentHousePart) {
        currentHousePart.complete();
        houseParts.push(currentHousePart);
        currentHousePart = null;
    }
    insertNewHousePart = false;
    camControl.enabled = true;
}

function hover() {
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
    projector.unprojectVector(vector, camera);
    var pickDirection = vector.sub(camera.position).normalize();
    raycaster.set(camera.position, pickDirection);
    var editing = currentHousePart && !currentHousePart.isCompleted();
    if (currentHousePart && currentHousePart.isCurrentEditPointVertical()) {
        currentHousePart.moveCurrentEditPoint(closestPoint(currentHousePart.root.localToWorld(currentHousePart.points[currentHousePart.getCurrentEditPointIndex()]), new THREE.Vector3(0, 1, 0), camera.position, pickDirection));
    } else {
        var collidables = [];
        if (currentHousePart && currentHousePart.canBeInsertedOn(null))
            collidables.push(land);

        houseParts.forEach(function(part) {
            if (!currentHousePart || currentHousePart.canBeInsertedOn(part)) {
                collidables.push(part.collisionMesh);
                if (!editing)
                    part.editPointsRoot.children.forEach(function(sphere) {
                        collidables.push(sphere);
                    });
            }
        });

        hoveredUserData = null;
        var intersects = raycaster.intersectObjects(collidables);
        if (intersects.length > 0) {
            hoveredUserData = intersects[0].object.userData;
            if (editing) {
                currentHousePart.setParentIfAllowed(hoveredUserData.housePart);
                scene.updateMatrixWorld();
                currentHousePart.moveCurrentEditPoint(intersects[0].point);
            }
        }
    }
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