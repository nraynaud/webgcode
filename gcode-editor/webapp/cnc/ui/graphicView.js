"use strict";
define(['Ember', 'cnc/ui/threeDView', 'cnc/ui/twoDView', 'cnc/cam/cam'], function (Ember, threeD, TwoDView, cam) {
    var GraphicView = Ember.ContainerView.extend({
        classNames: ['viewContainer'],
        init: function () {
            this._super();
            this.pushObject(EmberThreeDView.create());
            this.pushObject(EmberTwoDView.create());
        }
    });

    var EmberThreeDView = Ember.View.extend({
        classNames: ['ThreeDView'],
        didInsertElement: function () {
            var _this = this;
            var threeDView = new threeD.ThreeDView(this.$());
            this.set('nativeComponent', threeDView);
            this.set('highlightDisplay', threeDView.createOverlayNode(threeDView.highlightMaterial));
            this.highlightChanged();
            var simulatedPath = this.get('controller.simulatedPath');
            this.addFragments(simulatedPath, 0, simulatedPath.length);
            simulatedPath.addArrayObserver({
                arrayWillChange: function (observedObj, start, removeCount, addCount) {
                    if (removeCount == observedObj.length)
                        threeDView.clearView();
                },
                arrayDidChange: function (observedObj, start, removeCount, addCount) {
                    _this.addFragments(observedObj, start, addCount);
                }
            });
        },
        addFragments: function (source, start, addCount) {
            for (var i = 0; i < addCount; i++) {
                var fragment = source[start + i];
                this.get('nativeComponent')[fragment.speedTag == 'rapid' ? 'rapidToolpathNode' : 'normalToolpathNode']
                    .addCollated(fragment.vertices);
            }
            if (addCount)
                this.get('nativeComponent').reRender();
        },
        simulatedPathChanged: function () {
            if (!this.get('controller.computing'))
                this.get('nativeComponent').zoomExtent();
        }.observes('controller.computing'),
        highlightChanged: function () {
            var highlightDisplay = this.get('highlightDisplay');
            var highlight = this.get('controller.currentHighLight');
            highlightDisplay.clear();
            if (highlight)
                highlightDisplay.addPolyLines([highlight]);
            this.get('nativeComponent').reRender();
        }.observes('controller.currentHighLight'),
        toolMoved: function () {
            var position = this.get('controller.toolPosition');
            this.get('nativeComponent').setToolVisibility(true);
            this.get('nativeComponent').setToolPosition(position.x, position.y, position.z);

        }.observes('controller.toolPosition')
    });
    var EmberTwoDView = Ember.View.extend({
        classNames: ['TwoDView'],
        didInsertElement: function () {
            var view = TwoDView.TwoDView.create({element: this.$()});
            this.set('nativeComponent', view);
            var toolpath = view.paper.group();
            var decorations = view.paper.group();
            var _this = this;
            _this.addFragments(this.get('controller.simulatedPath'), toolpath, 0, this.get('controller.simulatedPath').length);
            this.get('controller.simulatedPath').addArrayObserver({
                arrayWillChange: function (observedObj, start, removeCount, addCount) {
                    for (var i = removeCount - 1; i >= 0; i--)
                        toolpath.get([start + i]).remove();
                },
                arrayDidChange: function (observedObj, start, removeCount, addCount) {
                    _this.addFragments(observedObj, toolpath, start, addCount);
                }
            });
            this.get('controller.decorations').addArrayObserver({
                arrayWillChange: function (observedObj, start, removeCount, addCount) {
                    for (var i = removeCount - 1; i >= 0; i--)
                        decorations.get([start + i]).remove();
                },
                arrayDidChange: function (observedObj, start, removeCount, addCount) {
                    for (var i = 0; i < addCount; i++)
                        decorations.add(_this.createDecoration(decorations, observedObj[start + i]), start + i);
                }
            });
        },
        addFragments: function (source, target, start, addCount) {
            for (var i = 0; i < addCount; i++)
                target.add(this.createFragment(target, source[start + i]), start + i);
            if (addCount)
                this.get('nativeComponent').zoomExtent();
        },
        createDecoration: function (parent, decorationDescription) {
            var color = decorationDescription.color;
            return parent.path(decorationDescription.definition, true).attr({
                'vector-effect': 'non-scaling-stroke',
                fill: 'none',
                stroke: color == null ? 'yellow' : color
            })
        },
        createFragment: function (parent, fragment) {
            var polyline = [];
            var vertices = new Float32Array(fragment.vertices);
            for (var i = 0; i < vertices.length; i += 3)
                polyline.push({X: vertices[i], Y: vertices[i + 1]});
            return parent.path(cam.simplifyScaleAndCreatePathDef([polyline], 1, 0.001, false))
                .attr({class: 'toolpath ' + (fragment.speedTag == 'rapid' ? 'rapidMove' : 'normalMove')});
        },
        highlightChanged: function () {
            var highlight = this.get('controller.currentHighLight');
            var currentHighlight = this.get('highlight');
            if (currentHighlight) {
                currentHighlight.remove();
                currentHighlight = null;
            }
            if (highlight) {
                currentHighlight = this.get('nativeComponent.overlay')
                    .path(cam.simplifyScaleAndCreatePathDef([highlight.map(function (point) {
                        return {X: point.x, Y: point.y};
                    })], 1, 0.001, false))
                    .attr({fill: 'none', 'stroke': '#FF00FF', 'stroke-width': 6, 'stroke-linecap': 'round'});
            }
            this.set('highlight', currentHighlight);
        }.observes('controller.currentHighLight')
    });
    return GraphicView;
});