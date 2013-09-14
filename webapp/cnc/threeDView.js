"use strict";

function ThreeDView($container) {
    var self = this;
    var WIDTH = $container.width();
    var HEIGHT = $container.height();
    this.renderer = new THREE.WebGLRenderer({antialias: true});

    this.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
    this.scene = new THREE.Scene();
    this.camera.position.x = 30;
    this.camera.position.y = 30;
    this.camera.position.z = 30;
    this.camera.up.set(0, 0, 1);
    this.renderer.setSize(WIDTH, HEIGHT);
    function resize() {
        self.camera.aspect = $container.width() / $container.height();
        self.camera.updateProjectionMatrix();
        self.renderer.setSize($container.width(), $container.height());
        self.renderer.render(self.scene, self.camera);
    }

    $(window).resize(resize);
    $container.append(this.renderer.domElement);
    this.scene.add(this.camera);
    this.controls = new THREE.TrackballControls(this.camera, $container[0]);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;
    this.controls.minDistance = 3;
    this.controls.keys = [ 65, 83, 68 ];
    this.controls.addEventListener('change', function () {
        self.renderer.render(self.scene, self.camera);
    });
    var planeGeometry = new THREE.PlaneGeometry(10, 10, 5, 5);
    this.scene.add(new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({wireframe: true, color: 0x00CC00})));
    function createAxis(x, y, z, color) {
        var geom = new THREE.Geometry();
        geom.vertices.push(new THREE.Vector3(0, 0, 0));
        geom.vertices.push(new THREE.Vector3(x, y, z));
        return new THREE.Line(geom, new THREE.LineBasicMaterial({color: color}));
    }

    var axes = new THREE.Object3D();
    axes.add(createAxis(10, 0, 0, 0xFF0000));
    axes.add(createAxis(0, 10, 0, 0x00FF00));
    axes.add(createAxis(0, 0, 10, 0x0000FF));
    this.scene.add(axes);
    this.tool = new THREE.Object3D();
    var toolbit = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 10, 20, 2, false), new THREE.MeshPhongMaterial({emissive: 0xEF0000, specular: 0x0F0000, shininess: 204, color: 0xF0F0F0, opacity: 0.5, transparent: true}));
    toolbit.translateY(5);
    var spindle = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 15, 25, 2, false), new THREE.MeshPhongMaterial({emissive: 0xEFEFEF, specular: 0x0F0F0F, shininess: 204, color: 0xF0F0F0, opacity: 0.5, transparent: true}));
    spindle.translateY(17.5);
    this.tool.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    this.tool.add(toolbit);
    this.tool.add(spindle);
    this.tool.matrixAutoUpdate = true;
    this.scene.add(this.tool);
    function animate() {
        requestAnimationFrame(animate);
        self.controls.update();
    }

    animate();
}

ThreeDView.prototype.displayPath = function (path) {
    var lineGeometry = new THREE.Geometry();
    for (var i = 0; i < path.length; i++) {
        var p = path[i];
        lineGeometry.vertices.push(new THREE.Vector3(p.x, p.y, p.z));
    }
    lineGeometry.verticesNeedUpdate = true;
    if (this.toolpath)
        this.scene.remove(this.toolpath);
    this.toolpath = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({color: 0xCCCCCC}));
    this.scene.add(this.toolpath);
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
};

ThreeDView.prototype.displayVector = function (origin, vector, color, id) {
    this.displayPath([origin, {x: origin.x + vector.x, y: origin.y + vector.y, z: origin.z + vector.z}]);
};