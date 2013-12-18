var SIM = SIM || { REVISION: '1' };

SIM.drawEditPoints = function(editPointsRoot, points) {
    for (var i = 0; i < points.length; i++) {
        if (i === editPointsRoot.children.length)
            editPointsRoot.add(new THREE.Mesh(new THREE.SphereGeometry(1)));
        editPointsRoot.children[i].position = points[i];
    }
}

SIM.Platform = function() {
    this.points = [new THREE.Vector3(), new THREE.Vector3()];
    this.root = new THREE.Object3D();
    this.editPointsRoot = new THREE.Object3D();    
};

SIM.Platform.prototype.setPreview = function(p) {
    this.points[1] = p;
    this.draw();
};

SIM.Platform.prototype.draw = function() {
    for (var i = this.root.children.length; i >= 0; i--)
        this.root.remove(this.root.children[i]);
    
    this.root.add(this.editPointsRoot);
    SIM.drawEditPoints(this.editPointsRoot, this.points);
    
    if (SIM.Platform.texture === undefined) {
        SIM.Platform.texture = THREE.ImageUtils.loadTexture("resources/textures/wall.png");
        SIM.Platform.texture.wrapS = THREE.RepeatWrapping;    
        SIM.Platform.texture.wrapT = THREE.RepeatWrapping;
        SIM.Platform.texture.repeat.x = 0.5;
    }
    
    var material = new THREE.MeshLambertMaterial();
    material.map = SIM.Platform.texture;
       
    var mesh = new THREE.Mesh(new THREE.CubeGeometry(Math.abs(this.points[1].x - this.points[0].x), Math.abs(this.points[1].z - this.points[0].z), 0.2), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = this.points[0].x + (this.points[1].x - this.points[0].x) / 2;
    mesh.position.z = this.points[0].z + (this.points[1].z - this.points[0].z) / 2;
    this.root.add(mesh);
};

SIM.Wall = function() {
    this.root = new THREE.Object3D();
    this.draw();
};

SIM.Wall.prototype.draw = function() {
    var wallTexture = THREE.ImageUtils.loadTexture("resources/textures/wall.png");
    wallTexture.wrapS = THREE.RepeatWrapping;    
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.x = 0.5;
    
    var brickMaterial = new THREE.MeshLambertMaterial();
    brickMaterial.map = wallTexture;
    brickMaterial.side = THREE.DoubleSide;
    
    var whiteMaterial = new THREE.MeshLambertMaterial();
    whiteMaterial.side = THREE.DoubleSide;
    whiteMaterial.color = whiteMaterial.ambient = new THREE.Color(0xcccccc);    
    
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.moveTo(0.5, 0);
    shape.moveTo(0.5, 2);
    shape.moveTo(3.5, 2);
    shape.moveTo(3.5, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 2.5);
    shape.lineTo(0, 2.5);
    
    // wall
    var mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 4;
    mesh.position.z = 4;
    this.root.add(mesh);
    
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.moveTo(0.7, 0);
    shape.moveTo(0.7, 2);
    shape.moveTo(3.3, 2);
    shape.moveTo(3.3, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 2.5);
    shape.lineTo(0, 2.5);
    
    // inner wall
    var mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 3.8;
    mesh.position.z = 4;
    this.root.add(mesh);
};