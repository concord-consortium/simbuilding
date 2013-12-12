var clock;
var stats;
var camControls;
var renderer;
var scene;
var camera;

function startSimBuilding() {
    clock = new THREE.Clock();
    stats = initStats();

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

    var axis = new THREE.AxisHelper(20);
    scene.add(axis);

    initLights();
    scene.add(createHouse());

    $("#WebGL-output").append(renderer.domElement);
    render();
}

function initLights() {
    var ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);
    
    var spotLight = new THREE.SpotLight();
    spotLight.position.x = 1;
    spotLight.position.y = 5;
    spotLight.position.z = 5;
    scene.add(spotLight);
}

function render() {
    stats.update();
    var delta = clock.getDelta();

    camControls.update(delta);
    renderer.clear();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
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