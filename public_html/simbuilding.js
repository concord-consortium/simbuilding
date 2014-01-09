var clock;
var stats;
var camControls;
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

function startSimBuilding() {
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
    camera.position.x = 100;
    camera.position.y = 10;
    camera.position.z = 10;
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

    camControls = new THREE.OrbitControls(camera);

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

    camControls.update(delta);
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
            sceneRoot.add(currentHousePart.root);
            insertNewHousePart = true;
        };
    };
    var gui = new dat.GUI();
    gui.add(controls, 'platform');
    gui.add(controls, 'wall');
}

function handleMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function handleMouseDown() {
    if (insertNewHousePart) {
        currentHousePart.setCurrentEditPointIndex(currentHousePart.getCurrentEditPointIndex() + 1);
        camControls.enabled = false;
    } else if (hoveredUserData.housePart) {
        currentHousePart = hoveredUserData.housePart;
        if (hoveredUserData.editPointIndex !== null) {
            currentHousePart.setCurrentEditPointIndex(hoveredUserData.editPointIndex);
            camControls.enabled = false;
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
    camControls.enabled = true;
}

function hover() {
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
    projector.unprojectVector(vector, camera);
    var pickDirection = vector.sub(camera.position).normalize();
    raycaster.set(camera.position, pickDirection);
    var editing = currentHousePart && !currentHousePart.isCompleted();
    var isVerticalMove = editing && currentHousePart.isCurrentEditPointVertical();
    if (currentHousePart && currentHousePart.isCurrentEditPointVertical()) {
        currentHousePart.moveCurrentEditPoint(closestPoint(currentHousePart.points[currentHousePart.getCurrentEditPointIndex()], new THREE.Vector3(0, 1, 0), camera.position, pickDirection));
    } else {
    var collidables = [land];
    if (!editing)
        houseParts.forEach(function(part) {
            collidables.push(part.meshRoot);
            part.editPointsRoot.children.forEach(function(sphere) {
                collidables.push(sphere);
            });
        });
    var intersects = raycaster.intersectObjects(collidables);
    if (intersects.length > 0) {
        hoveredUserData = intersects[0].object.userData;
        if (editing)
            currentHousePart.moveCurrentEditPoint(intersects[0].point);
    }
}
}

function closestPoint(p1, p21, p3, p43) {
    var EPS = 0.0001;
    var p13;
    var d1343, d4321, d1321, d4343, d2121;
    var numer, denom;

    p13 = new THREE.Vector3().subVectors(p1, p3);
    if (Math.abs(p43.x) < EPS && Math.abs(p43.y) < EPS && Math.abs(p43.z) < EPS)
        return null;
    if (Math.abs(p21.length()) < EPS)
        return null;

    d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
    d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
    d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
    d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
    d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

    denom = d2121 * d4343 - d4321 * d4321;
    if (Math.abs(denom) < EPS)
        return null;
    numer = d1343 * d4321 - d1321 * d4343;

    var mua = numer / denom;
    var pa = new THREE.Vector3(p1.x + mua * p21.x, p1.y + mua * p21.y, p1.z + mua * p21.z);

    return pa;
}