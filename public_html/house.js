function createHouse() {
    var house = new THREE.Object3D();
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
    
    var roofMaterial = new THREE.MeshLambertMaterial();
    roofMaterial.side = THREE.DoubleSide;
    roofMaterial.color = roofMaterial.ambient = new THREE.Color(0x999999);    
    
    var mesh;
    var shape;
    var hole;
    
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.moveTo(0.5, 0);
    shape.moveTo(0.5, 2);
    shape.moveTo(3.5, 2);
    shape.moveTo(3.5, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 2.5);
    shape.lineTo(0, 2.5);

    // right wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 4;
    mesh.position.z = 4;
    house.add(mesh);
    
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.moveTo(0.7, 0);
    shape.moveTo(0.7, 2);
    shape.moveTo(3.3, 2);
    shape.moveTo(3.3, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 2.5);
    shape.lineTo(0, 2.5);
    
    // inner right wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 3.8;
    mesh.position.z = 4;
    house.add(mesh);    

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 2.5);
    shape.lineTo(0, 2.5);
    
    // left wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    mesh.rotation.y = -Math.PI / 2;
    house.add(mesh);
    
    // inner left wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.x = 0.2;
    house.add(mesh);    

    shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.5, 0);
    shape.lineTo(0.5, 2);
    shape.lineTo(1.5, 2);
    shape.lineTo(1.5, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 2.5);
    shape.lineTo(2, 4.5);
    shape.lineTo(0, 2.5);

    hole = new THREE.Path();
    hole.moveTo(2.5, 1);
    hole.lineTo(3.5, 1);
    hole.lineTo(3.5, 2);
    hole.lineTo(2.5, 2);
    shape.holes.push(hole);

    // front wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    mesh.position.z = 4;
    house.add(mesh);
    
    // inner front wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.position.z = 3.8;
    house.add(mesh);
    
    // inner window
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2), whiteMaterial);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.x = 3;
    mesh.position.y = 1;
    mesh.position.z = 4-0.1;
    house.add(mesh);
    
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2), whiteMaterial);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.x = 3;
    mesh.position.y = 2;
    mesh.position.z = 4-0.1;
    house.add(mesh);
    
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1), whiteMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 3.5;
    mesh.position.y = 1.5;
    mesh.position.z = 4-0.1;
    house.add(mesh);    
    
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1), whiteMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 2.5;
    mesh.position.y = 1.5;
    mesh.position.z = 4-0.1;
    house.add(mesh);
    
    // inner door
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.2), whiteMaterial);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.x = 1;
    mesh.position.y = 2;
    mesh.position.z = 4-0.1;
    house.add(mesh); 
    
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 2), whiteMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 0.5;
    mesh.position.y = 1;
    mesh.position.z = 4-0.1;
    house.add(mesh);
    
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 2), whiteMaterial);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = 1.5;
    mesh.position.y = 1;
    mesh.position.z = 4-0.1;
    house.add(mesh);    
    
    shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(4, 0);
    shape.lineTo(4, 2.5);
    shape.lineTo(2, 4.5);
    shape.lineTo(0, 2.5);
    
    // back wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    house.add(mesh);
    
    // inner back wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.position.z = 0.2;
    house.add(mesh);    
    
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.moveTo(2, 0);
    shape.moveTo(2, 2);
    shape.moveTo(0, 2);

    // back wall of smaller section
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    mesh.position.x = 4;
    mesh.position.z = 0.5;
    house.add(mesh);

    var shape = new THREE.Shape();
    shape.moveTo(-0.2, 0);
    shape.moveTo(2, 0);
    shape.moveTo(2, 2);
    shape.moveTo(-0.2, 2);
    
    // inner back wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.position.x = 4;
    mesh.position.z = 0.7;
    house.add(mesh);    

    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.moveTo(2, 0);
    shape.moveTo(2, 2);
    shape.moveTo(0, 2);
    
    hole = new THREE.Path();
    hole.moveTo(0.5, 1.2);
    hole.lineTo(1.5, 1.2);
    hole.lineTo(1.5, 1.7);
    hole.lineTo(0.5, 1.7);
    shape.holes.push(hole);
    
    // front wall of smaller section
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    mesh.position.x = 4;
    mesh.position.z = 3.5;
    house.add(mesh);
    
    var shape = new THREE.Shape();
    shape.moveTo(-0.2, 0);
    shape.moveTo(2, 0);
    shape.moveTo(2, 2);
    shape.moveTo(-0.2, 2);
    
    // inner front wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.position.x = 4;
    mesh.position.z = 3.3;
    house.add(mesh);
    
    var shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.moveTo(3, 0);
    shape.moveTo(3, 2);
    shape.moveTo(0, 2);

    hole = new THREE.Path();
    hole.moveTo(0.5, 1.2);
    hole.lineTo(2.5, 1.2);
    hole.lineTo(2.5, 1.7);
    hole.lineTo(0.5, 1.7);
    shape.holes.push(hole);

    // right wall of smaller section
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), brickMaterial);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.x = 6;
    mesh.position.z = 0.5;
    house.add(mesh);
    
    // inner right wall
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), whiteMaterial);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.x = 5.8;
    mesh.position.z = 0.5;
    house.add(mesh);    

    shape = new THREE.Shape();
    shape.moveTo(-0.2, -3.5);
    shape.lineTo(4.2, -3.5);
    shape.lineTo(4.2, 0);
    shape.lineTo(-0.2, 0);

    // gable roof part 1
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), roofMaterial);
    mesh.rotation.x = -Math.PI / 4;
    mesh.rotation.y = Math.PI / 2;
    mesh.rotation.order = "ZYX";
    mesh.position.x = 2;
    mesh.position.y = 4.5;
    mesh.position.z = 4;
    house.add(mesh);

    // gable roof part 2
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), roofMaterial);
    mesh.rotation.x = Math.PI / 4;
    mesh.rotation.y = Math.PI / 2;
    mesh.rotation.order = "ZYX";
    mesh.position.x = 2;
    mesh.position.y = 4.5;
    mesh.position.z = 4;
    house.add(mesh);
    
    shape = new THREE.Shape();
    shape.moveTo(-0.2, 0);
    shape.lineTo(2.3, 0);
    shape.lineTo(2.3, 3.6);
    shape.lineTo(-0.2, 3.6);

    // roof of smaller section
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), roofMaterial);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.x = 4;
    mesh.position.y = 2;
    mesh.position.z = 3.8;
    house.add(mesh);    
    
    return house;
}