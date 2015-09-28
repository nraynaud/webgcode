"use strict";
define(['THREE', 'libs/threejs/CSS3DRenderer', 'libs/threejs/OrbitControls'], function (THREE, CSS3DRenderer, OrbitControls) {
    function createCubeManipulator(view) {
        var renderer = new CSS3DRenderer();
        var width = 100;
        var height = 100;
        renderer.setSize(width, height);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = 0;
        $(renderer.domElement).addClass('viewCube');
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(40, width / height, 1, 100);
        camera.up.set(0, 0, 1);
        camera.position.set(200, 100, 250);
        var controls = new OrbitControls(camera, renderer.domElement);
        controls.noZoom = true;
        controls.noPan = true;
        controls.maxDistance = 250;
        controls.minDistance = 250;
        controls.update();
        function myChangePropagator() {
            var radius = view.camera.position.clone().sub(view.controls.target).length();
            view.camera.position.copy(camera.position);
            view.camera.position.normalize().multiplyScalar(radius).add(view.controls.target);
            view.reRender();
        }

        controls.addEventListener('change', function () {
            renderer.render(scene, camera);
        });
        controls.addEventListener('start', function () {
            view.controls.removeEventListener('change', updatePositionFromView);
            controls.addEventListener('change', myChangePropagator);
        });
        controls.addEventListener('end', function () {
            controls.removeEventListener('change', myChangePropagator);
            view.controls.addEventListener('change', updatePositionFromView);
        });
        var r = Math.PI / 2;
        var d = 49.5;//slight inset to help mask the seams between the faces
        var faces = [
            {pos: [d, 0, 0], rot: [r, r, 0], name: 'Right', camera: [1, 0, 0]},
            {pos: [-d, 0, 0], rot: [r, -r, 0], name: 'Left', camera: [-1, 0, 0]},
            {pos: [0, d, 0], rot: [-r, 0, 2 * r], name: 'Back', camera: [0, 1, 0]},
            {pos: [0, -d, 0], rot: [r, 0, 0], name: 'Front', camera: [0, -1, 0]},
            {pos: [0, 0, d], rot: [0, 0, 0], name: 'Top', camera: [0, 0, 1]},
            {pos: [0, 0, -d], rot: [0, 2 * r, 2 * r], name: 'Bottom', camera: [0, 0, -1]}
        ];
        var cube = new THREE.Object3D();
        scene.add(cube);
        function createFace(face) {
            var element = $('<div></div>')
                .html(face.name)
                .addClass('cubeFace');

            function mouseMoveHandler() {
                element.unbind('click', clickHandler);
                element.unbind('mousemove', mouseMoveHandler);
            }

            function clickHandler() {
                view.zoomExtent(new THREE.Vector3().fromArray(face.camera));
                element.unbind('click', clickHandler);
                element.unbind('mousemove', mouseMoveHandler);
            }

            element.mousedown(function () {
                element.click(clickHandler);
                element.mousemove(mouseMoveHandler);
            });
            var object = new THREE.CSS3DObject(element[0]);
            object.position.fromArray(face.pos);
            object.rotation.fromArray(face.rot);
            return object;
        }

        for (var i = 0; i < faces.length; i++)
            cube.add(createFace(faces[i]));
        renderer.render(scene, camera);
        function updatePositionFromView() {
            camera.position.copy(view.camera.position);
            camera.position.sub(view.controls.target);
            controls.update();
        }

        view.controls.addEventListener('change', updatePositionFromView);
        return $(renderer.domElement);
    }

    return createCubeManipulator;
});