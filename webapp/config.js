requirejs.config({
    paths: {
        text: 'libs/require_text',
        Ember: "libs/ember-1.5.0-beta5.pre7",
        Handlebars: "libs/handlebars-v1.3.0",
        jQuery: "libs/jquery.min",
        Three: 'libs/Three.min',
        ace: 'libs/ace/src-noconflict/ace'
    },
    shim: {
        jQuery: {
            exports: "$"
        },
        'libs/jquery.mousewheel': {
            deps: ["jQuery"]
        },
        Ember: {
            deps: ["jQuery", "Handlebars"],
            exports: "Ember"
        },
        Three: {exports: 'THREE'},
        'libs/OrbitControls': {deps: ['Three'], exports: 'THREE.OrbitControls'},
        ace: {exports: 'ace'},
        'libs/svj.js': {exports: 'SVG'}
    }
});