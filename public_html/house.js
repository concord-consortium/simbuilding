var SIM = SIM || {REVISION: '1'};

var id = 0;

SIM.loadTextures = function() {
    SIM.HousePart.gridsTexture = THREE.ImageUtils.loadTexture("resources/textures/grid.png");
    SIM.HousePart.gridsTexture.wrapS = THREE.RepeatWrapping;
    SIM.HousePart.gridsTexture.wrapT = THREE.RepeatWrapping;

    SIM.Platform.texture = THREE.ImageUtils.loadTexture("resources/textures/platform.jpg");
    SIM.Platform.texture.wrapS = THREE.RepeatWrapping;
    SIM.Platform.texture.wrapT = THREE.RepeatWrapping;

    SIM.Wall.texture = THREE.ImageUtils.loadTexture("resources/textures/wall.png", null, createDefaultScene);
    SIM.Wall.texture.wrapS = THREE.RepeatWrapping;
    SIM.Wall.texture.wrapT = THREE.RepeatWrapping;
};

SIM.Neighbors = function(wall, point) {
    this.wall = wall;
    this.point = point;
};

SIM.HousePart = function() {
    this.points = [new THREE.Vector3(), new THREE.Vector3()];
    this.root = new THREE.Object3D();
    this.rootTG = new THREE.Object3D();
    this.editPointsRoot = new THREE.Object3D();
    this.meshRoot = new THREE.Object3D();
    this.childrenRoot = new THREE.Object3D();
    this.root.add(this.editPointsRoot);
    this.root.add(this.rootTG);
    this.rootTG.add(this.meshRoot);
    this.rootTG.add(this.childrenRoot);
    this.id = id++;
    this.initMode = true;
    this.root.userData.housePart = this.rootTG.userData.housePart = this.childrenRoot.userData.housePart = this;
    this.setCurrentEditPointIndex(0);
};

SIM.HousePart.prototype.complete = function() {
    this.currentEditPointIndex = null;
    this.initMode = false;
    this.completed = true;
    this.setParentGridsVisible(false);
};

SIM.HousePart.prototype.isCompleted = function() {
    return this.completed;
};

SIM.HousePart.prototype.setCurrentEditPointIndex = function(i) {
    this.currentEditPointIndex = i;
    this.completed = false;
};

SIM.HousePart.prototype.getCurrentEditPointIndex = function() {
    return this.currentEditPointIndex;
};

SIM.HousePart.prototype.isCurrentEditPointVertical = function() {
    return false;
};

SIM.HousePart.prototype.setParentIfAllowed = function(parent) {
    if (parent && this.initMode && this.currentEditPointIndex === 0) {
        parent.childrenRoot.add(this.root);
    }
};

SIM.HousePart.prototype.drawEditPoints = function() {
    this.editPointsRoot.matrix.getInverse(this.root.matrixWorld);
    this.editPointsRoot.matrixAutoUpdate = false;
    this.editPointsRoot.updateMatrixWorld();
    for (var i = 0; i < this.points.length; i++) {
        if (i === this.editPointsRoot.children.length) {
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1));
            sphere.userData.housePart = this;
            sphere.userData.editPointIndex = i;
            this.editPointsRoot.add(sphere);
        }
        this.editPointsRoot.children[i].position = this.root.localToWorld(this.points[i].clone());
    }
};

SIM.HousePart.prototype.isDrawable = function() {
    return this.points[0].distanceTo(this.points[1]) > 0;
};

SIM.HousePart.prototype.getAbsPoint = function(index) {
    return this.root.parent.localToWorld(this.points[index].clone());
};

SIM.HousePart.prototype.setParentGridsVisible = function(visible) {
    var parent = this.root.parent.userData.housePart;
    if (parent)
        parent.gridsMaterial.visible = visible;
};

SIM.Platform = function() {
    SIM.HousePart.call(this);

    this.material = new THREE.MeshLambertMaterial();
    this.material.map = SIM.Platform.texture.clone();
    this.material.map.needsUpdate = true;

    this.gridsMaterial = new THREE.MeshBasicMaterial();
    this.gridsMaterial.map = SIM.HousePart.gridsTexture.clone();
    this.gridsMaterial.transparent = true;
    this.gridsMaterial.map.needsUpdate = true;
    this.gridsMaterial.visible = false;
};

