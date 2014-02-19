/**
 * Module dependencies.
 */

var debug = require('debug')('css-whitespace:lexer');
var scan = require('./lexer');

/**
 * Parse the given `str`, returning an AST.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

module.exports = function(str) {
  var toks = scan(str);

  if (debug.enabled) {
    var util = require('util');
    console.log(util.inspect(toks, false, 12, true));
  }

  return stmts();

  /**
   * Grab the next token.
   */

  function next() {
    return toks.shift();
  }

  /**
   * Check if the next token is `type`.
   */

  function is(type) {
    if (type == toks[0][0]) return true;
  }

  /**
   * Expect `type` or throw.
   */

  function expect(type) {
    if (is(type)) return next();
    throw new Error('expected "' + type + '", but got "' + toks[0][0] + '"');
  }

  /**
   * Transforms prop to rule
   */

  function proptorule(prop) {
    var rule = []
    rule[0] = 'rule'
    rule[1] = [prop[1] + ' ' + prop[2]]
    rule.push(block())
    return rule
  }

  /**
   * stmt+
   */

  function stmts() {
    var stmts = [];
    while (!is('eos')) stmts.push(stmt());
    return ['root', stmts];
  }

  /**
   * INDENT stmt+ OUTDENT
   */

  function block() {
    var props = [];
    expect('indent');
    while (!is('outdent')) props.push(stmt());
    expect('outdent');
    return ['block', props];
  }

  /**
   *   rule
   * | prop
   */

  function stmt() {
    if (is('rule')) return rule();
    if (is('prop')) return prop();
    if (is('propgroup')) return propgroup();
    return next();
  }

  /**
   *   prop
   * | prop INDENT rule* OUTDENT
   */

  function prop() {
    var prop = next();
    if (is('indent')) {
      return proptorule(prop)
      expect('outdent');
    }
    return prop;
  }

  /*
   * prop group
   */
  function propgroup() {
    var propgroup = next();
    propgroup[0] = 'prop'
    propgroup[2] = ''
    if (is('indent')) {
      next();
      while (!is('outdent')) {
        var tok = next()
        propgroup[2] += (propgroup[2] !== '') ? ' ' : ''
        propgroup[2] += tok[1] + ' ' + tok[2]
      }
      expect('outdent');
    }
    return propgroup;
  }

  /**
   * rule block?
   */

  function rule() {
    var rule = next();
    if (is('indent')) rule.push(block());
    return rule;
  }
}
