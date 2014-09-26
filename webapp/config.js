requirejs.config({
    paths: {
        text: 'libs/require_text',
        Ember: "libs/ember-1.5.0-beta5.pre7",
        EmberData: "libs/ember-data-1.0.0-beta7",
        Handlebars: "libs/handlebars-v1.3.0",
        jQuery: "libs/jquery-1.11.1.min",
        THREE: 'libs/threejs/Three.min',
        TWEEN: 'libs/tween.min',
        ace: 'libs/ace/src-noconflict/ace',
        RSVP: 'libs/rsvp-latest',
        clipper: 'libs/clipper_unminified'
    },
    shim: {
        'jQuery': {exports: '$'},
        'libs/jquery.mousewheel': {deps: ["jQuery"]},
        Ember: {
            deps: ["jQuery", "Handlebars"],
            exports: "Ember"
        },
        EmberData: {deps: ["Ember"], exports: "DS"},
        THREE: {exports: 'THREE'},
        TWEEN: {exports: 'TWEEN'},
        'libs/threejs/OrbitControls': {deps: ['THREE'], exports: 'THREE.OrbitControls'},
        'libs/threejs/TrackballControls': {deps: ['THREE'], exports: 'THREE.TrackballControls'},
        'libs/threejs/CSS3DRenderer': {deps: ['THREE'], exports: 'THREE.CSS3DRenderer'},
        ace: {exports: 'ace'},
        'libs/svg-parser': {deps: ['libs/svg']},
        'libs/svg-import': {deps: ['libs/svg', 'libs/svg-parser']},
        RSVP: {exports: 'RSVP'},
        'templates': {deps: ['Ember']},
        'clipper': {exports: 'ClipperLib'}
    }
});