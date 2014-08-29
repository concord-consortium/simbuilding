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
var raycaster;
var insertNewHousePart;
var houseParts = [];
var currentHousePart;
var hoveredUserData;
var viewerHeight = 1.7;
var hoveredObject;
var doRender;

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
	document.addEventListener('keyup', handleKeyUp, false);

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
//	camera.position.x = 8.5;
//	camera.position.y = viewerHeight;
//	camera.position.z = 10;

//	camControl = new THREE.FirstPersonControls(camera);
//	camControl.lookSpeed = 0.1;
//	camControl.movementSpeed = 4;
//	camControl.noFly = true;
//	camControl.lookVertical = true;
//	camControl.constrainVertical = true;
//	camControl.verticalMin = 1.25;
//	camControl.verticalMax = 2.5;
//	camControl.lon = -90;
//	camControl.lat = 0;
//	camControl.heighSpeed = true;

	camControl = new THREE.PointerLockControls(camera);
	scene.add(camControl.getObject());


//	camControl = new THREE.OrbitControls(camera);
//	camControl.lookSpeed = 0.1;
//	camControl.userPanSpeed = 0.05;

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0x00FFFF);
	renderer.setSize(window.innerWidth, window.innerHeight);

	initLights();
	initScene();
	initShaders();

	$("#WebGL-output").append(renderer.domElement);
	doRender = true;
	render();
}

function render() {
	var doRenderVal = doRender || camControl.needsUpdate();
	doRender = false;

	var delta = clock.getDelta();
	stats.update();

	camControl.update(delta);
	hover();

	requestAnimationFrame(render);
//	if (doRenderVal) {
//		renderer.clear();
//	object.material.uniforms.time.value = performance.now() * 0.005;
//	renderer.render(scene, camera);

//	renderer.setSize(100, 100);
	composer.render(0.1);

//	composer.render();
	enforceCameraGravity();
//	}
}

function initScene() {
//	var axis = new THREE.AxisHelper(20);
//	scene.add(axis);

	sceneRoot = new THREE.Object3D();
	scene.add(sceneRoot);

	land = new THREE.Mesh(new THREE.PlaneGeometry(100, 100));
	land.rotation.x = -Math.PI / 2;
	land.position.y = -0.1;
	land.geometry.computeBoundingBox();
	land.material.color.setHex(0x00FF00);
	sceneRoot.add(land);

	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load('./resources/models/Yorktown.dae', function(collada) {
		sceneRoot.add(collada.scene);
	});

	hotSpotsRoot = new THREE.Object3D();
	scene.add(hotSpotsRoot);

	var hotSpot = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial());
	hotSpot.position.x = 4;
	hotSpot.position.y = 6;
	hotSpot.position.z = -5.3;
//	hotSpot.visible = false;
	hotSpotsRoot.add(hotSpot);
}

function initLights() {
	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(1, 1, 0).normalize();
	directionalLight.intensity = 1;
	scene.add(directionalLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(-1, 1, 0).normalize();
	directionalLight.intensity = 1;
	scene.add(directionalLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(0, 0, 1).normalize();
	directionalLight.intensity = 0.9;
	scene.add(directionalLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(0, 0, -1).normalize();
	directionalLight.intensity = 0.9;
	scene.add(directionalLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff);
	directionalLight.position.set(0, -1, 0).normalize();
	directionalLight.intensity = 0.5;
	scene.add(directionalLight);
}

function initShaders() {
//	composer = new THREE.EffectComposer(renderer);
//	composer.addPass(new THREE.RenderPass(scene, camera));

//	var effect = new THREE.ShaderPass(THREE.DotScreenShader);
//	effect.uniforms[ 'scale' ].value = 4;
//	composer.addPass(effect);
//
//	var effect = new THREE.ShaderPass(THREE.RGBShiftShader);
//	effect.uniforms[ 'amount' ].value = 0.0015;
//	effect.renderToScreen = true;
//	composer.addPass(effect);

//	var triangles = 2;
//
//	var geometry = new THREE.BufferGeometry();
//
//	var vertices = new THREE.BufferAttribute(new Float32Array(triangles * 3 * 3), 3);
//
//	vertices.setXYZ(0, -1, -1, 0);
//	vertices.setXYZ(1, 1, -1, 0);
//	vertices.setXYZ(2, -1, 1, 0);
//	vertices.setXYZ(3, -1, 1, 0);
//	vertices.setXYZ(4, 1, -1, 0);
//	vertices.setXYZ(5, 1, 1, 0);
//
//	geometry.addAttribute('position', vertices);
//
//	var colors = new THREE.BufferAttribute(new Float32Array(triangles * 3 * 4), 4);
//
//	for (var i = 0; i < colors.length; i++) {
//
//		colors.setXYZW(i, 0, 0, 0, 0.5);
//
//	}
//
//	geometry.addAttribute('color', colors);
//
//	// material
//
//	var material = new THREE.RawShaderMaterial({
//		uniforms: {
//			time: {type: "f", value: 1.0}
//		},
//		vertexShader: document.getElementById('vertexShader').textContent,
//		fragmentShader: document.getElementById('fragmentShader').textContent,
//		side: THREE.DoubleSide,
//		transparent: true
//
//	});
//
//	var mesh = new THREE.Mesh(geometry, material);
//	mesh.position.z = 7;
//	mesh.position.y = 1;
//	scene.add(mesh);
//
//	object = mesh;


	renderPass = new THREE.RenderPass(scene, camera);
	copyPass = new THREE.ShaderPass(THREE.CopyShader);

	colorifyPass = new THREE.ShaderPass(THREE.ColorifyShader);
	colorifyPass.uniforms[ "color" ].value = new THREE.Color(0x00ff00);
	composer = new THREE.EffectComposer(renderer);
	composer.addPass(renderPass);
	composer.addPass(colorifyPass);
	composer.addPass(copyPass);
	copyPass.renderToScreen = true;



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
		this.roof = function() {
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
		var div = $("#applet");
		if (div.css("display") === "none")
			div.fadeIn();
		else
			div.fadeOut();
	}
}

function handleMouseDown() {
	//if (hoveredObject !== null) {
//	console.log("collision");
//	var div = $("#applet");
//	if (div.css("display") === "none") {
//		div.fadeIn();
//		camControl.freeze = true;
//	} else {
//		div.fadeOut();
//		camControl.freeze = false;
//	}
	//}
}

function handleMouseUp() {
	if (currentHousePart && !currentHousePart.isCompleted()) {
		currentHousePart.complete();
		if (insertNewHousePart)
			houseParts.push(currentHousePart);
	}
	insertNewHousePart = false;
	camControl.enabled = true;
}

function handleMouseMove(event) {
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	doRender = true;
}

function hover() {
	var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
	projector.unprojectVector(vector, camera);
	var pickDirection = vector.sub(camera.position).normalize();
	raycaster.set(camera.position, pickDirection);
	var collidables = [];
	hotSpotsRoot.children.forEach(function(sphere) {
		collidables.push(sphere);
	});

	hoveredUserData = null;
	var intersects = raycaster.intersectObjects(collidables);
	if (intersects.length > 0)
		hoveredObject = intersects[0].object;
	else
		hoveredObject = null;
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
	raycaster.set(camera.position, NEG_UNIT_Y);
	var intersects = raycaster.intersectObjects(sceneRoot.children, true);
	if (intersects.length > 0)
		camera.position.y = intersects[0].point.y + viewerHeight;
}
