"use strict";
define(['libs/svg'], (function (SVG) {
    SVG.Marker = SVG.invent({
        create: 'marker',
        inherit: SVG.Container,
        extend: {
            getRef: function () {
                return 'url(#' + this.attr('id') + ')'
            },
            update: function (block) {
                this.clear();
                if (typeof block == 'function')
                    block.call(this, this)
                return this
            },
            toString: function () {
                return this.getRef()
            }
        },
        construct: {
            marker: function (refX, refY, width, height, block) {
                return this.defs().marker(refX, refY, width, height, block)
            }
        }
    });

    SVG.extend(SVG.Defs, {
        // Define gradient
        marker: function (refX, refY, width, height, block) {
            return this.put(new SVG.Marker).update(block).attr({
                refX: refX, refY: refY, markerWidth: width, markerHeight: height, orient: 'auto'
            })
        }
    });

    SVG.extend(SVG.Container, {
        // Define filter on defs
        filter: function (block) {
            return this.defs().filter(block)
        }

    });
    return SVG;
}));