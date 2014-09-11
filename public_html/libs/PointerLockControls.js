
THREE.PointerLockControls = function(camera) {

	var scope = this;

	camera.rotation.set(0, 0, 0);

	var pitchObject = new THREE.Object3D();
	pitchObject.add(camera);

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add(pitchObject);

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var prevTime = performance.now();

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseDown = function() {
		scope.isMouseDown = true;
	};

	var onMouseUp = function() {
		scope.isMouseDown = false;
	};

	var onMouseMove = function(event) {
		if (scope.enabled === false || !scope.isMouseDown)
			return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
	};

	var onKeyDown = function(event) {
		scope.isKeyDown = true;
		switch (event.keyCode) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true;
				break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if (canJump === true)
					velocity.y += 350;
				canJump = false;
				break;
		}
	};

	var onKeyUp = function(event) {
		scope.isKeyDown = false;
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};

	document.addEventListener('mousedown', onMouseDown, false);
	document.addEventListener('mouseup', onMouseUp, false);
	document.addEventListener('mousemove', onMouseMove, false);
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	this.enabled = false;
	this.isMouseDown = false;
	this.isKeyDown = false;

	this.getObject = function() {
		return yawObject;
	};

	this.isOnObject = function(boolean) {
		isOnObject = boolean;
		canJump = boolean;
	};

	this.getDirection = function() {
		// assumes the camera itself is not rotated
		var direction = new THREE.Vector3(0, 0, -1);
		var rotation = new THREE.Euler(0, 0, 0, "YXZ");

		return function(v) {
			rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);
			v.copy(direction).applyEuler(rotation);
			return v;
		};
	}();

	this.update = function() {
		if (scope.enabled === false)
			return;

		var time = performance.now();
		var delta = Math.min(0.1, (time - prevTime) / 1000);

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;


		if (moveForward)
			velocity.z -= 40.0 * delta;
		if (moveBackward)
			velocity.z += 40.0 * delta;

		if (moveLeft)
			velocity.x -= 40.0 * delta;
		if (moveRight)
			velocity.x += 40.0 * delta;

		yawObject.translateX(velocity.x * delta);
		yawObject.translateZ(velocity.z * delta);

		prevTime = time;
	};

	this.needsUpdate = function() {
		if (this.isMouseDown || Math.abs(velocity.x) > 0.001 || Math.abs(velocity.z) > 0.001)
			return true;
		else
			return false;
	};

};
