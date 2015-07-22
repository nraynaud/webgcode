#!/bin/sh

node_modules/ember-precompile/bin/ember-precompile `find templates -name *.hbs` -b templates/ -f templates.js