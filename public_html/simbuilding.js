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
var width = window.innerWidth || 2;
var height = window.innerHeight || 2;
var irMode = false;
var doorToBeOpened = null;
var doorToBeClosed = null;

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

	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
	camControl = new THREE.PointerLockControls(camera);
	scene.add(camControl.getObject());
	camControl.getObject().position.x = 8.5;
	camControl.getObject().position.z = 10;

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(0x00FFFF);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.autoClear = false;

	initShaders();
	initLights();
	initScene();

	$("#WebGL-output").append(renderer.domElement);
	doRender = true;
	render();
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
		animateDoor();

		renderer.setViewport(0, 0, width, height);
		camera.fov = 45;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		hotSpotsRoot.visible = false;

		renderer.clear();
		composer.render(delta);

		if (irMode) {
			var irWidth = 450;
			renderer.setViewport(width / 2 - irWidth / 2 + 10, 200, irWidth, irWidth);
			camera.fov = 25;
			camera.aspect = 1;
			camera.updateProjectionMatrix();
			hotSpotsRoot.visible = true;

			composerIR.render(delta);
		}

		enforceCameraGravity();
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
	loader.load('./resources/models/Yorktown.dae', function (collada) {
		sceneRoot.add(collada.scene);
		var doors = [];
		collada.scene.children[0].children.forEach(function (door) {
			if (door.children[0]) {
				var doorComponentName = door.children[0].name;
				var OFFSET = -1000;
				if (doorComponentName === "Door")
					OFFSET = 0;
				else if (doorComponentName === "DoorOut")
					OFFSET = 38;
				else if (doorComponentName === "DoorGlass")
					OFFSET = 1;
				if (OFFSET !== -1000) {
//					door = door.children[0];
//				var OFFSET = 38;
					var offsetVector = new THREE.Vector3(OFFSET, 0, -2);
//					door.rotation.applyEuler(offsetVector);
//					door.position.x += OFFSET;
//					offsetVector.applyEuler(door.rotation);
					door.position.add(offsetVector.clone().applyEuler(door.rotation));
					door.children.forEach(function (doorMesh) {
//						if (doorMesh instanceof THREE.Mesh)
//							doorMesh.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-OFFSET, 0, 0));
//						else
//							doorMesh.position.x += -OFFSET;
						doorMesh.position.add(offsetVector.negate());
					});
					if (Math.abs(door.rotation.y) < 0.0001) {
						door.userData.startAngle = 0;
						door.userData.endAngle = Math.PI / 2;
					} else {
						door.userData.startAngle = -Math.PI / 2;
						door.userData.endAngle = -Math.PI;
					}

					var reverse = false; //doorComponentName === "DoorOut";
					if (reverse) {
						door.userData.endAngle = door.userData.startAngle - (door.userData.endAngle - door.userData.startAngle);
					}

					// door.rotation.y = -1;
				}
			}
		});
		doors.forEach(function (door) {
			var topParent = new THREE.Object3D();
			var rotParent = new THREE.Object3D();
			var root = door.parent;
			root.remove(door);
			root.add(topParent);
			topParent.add(rotParent);
			rotParent.add(door);
			rotParent.rotation.y = 0.1;
		});
	});
	hotSpotsRoot = new THREE.Object3D();
	scene.add(hotSpotsRoot);
	var hotSpot = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshBasicMaterial());
	hotSpot.position.x = 4;
	hotSpot.position.y = 6;
	hotSpot.position.z = -5.3;
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
		var div = $("#applet");
		if (div.css("display") === "none") {
			div.fadeIn();
			irMode = true;
		} else {
			div.fadeOut();
			irMode = false;
		}
		doRender = true;
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

	var vector = new THREE.Vector3(mouse.x, mouse.y, 0);
	projector.unprojectVector(vector, camera);
	var position = camera.localToWorld(camera.position.clone());
	var pickDirection = vector.sub(position).normalize();
	raycaster.set(position, pickDirection);
	var collidables = [];
	sceneRoot.children[1].children[0].children.forEach(function (group) {
		if (group.name === "Door") {
			collidables.push(group);
//			group.rotation.y = 1;
		}
	});
	var intersects = raycaster.intersectObjects(collidables, true);
	if (intersects.length > 0)
		console.log(intersects[0].object.name);
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
	hotSpotsRoot.children.forEach(function (sphere) {
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
//				doorToBeClosed.rotation.y = Math.min(0, doorToBeClosed.rotation.y + 0.1);
//				doorToBeClosed.rotation.y += increment;
				var isIncreasing = endAngle > startAngle;
				if (isIncreasing)
					doorToBeClosed.rotation.y = Math.min(endAngle, doorToBeClosed.rotation.y + 0.1);
				else
					doorToBeClosed.rotation.y = Math.max(endAngle, doorToBeClosed.rotation.y - 0.1);
			} else {
				doorToBeClosed = null;
			}
		}
}