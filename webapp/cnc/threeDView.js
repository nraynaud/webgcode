"use strict";
define(function () {

    function ThreeDView($container) {
        var self = this;
        var WIDTH = $container.width();
        var HEIGHT = $container.height();
        if (window.WebGLRenderingContext)
            this.renderer = new THREE.WebGLRenderer({antialias: true});
        else
            this.renderer = new THREE.CanvasRenderer();
        this.camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 20000);
        this.scene = new THREE.Scene();
        this.camera.position.x = 30;
        this.camera.position.y = -30;
        this.camera.position.z = 60;
        this.camera.up.set(0, 1, 0);
        this.renderer.setSize(WIDTH, HEIGHT);
        function resize() {
            self.camera.aspect = $container.width() / $container.height();
            self.camera.updateProjectionMatrix();
            self.renderer.setSize($container.width(), $container.height());
            self.reRender();
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
            self.reRender();
        });
        function createGrid() {
            var size = 10, step = 5;
            var grid = new THREE.GridHelper(size, step);
            grid.rotation = new THREE.Euler(Math.PI / 2, 0, 0);
            grid.setColors(0x00CC00, 0x00CC00);
            return  grid;
        }

        this.scene.add(createGrid());
        function createAxis(x, y, z, color) {
            return  new THREE.ArrowHelper(new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 0), 10, color, 1, 1);
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
        this.setToolVisibility(false);
        this.scene.add(this.tool);
        function animate() {
            requestAnimationFrame(animate);
            self.controls.update();
        }

        animate();
    }

    ThreeDView.prototype = {
        displayPath: function (path) {
            var lineGeometry = new THREE.BufferGeometry();
            lineGeometry.addAttribute('position', Float32Array, path.length / 3, 3);
            lineGeometry.attributes.position.array = path;
            lineGeometry.verticesNeedUpdate = true;
            if (this.toolpath)
                this.scene.remove(this.toolpath);
            this.toolpath = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({linewidth: 1.5, color: 0xCCCCCC}));
            lineGeometry.computeBoundingBox();
            var bbox = lineGeometry.boundingBox;
            var extentMiddle = bbox.min.add(bbox.max).divideScalar(2);
            this.controls.target = extentMiddle;
            this.controls.position = extentMiddle.add(new THREE.Vector3(0, -10, -30));
            this.scene.add(this.toolpath);
            this.controls.update();
            this.reRender();
        },
        displayVector: function (origin, vector, color, id) {
            this.displayPath([origin, {x: origin.x + vector.x, y: origin.y + vector.y, z: origin.z + vector.z}]);
        },
        clearToolpath: function () {
            if (this.toolpath)
                this.scene.remove(this.toolpath);
            this.reRender();
        },
        displayHighlight: function (polyline) {
            this.hideHighlight();
            var lineGeometry = new THREE.Geometry();
            for (var i = 0; i < polyline.length; i++)
                lineGeometry.vertices.push(new THREE.Vector3(polyline[i].x, polyline[i].y, polyline[i].z));
            lineGeometry.verticesNeedUpdate = true;
            var material = new THREE.LineBasicMaterial({depthWrite: false, overdraw: true, linewidth: 6, color: 0xFF00FF});
            this.highlight = new THREE.Line(lineGeometry, material);
            this.highlight.renderDepth = 1;
            this.scene.add(this.highlight);
            this.reRender();
        },
        hideHighlight: function () {
            if (this.highlight) {
                this.scene.remove(this.highlight);
                this.highlight = null;
                this.reRender();
            }
        },
        setToolVisibility: function (visible) {
            this.tool.traverse(function (child) {
                child.visible = visible;
            });
        },
        setToolPosition: function (x, y, z) {
            this.tool.position.setX(x);
            this.tool.position.setY(y);
            this.tool.position.setZ(z);
        },
        reRender: function () {
            this.renderer.render(this.scene, this.camera);
        }
    };
    return {ThreeDView: ThreeDView};
});