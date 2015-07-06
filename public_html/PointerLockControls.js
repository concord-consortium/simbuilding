/* global THREE, doors, doorToBeOpened, sceneRoot, UNIT_Y */

"use strict";

THREE.PointerLockControls = function (camera) {
    camera.rotation.set(0, 0, 0);

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.rotation.order = "ZYX";
    yawObject.position.y = 10;
    yawObject.add(pitchObject);

    var enabled = true;
    var isMouseDown = false;
    var isKeyDown = false;

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var rotateLeft = false;
    var rotateRight = false;
    var rotateUp = false;
    var rotateDown = false;

    var isOnObject = false;

    var prevTime = -1;

    var velocityMove = new THREE.Vector3();
    var velocityRotate = new THREE.Vector3();

    var PI_2 = Math.PI / 2;

    var touchStartx = 0;
    var touchStarty = 0;

    var onMouseDown = function (event) {
        isMouseDown = true;
        touchStartx = event.clientX;
        touchStarty = event.clientY;
        event.preventDefault();
    };

    var onMouseUp = function (event) {
        isMouseDown = false;
        event.preventDefault();
    };

    var onMouseMove = function (event) {
        if (enabled === false || !isMouseDown)
            return;

        var movementX = event.clientX - touchStartx;
        var movementY = event.clientY - touchStarty;

        touchStartx = event.clientX;
        touchStarty = event.clientY;

        yawObject.rotation.y -= movementX * 0.004;
        pitchObject.rotation.x -= movementY * 0.004;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };

    var onTouchDown = function (event) {
        isMouseDown = true;
        touchStartx = event.touches[0].clientX;
        touchStarty = event.touches[0].clientY;

        if (event.touches.length >= 2)
            moveForward = true;
        event.preventDefault();
    };

    var onTouchUp = function (event) {
        isMouseDown = false;
        if (event.touches.length < 2)
            moveForward = false;
        event.preventDefault();
    };

    var onTouchMove = function (event) {
        if (enabled === false || !isMouseDown || event.touches.length < 1)
            return;

        var movementX = event.touches[0].clientX - touchStartx;
        var movementY = event.touches[0].clientY - touchStarty;

        touchStartx = event.touches[0].clientX;
        touchStarty = event.touches[0].clientY;

        yawObject.rotation.y += movementX * 0.001;
        pitchObject.rotation.x += movementY * 0.001;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

        event.preventDefault();
    };

    var onKeyDown = function (event) {
        isKeyDown = true;
        updateFlags(event, true);
    };

    var onKeyUp = function (event) {
        isKeyDown = false;
        updateFlags(event, false);
    };

    var updateFlags = function (event, enable) {
        var key;
        if (event.key)
            key = event.key;
        else if (event.which)
            key = event.which;
//        alert(key);
        switch (key) {
            case 38: // up
            case 87: // w
            case "ArrowUp":
            case "Up":
            case "w":
            case "W":
                moveForward = enable;
                break;
            case 40: // down
            case 83: // s
            case "ArrowDown":
            case "Down":
            case "s":
            case "S":
                moveBackward = enable;
                break;
            case 39: // right
            case "ArrowRight":
            case "Right":
                rotateRight = enable;
                break;
            case 37: // left
            case "ArrowLeft":
            case "Left":
                rotateLeft = enable;
                break;
            case 65: // a
            case "a":
            case "A":
                moveLeft = enable;
                break;
            case 68: // d
            case "d":
            case "D":
                moveRight = enable;
                break;
            case 33: // page up
            case 81: // q
            case "PageUp":
            case "q":
            case "Q":
                rotateUp = enable;
                break;
            case 34: //page down
            case 90: //z
            case "PageDown":
            case "z":
            case "Z":
                rotateDown = enable;
                break;
        }
        event.preventDefault();
    };

    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    document.addEventListener('touchmove', onTouchMove, false);
    document.addEventListener('touchstart', onTouchDown, false);
    document.addEventListener('touchend', onTouchUp, false);

    this.getObject = function () {
        return yawObject;
    };

    this.isOnObject = function (boolean) {
        isOnObject = boolean;
    };

    this.getDirection = function () {
        // assumes the camera itself is not rotated
        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function (v) {
            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);
            v.copy(direction).applyEuler(rotation);
            return v;
        };
    }();

    this.update = function () {
        if (enabled === false)
            return;

        var time = performance.now();
        if (prevTime === -1) {
            prevTime = time;
            return;
        }

        var delta = Math.min(0.1, (time - prevTime) / 1000);

        var speed = 20;

        velocityMove.sub(velocityMove.clone().multiplyScalar(speed / 2.0 * delta));
        velocityRotate.sub(velocityRotate.clone().multiplyScalar(speed / 2.0 * delta));

        if (moveForward)
            velocityMove.z -= speed * delta;
        if (moveBackward)
            velocityMove.z += speed * delta;

        if (moveLeft)
            velocityMove.x -= speed * delta;
        if (moveRight)
            velocityMove.x += speed * delta;

        if (rotateLeft)
            velocityRotate.y -= speed * delta;
        if (rotateRight)
            velocityRotate.y += speed * delta;

        if (rotateUp)
            velocityRotate.x -= speed * delta;
        if (rotateDown)
            velocityRotate.x += speed * delta;

        yawObject.rotation.x += -velocityRotate.x / 2 * delta;
        yawObject.rotation.y += -velocityRotate.y / 2 * delta;
        yawObject.translateX(velocityMove.x * delta);
        yawObject.translateZ(velocityMove.z * delta);
        this.adjustCameraPositionForCollision();
        this.updateWhichRoom(yawObject.position);
        updateQuiz();

        prevTime = time;
    };

    this.adjustCameraPositionForCollision = function () {
        // detect door to be opened
        var p = new THREE.Vector3(0, 0, 0);
        p.unproject(camera);
        var position = yawObject.position.clone();
        var direction = p.sub(position).normalize();
        var raycaster = new THREE.Raycaster(position, direction);
        var intersects = raycaster.intersectObjects(doors, true);
        if (intersects.length > 0) {
            if (intersects[0].distance < 2.0 && intersects[0].object.parent.name.indexOf("Door") === 0) {
                var door = intersects[0].object.parent.parent;
                if (doorToBeOpened.indexOf(door) === -1)
                    doorToBeOpened.push(door);
            }
        }

        // detect collision and adjust position accordingly
        if (velocityMove.length() !== 0) {
            var m = yawObject.matrixWorld.clone().setPosition(new THREE.Vector3());
            var direction = velocityMove.clone().normalize().applyMatrix4(m);
            direction.y = 0;
            direction.normalize();
            var position = yawObject.position.clone();
            position.y -= 0.8;
            var raycaster = new THREE.Raycaster(position, direction);
            var intersects = raycaster.intersectObject(sceneRoot, true);
            var MIN_DISTANCE_TO_WALL = 0.3;
            if (intersects.length > 0 && intersects[0].distance < MIN_DISTANCE_TO_WALL) {
                var newPosition = intersects[0].point.clone().sub(direction.clone().multiplyScalar(MIN_DISTANCE_TO_WALL * 1.01));
                var wallDirection = UNIT_Y.clone().cross(intersects[0].face.normal);
                if (wallDirection.dot(direction) < 0)
                    wallDirection.negate();
                var wallIntersects = new THREE.Raycaster(newPosition, wallDirection).intersectObject(sceneRoot, true);
                if (wallIntersects.length === 0 || wallIntersects[0].distance > MIN_DISTANCE_TO_WALL * 2)
                    newPosition = newPosition.add(wallDirection.multiplyScalar(0.05));
                yawObject.position.x = newPosition.x;
                yawObject.position.z = newPosition.z;
            }
        }
    };

    this.updateWhichRoom = function (position) {
        if (position.x > 1.5 && position.x < 13.5 && position.z > -6 && position.z < 3.8)
            showHotspots = true;
        else
            showHotspots = false;
    };

    this.needsUpdate = function () {
        if (isKeyDown || isMouseDown || velocityMove.length() > 0.001 || velocityRotate.length() > 0.001)
            return true;
        else {
            prevTime = -1;
            return false;
        }
    };

};