SIM.Platform.prototype = new SIM.HousePart();

SIM.Platform.prototype.moveCurrentEditPoint = function(p) {
    this.points[this.currentEditPointIndex] = this.snapToGrid(p);
    if (this.initMode) {
        if (this.currentEditPointIndex === 0)
            this.points[1] = this.points[0];
    }
    var sourceIndex = this.currentEditPointIndex < 2 ? 0 : 2;
    var destinationIndex = sourceIndex === 0 ? 2 : 0;
    this.points[destinationIndex] = this.points[sourceIndex].clone();
    this.points[destinationIndex].z = this.points[sourceIndex + 1].z;
    this.points[destinationIndex + 1] = this.points[sourceIndex + 1].clone();
    this.points[destinationIndex + 1].z = this.points[sourceIndex].z;
    this.draw();
    this.childrenRoot.children.forEach(function(child) {
        child.userData.housePart.draw();
    });
};

SIM.Platform.prototype.draw = function() {
    for (var i = this.meshRoot.children.length; i >= 0; i--)
        this.meshRoot.remove(this.meshRoot.children[i]);

    this.drawEditPoints();

    if (!this.isDrawable())
        return;

    this.rootTG.scale.x = Math.abs(this.points[1].x - this.points[0].x);
    this.rootTG.scale.z = Math.abs(this.points[1].z - this.points[0].z);
    this.rootTG.position.x = this.points[0].x + (this.points[1].x - this.points[0].x) / 2;
    this.rootTG.position.z = this.points[0].z + (this.points[1].z - this.points[0].z) / 2;

    var w = this.root.localToWorld(this.points[0].clone()).distanceTo(this.root.localToWorld(this.points[3].clone()));
    var h = this.root.localToWorld(this.points[0].clone()).distanceTo(this.root.localToWorld(this.points[2].clone()));
    this.gridsMaterial.map.repeat.x = 0.25 * w;
    this.gridsMaterial.map.repeat.y = 0.25 * h;

    var mesh = THREE.SceneUtils.createMultiMaterialObject(new THREE.CubeGeometry(1, 1, 0.2), [this.material, this.gridsMaterial]);
    mesh.rotation.x = -Math.PI / 2;
    this.collisionMesh = mesh.children[0];
    this.collisionMesh.userData.housePart = this;
    this.meshRoot.add(mesh);
};

SIM.Platform.prototype.canBeInsertedOn = function(parent) {
    return parent === null;
};

SIM.Platform.prototype.snapToGrid = function(p) {
    p.x = Math.round(p.x);
    p.z = Math.round(p.z);
    return p;
};

SIM.Wall = function() {
    SIM.HousePart.call(this);

    this.material = new THREE.MeshLambertMaterial();
    this.material.map = SIM.Wall.texture.clone();
    this.material.side = THREE.DoubleSide;
    this.material.map.needsUpdate = true;

    this.gridsMaterial = new THREE.MeshBasicMaterial();
    this.gridsMaterial.map = SIM.HousePart.gridsTexture.clone();
    this.gridsMaterial.transparent = true;
    this.gridsMaterial.map.needsUpdate = true;
    this.gridsMaterial.side = THREE.DoubleSide;
    this.gridsMaterial.visible = false;
};

SIM.Wall.prototype = new SIM.HousePart();

SIM.Wall.prototype.moveCurrentEditPoint = function(p) {
    p = this.root.worldToLocal(this.snapToGrid(p));
    this.points[this.currentEditPointIndex] = p;

    if (this.initMode) {
        if (this.currentEditPointIndex === 0) {
            this.points[1] = this.points[0].clone();
            this.points[2] = this.points[0].clone().setY(3);
            this.points[3] = this.points[0].clone().setY(3);
        }
    }

    if (this.currentEditPointIndex < 2)
        this.points[this.currentEditPointIndex + 2].setX(p.x).setZ(p.z);
    else
        this.points[this.currentEditPointIndex === 2 ? 3 : 2].y = p.y;

    this.draw();
    this.setParentGridsVisible(true);
    this.computeInsideDirectionOfAttachedWalls();
};

