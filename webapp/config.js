requirejs.config({
    paths: {
        text: 'libs/require_text',
        Firebase: 'libs/firebase',
        Ember: "libs/ember.min",
        EmberData: "libs/ember-data.min",
        EmberFire: "libs/emberfire.min",
        Handlebars: "libs/handlebars-v1.3.0",
        jQuery: "libs/jquery-1.11.1.min",
        THREE: 'libs/threejs/Three.min',
        TWEEN: 'libs/threejs/tween.min',
        ace: 'libs/ace/src-noconflict/ace',
        RSVP: 'libs/rsvp-latest',
        clipper: 'libs/clipper_unminified',
        canvg: 'libs/canvg/canvg',
        bootstrap: 'libs/bootstrap/js/bootstrap.min'
    },
    shim: {
        jQuery: {exports: '$'},
        bootstrap: { deps: ['jQuery'] },
        'libs/jquery.mousewheel': {deps: ["jQuery"]},
        Ember: {
            deps: ["jQuery", "Handlebars"],
            exports: "Ember"
        },
        canvg: {deps: ["libs/canvg/rgbcolor.js"], exports: "canvg"},
        EmberData: {deps: ["Ember"], exports: "DS"},
        Firebase: {exports: 'Firebase'},
        EmberFire: {deps: ["EmberData", "Firebase"], exports: "DS"},
        THREE: {exports: 'THREE'},
        TWEEN: {exports: 'TWEEN'},
        'libs/threejs/OrbitControls': {deps: ['THREE'], exports: 'THREE.OrbitControls'},
        'libs/threejs/TrackballControls': {deps: ['THREE'], exports: 'THREE.TrackballControls'},
        'libs/threejs/CSS3DRenderer': {deps: ['THREE'], exports: 'THREE.CSS3DRenderer'},
        ace: {exports: 'ace'},
        'libs/svg-parser': {deps: ['libs/svg']},
        'libs/svg-import': {deps: ['libs/svg', 'libs/svg-parser']},
        RSVP: {exports: 'RSVP'},
        templates: {deps: ['Ember']},
        clipper: {exports: 'ClipperLib'}
    }
});