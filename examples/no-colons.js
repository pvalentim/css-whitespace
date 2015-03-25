
/**
 * Module dependencies.
 */

var fs = require('fs')
  , compile = require('..')
  , read = fs.readFileSync

var str = read('examples/no-colons.css', 'utf8');
var css = compile(str);