SIM.Wall.prototype.draw = function() {
    for (var i = this.meshRoot.children.length; i >= 0; i--)
        this.meshRoot.remove(this.meshRoot.children[i]);

    this.drawEditPoints();

    if (!this.isDrawable())
        return;

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1, 0);
    shape.lineTo(1, 1);
    shape.lineTo(0, 1);

    this.collisionMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape));
    this.collisionMesh.userData.housePart = this;
    this.collisionMesh.visible = false;
    this.collisionMesh.material.side = THREE.DoubleSide;
    this.meshRoot.add(this.collisionMesh);

    this.childrenRoot.children.forEach(function(child) {
        var part = child.userData.housePart;
        if (part.isDrawable()) {
            var windowHole = new THREE.Path();
            windowHole.moveTo(part.points[0].x, part.points[0].y);
            windowHole.lineTo(part.points[3].x, part.points[3].y);
            windowHole.lineTo(part.points[1].x, part.points[1].y);
            windowHole.lineTo(part.points[2].x, part.points[2].y);
            shape.holes.push(windowHole);
        }
    });

    var v01 = new THREE.Vector3().subVectors(this.points[1], this.points[0]).normalize();
    this.rootTG.rotation.y = (v01.dot(new THREE.Vector3(0, 0, 1)) > 0 ? -1 : 1) * v01.angleTo(new THREE.Vector3(1, 0, 0));
    this.rootTG.position.x = this.points[0].x;
    this.rootTG.position.y = this.points[0].y;
    this.rootTG.position.z = this.points[0].z;
    this.rootTG.scale.x = this.points[0].distanceTo(this.points[1]);
    this.rootTG.scale.y = this.points[0].distanceTo(this.points[2]);
    this.rootTG.updateMatrixWorld();

    var p0 = this.root.localToWorld(this.points[0].clone());
    var p1 = this.root.localToWorld(this.points[1].clone());
    var p2 = this.root.localToWorld(this.points[2].clone());
    var p01 = new THREE.Vector3().subVectors(p1, p0).normalize();
    var w = p0.distanceTo(p1);
    var h = p0.distanceTo(p2);
    this.material.map.repeat.x = 0.2 * w;
    this.material.map.repeat.y = 0.4 * h;
    this.gridsMaterial.map.repeat.x = 1 * w;
    this.gridsMaterial.map.repeat.y = 1 * h;

    var mesh = THREE.SceneUtils.createMultiMaterialObject(new THREE.ShapeGeometry(shape), [this.material, this.gridsMaterial]);
    this.meshRoot.add(mesh);

    var thickness = 0.2;
    var middleGlobal = new THREE.Vector3().addVectors(p0, p1).divideScalar(2);
    var thicknessDirection;
    if (this.thicknessDirection)
        thicknessDirection = this.thicknessDirection.clone();
    else
        thicknessDirection = new THREE.Vector3(0, 1, 0).cross(p01);
    var endPointGlobal = thicknessDirection.multiplyScalar(thickness).add(middleGlobal);
    var endPointLocal = this.rootTG.worldToLocal(endPointGlobal);
    var thicknessVector = endPointLocal.sub(this.rootTG.worldToLocal(middleGlobal));

    var wallLengthWorld = p0.distanceTo(p1);
    var thicknessLocal = thickness / wallLengthWorld;

    var margin = [0, 0];
    if (this.neighbor)
        for (var i = 0; i < 2; i++)
            if (this.neighbor[i]) {
                var o = this.root.localToWorld(this.points[i].clone());
                var v1 = new THREE.Vector3().subVectors(this.root.localToWorld(this.points[+!i].clone()), o).normalize();
                var otherWall = this.neighbor[i].wall;
                var v2 = new THREE.Vector3().subVectors(this.root.localToWorld(otherWall.points[+!this.neighbor[i].point].clone()), o).normalize();
                var angle = SIM.angleBetween(v1, v2, v1.clone().cross(this.thicknessDirection));
                if (Math.abs(angle) > 0.01)
                    margin[i] = thicknessLocal / Math.tan(angle / 2);
            }

    var backShape = new THREE.Shape();
    backShape.moveTo(margin[0], 0);
    backShape.lineTo(1 - margin[1], 0);
    backShape.lineTo(1 - margin[1], 1);
    backShape.lineTo(margin[0], 1);
    backShape.holes = shape.holes;

    var backMaterial = new THREE.MeshLambertMaterial();
    backMaterial.side = THREE.DoubleSide;
    var backMesh = new THREE.Mesh(new THREE.ShapeGeometry(backShape), backMaterial);
    backMesh.position = thicknessVector.clone();
    this.meshRoot.add(backMesh);

    var windowRoot = new THREE.Object3D();
    this.childrenRoot.children.forEach(function(child) {
        var part = child.userData.housePart;
        if (part.isDrawable()) {
            var x1, x2, y1, y2;
            part.points.forEach(function(p) {
                if (!x1) {
                    x1 = x2 = p.x;
                    y1 = y2 = p.y;
                } else {
                    if (p.x < x1)
                        x1 = p.x;
                    else if (p.x > x2)
                        x2 = p.x;
                    if (p.y < y1)
                        y1 = p.y;
                    else if (p.y > y2)
                        y2 = p.y;
                }
            });

            var p0 = new THREE.Vector3(x1, y1, 0);
            var p1 = new THREE.Vector3(x2, y1, 0);
            var p2 = new THREE.Vector3(x2, y2, 0);
            var p3 = new THREE.Vector3(x1, y2, 0);

            var geometry = new THREE.Geometry();
            geometry.vertices.push(p0);
            geometry.vertices.push(p1);
            geometry.vertices.push(p2);
            geometry.vertices.push(p3);
            geometry.vertices.push(p0.clone().add(thicknessVector));
            geometry.vertices.push(p1.clone().add(thicknessVector));
            geometry.vertices.push(p2.clone().add(thicknessVector));
            geometry.vertices.push(p3.clone().add(thicknessVector));
            geometry.faces.push(new THREE.Face3(0, 1, 5));
            geometry.faces.push(new THREE.Face3(0, 5, 4));
            geometry.faces.push(new THREE.Face3(0, 4, 7));
            geometry.faces.push(new THREE.Face3(0, 7, 3));
            geometry.faces.push(new THREE.Face3(1, 2, 6));
            geometry.faces.push(new THREE.Face3(1, 6, 5));
            geometry.faces.push(new THREE.Face3(2, 3, 7));
            geometry.faces.push(new THREE.Face3(2, 7, 6));
            geometry.computeBoundingSphere();
            var windowSurroundMesh = new THREE.Mesh(geometry, backMaterial);
            windowRoot.add(windowSurroundMesh);
        }
    });
    this.meshRoot.add(windowRoot);
};

