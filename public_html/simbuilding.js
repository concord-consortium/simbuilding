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
var insertNewHousePart = true;

function startSimBuilding() {
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    projector = new THREE.Projector();
    raycaster = new THREE.Raycaster();
    stats = initStats();
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

    initLights();
    currentHousePart = new SIM.Platform();
    scene.add(currentHousePart.root);

    $("#WebGL-output").append(renderer.domElement);
    render();
}

function render() {
    var delta = clock.getDelta();
    stats.update();

    hover();

//    camControls.update(delta);
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

function handleMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function handleMouseDown() {    
    if (insertNewHousePart)
        currentHousePart.setCurrentEditPointIndex(currentHousePart.getCurrentEditPointIndex() + 1);
}

function handleMouseUp() {
    currentHousePart.complete();
    insertNewHousePart = false;
}

function hover() {
    var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
    projector.unprojectVector(vector, camera);
    raycaster.set(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        if (!currentHousePart.isCompleted())
        currentHousePart.moveCurrentEditPoint(intersects[0].point);
    }
}