function createHouse() {
    var house = new THREE.Object3D();
    var wallTexture = THREE.ImageUtils.loadTexture("resources/textures/wall.png");
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;

    var material = new THREE.MeshLambertMaterial();
    material.map = wallTexture;
    material.side = THREE.DoubleSide;
    material.color = material.ambient = new THREE.Color(0xff9900);
    
    var simpleWallShape = new THREE.Shape();
    simpleWallShape.moveTo(-1, -1);
    simpleWallShape.lineTo(1, -1);
    simpleWallShape.lineTo(1, 1);
    simpleWallShape.lineTo(-1, 1);

    var gableWallShape = new THREE.Shape();
    gableWallShape.moveTo(-1, -1);
    gableWallShape.lineTo(1, -1);
    gableWallShape.lineTo(1, 1);
    gableWallShape.lineTo(0, 2);
    gableWallShape.lineTo(-1, 1);

    var mesh = new THREE.Mesh(new THREE.ShapeGeometry(gableWallShape), material);
    house.add(mesh);

    mesh = new THREE.Mesh(new THREE.ShapeGeometry(simpleWallShape), material);
    mesh.rotation.y = -Math.PI / 2;
    mesh.position.x = 1;
    mesh.position.z = 1;
    house.add(mesh);

    mesh = new THREE.Mesh(new THREE.ShapeGeometry(simpleWallShape), material);
    mesh.rotation.y = Math.PI / 2;
    mesh.position.x = -1;
    mesh.position.z = 1;
    house.add(mesh);

    var frontWallShape = new THREE.Shape();
    frontWallShape.moveTo(-1, -1);
    frontWallShape.lineTo(-0.8, -1);
    frontWallShape.lineTo(-0.8, 0.5);
    frontWallShape.lineTo(-0.2, 0.5);
    frontWallShape.lineTo(-0.2, -1);
    frontWallShape.lineTo(1, -1);
    frontWallShape.lineTo(1, 1);
    frontWallShape.lineTo(0, 2);
    frontWallShape.lineTo(-1, 1);

    var windowHole = new THREE.Path();
    windowHole.moveTo(0.2, 0);
    windowHole.lineTo(0.8, 0);
    windowHole.lineTo(0.8, 0.7);
    windowHole.lineTo(0.2, 0.7);
    frontWallShape.holes.push(windowHole);

    var frontMesh = new THREE.Mesh(new THREE.ShapeGeometry(frontWallShape), material);
    frontMesh.rotation.y = Math.PI;
    frontMesh.position.z = 2;
    house.add(frontMesh);

    var roofMaterial = new THREE.MeshLambertMaterial();
    roofMaterial.side = THREE.DoubleSide;
    roofMaterial.color = roofMaterial.ambient = new THREE.Color(0x999999);
    
    var roofShape = new THREE.Shape();
    roofShape.moveTo(-0.2, -2);
    roofShape.lineTo(2.2, -2);
    roofShape.lineTo(2.2, 0);
    roofShape.lineTo(-0.2, 0);

    var roofMesh1 = new THREE.Mesh(new THREE.ShapeGeometry(roofShape), roofMaterial);
    roofMesh1.rotation.x = -Math.PI / 4;
    roofMesh1.rotation.y = Math.PI / 2;
    roofMesh1.rotation.order = "ZYX";
    roofMesh1.position.y = 2;
    roofMesh1.position.z = 2;
    house.add(roofMesh1);

    var roofMesh2 = new THREE.Mesh(new THREE.ShapeGeometry(roofShape), roofMaterial);
    roofMesh2.rotation.x = Math.PI / 4;
    roofMesh2.rotation.y = Math.PI / 2;
    roofMesh2.rotation.order = "ZYX";
    roofMesh2.position.y = 2;
    roofMesh2.position.z = 2;
    house.add(roofMesh2);
    return house;
}