SIM.Wall.prototype.computeInsideDirectionOfAttachedWalls = function() {
    if (!this.isDrawable())
        return;
    var walls = [];
    this.root.parent.children.forEach(function(child) {
        var wall = child.userData.housePart;
        if (wall.isDrawable()) {
            wall.neighbor = [];
            walls.push(wall);
        }
    });

    walls.forEach(function(wall) {
        walls.splice(walls.indexOf(wall), 1);
        walls.every(function(otherWall) {
            for (var wallPoint = 0; wallPoint < 2; wallPoint++)
                if (!wall.neighbor[wallPoint])
                    for (var otherPoint = 0; otherPoint < 2; otherPoint++)
                        if (!otherWall.neighbor[otherPoint] && SIM.isEqual(wall.points[wallPoint], otherWall.points[otherPoint])) {
                            wall.neighbor[wallPoint] = new SIM.Neighbors(otherWall, otherPoint);
                            otherWall.neighbor[otherPoint] = new SIM.Neighbors(wall, wallPoint);
                            if (wall.neighbor[0] && wall.neighbor[1])
                                return false;
                        }
            return true;
        });
    });

    var currentWall = this;
    var currentWallPoint = 0;
    while (currentWall.neighbor[currentWallPoint] && currentWall.neighbor[0].wall !== this) {
        var tmp = currentWall;
        currentWall = currentWall.neighbor[currentWallPoint].wall;
        currentWallPoint = +!tmp.neighbor[currentWallPoint].point;
    }
    var firstWall = currentWall;

    var side = 0;
    currentWallPoint = 1;
    do {
        if (currentWall.neighbor[currentWallPoint]) {
            var next = currentWall.neighbor[currentWallPoint];
            var p1 = currentWall.getAbsPoint(+!currentWallPoint);
            var p2 = currentWall.getAbsPoint(currentWallPoint);
            var p3 = next.wall.getAbsPoint(+!next.point);
            var p1_p2 = new THREE.Vector3().subVectors(p2, p1).normalize();
            var p2_p3 = new THREE.Vector3().subVectors(p3, p2).normalize();
            side += SIM.angleBetween(p1_p2, p2_p3, SIM.UNIT_Y);
            currentWall = next.wall;
            currentWallPoint = +!next.point;
        } else
            break;
    } while (currentWall !== firstWall);

    currentWall = firstWall;
    currentWallPoint = 1;
    do {
        if (currentWall.neighbor[currentWallPoint]) {
            var next = currentWall.neighbor[currentWallPoint];
            var p1 = currentWall.getAbsPoint(+!currentWallPoint);
            var p2 = currentWall.getAbsPoint(currentWallPoint);
            var p3 = next.wall.getAbsPoint(+!next.point);
            var p1_p2 = new THREE.Vector3().subVectors(p2, p1).normalize();
            var p2_p3 = new THREE.Vector3().subVectors(p3, p2).normalize();

            currentWall.thicknessDirection = new THREE.Vector3().crossVectors(SIM.UNIT_Y, p1_p2).normalize();
            if (side < 0)
                currentWall.thicknessDirection.negate();
            currentWall.draw();
            currentWall = next.wall;
            currentWallPoint = +!next.point;
            if (!currentWall.neighbor[currentWallPoint]) {
                currentWall.thicknessDirection = new THREE.Vector3().crossVectors(SIM.UNIT_Y, p2_p3).normalize();
                if (side < 0)
                    currentWall.thicknessDirection.negate();
                currentWall.draw();
            }
        } else
            break;
    } while (currentWall !== firstWall);
};

SIM.Wall.prototype.canBeInsertedOn = function(parent) {
    return parent instanceof SIM.Platform;
};

SIM.Wall.prototype.isCurrentEditPointVertical = function() {
    return this.currentEditPointIndex >= 2;
};

SIM.Wall.prototype.snapToGrid = function(p) {
    p.x = Math.round(p.x);
    p.z = Math.round(p.z);
    return p;
};

SIM.Wall.prototype.isDrawable = function() {
    return this.getAbsPoint(0).distanceTo(this.getAbsPoint(1)) > 0.5;
};

SIM.Window = function() {
    SIM.HousePart.call(this);
};

SIM.Window.prototype = new SIM.HousePart();

SIM.Window.prototype.moveCurrentEditPoint = function(p) {
    p = this.snapToGrid(this.root.worldToLocal(p));
    this.points[this.currentEditPointIndex] = p;
    if (this.initMode) {
        if (this.currentEditPointIndex === 0)
            this.points[1] = this.points[0];
    }
    var sourceIndex = this.currentEditPointIndex < 2 ? 0 : 2;
    var destinationIndex = sourceIndex === 0 ? 2 : 0;
    this.points[destinationIndex] = this.points[sourceIndex].clone();
    this.points[destinationIndex].y = this.points[sourceIndex + 1].y;
    this.points[destinationIndex + 1] = this.points[sourceIndex + 1].clone();
    this.points[destinationIndex + 1].y = this.points[sourceIndex].y;
    this.draw();
    this.setParentGridsVisible(true);
    this.root.parent.userData.housePart.draw();
};

SIM.Window.prototype.draw = function() {
    for (var i = this.meshRoot.children.length; i >= 0; i--)
        this.meshRoot.remove(this.meshRoot.children[i]);

    this.drawEditPoints();
};

SIM.Window.prototype.canBeInsertedOn = function(parent) {
    return parent instanceof SIM.Wall;
};

SIM.Window.prototype.snapToGrid = function(p) {
    var gridSize = 0.25;
    var wall = this.root.parent.userData.housePart;
    var scaleX = wall.getAbsPoint(0).distanceTo(wall.getAbsPoint(1)) / gridSize;
    var scaleY = wall.getAbsPoint(0).distanceTo(wall.getAbsPoint(2)) / gridSize;
    p.x = Math.round(p.x * scaleX) / scaleX;
    p.y = Math.round(p.y * scaleY) / scaleY;
    return p;
};
