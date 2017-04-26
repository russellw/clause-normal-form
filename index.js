'use strict'
var assert = require('assert')
var bigInt = require('big-integer')
var bigRat = require('big-rational')
var clone = require('clone')
var iop = require('iop')

var clauses
var funCount = 0
var variableCount = 0

function alternate(a, i, alts) {
	var r = []
	for (var alt of alts) {
		var b = Array.from(a)
		b[i] = alt
		r.push(b)
	}
	return r
}

function bool(val) {
	assert(typeof val === 'boolean')
	var a = []
	a.op = 'bool'
	a.toString = function () {
		return this.val
	}
	a.val = val
	return a
}

function call(f, args) {
	assert(!args.op)
	var a = Array.from(args)
	a.op = 'call'
	a.f = f
	a.toString = function () {
		return this.f + '(' + this.join(', ') + ')'
	}
	return a
}

function complex(a) {
	switch (a.op) {
	case '!':
	case '?':
	case '~':
		return complex(a[0])
	case '&':
	case '<=>':
	case '<~>':
	case '=>':
	case '|':
	case '~&':
	case '~|':
		return true
	}
}

function convert(a) {
	assert(isTerm(a))
	clauses = term('&')
	convert1(a)
	return clauses
}

function convert1(a) {
	var variables = freeVariables(a)
	if (variables.length)
		a = quant('!', variables, a)

	// Process steps
	a = lowerNot(a, true)
	a = eliminateQuantifiers(a)
	a = eliminateEqv(a)
	a = raiseAnd(a)

	// Flatten &
	var cs = []
	flatten('&', a, cs)

	// Flatten |
	for (var c of cs) {
		var clause = term('|')
		flatten('|', c, clause)
		clauses.push(clause)
	}
}

function distinct_obj(name) {
	assert(typeof name === 'string')
	var a = []
	a.name = name
	a.op = 'distinct_obj'
	a.toString = function () {
		return '"' + this.name + '"'
	}
	return a
}

function eliminateEqv(a) {
	a = map(a, eliminateEqv)
	if (a.op !== '<=>')
		return a

	function rename(a) {
		if (!complex(a))
			return a
		var b = skolem(freeVariables(a))
		a = term('&', term('=>', a, b), term('=>', b, a))
		convert1(a)
		return b
	}

	var x = rename(a[0])
	var y = rename(a[1])
	a = term('&', term('=>', x, y), term('=>', y, x))
	a = lowerNot(a, true)
	return a
}

function eliminateQuantifiers(a, bound) {
	switch (a.op) {
	case '!':
		for (var x of a.variables) {
			var y = variable()
			bound = iop.put(bound, x, y)
		}
		return eliminateQuantifiers(a[0], bound)
	case '?':
		for (var x of a.variables) {
			var y = skolem(vals(bound).filter(a => a.op === 'variable'))
			bound = iop.put(bound, x, y)
		}
		return eliminateQuantifiers(a[0], bound)
	case 'variable':
		var val = iop.get(bound, a)
		if (val)
			return val
		return a
	}
	return map(a, x => eliminateQuantifiers(x, bound))
}

function eq(a, b) {
	assert(isTerm(a))
	assert(isTerm(b))
	if (a === b)
		return true
	if (a.op !== b.op)
		return
	if (a.variables) {
		if (a.variables.length !== b.variables.length)
			return
		for (var i = 0; i < a.variables.length; i++)
			if (a.variables[i] !== b.variables[i])
				return
	}
	if (a.length !== b.length)
		return
	for (var i = 0; i < a.length; i++)
		if (!eq(a[i], b[i]))
			return
	switch (a.op) {
	case 'bool':
		return a.val === b.val
	case 'call':
		return a.f === b.f
	case 'distinct_obj':
	case 'fun':
	case 'variable':
		return
	case 'integer':
	case 'rational':
	case 'real':
		return a.val.eq(b.val)
	}
	return true
}

function eqFalse(a) {
	return a.op === 'bool' && !a.val
}

function eqTrue(a) {
	return a.op === 'bool' && a.val
}

function evaluate(a, m) {
	assert(isTerm(a))
	if (m) {
		var r = m.get(a)
		if (r)
			return r
	}
	a = map(a, x => evaluate(x, m))
	switch (a.op) {
	case '!=':
		if (eq(a[0], a[1]))
			return bool(false)
		if (isConst(a[0]) && isConst(a[1]))
			return bool(true)
		break
	case '&':
		var args = a.filter(x => !eqTrue(x))
		a = term(a.op, ...args)
		switch (a.length) {
		case 0:
			return bool(true)
		case 1:
			return a[0]
		}
		if (a.some(eqFalse))
			return bool(false)
		break
	case '<':
		if (eq(a[0], a[1]))
			return bool(false)
		if (a[0].op !== a[1].op)
			break
		switch (a[0].op) {
		case 'integer':
		case 'rational':
		case 'real':
			return bool(a[0].val.lt(a[1].val))
		}
		break
	case '<=':
		if (eq(a[0], a[1]))
			return bool(true)
		if (a[0].op !== a[1].op)
			break
		switch (a[0].op) {
		case 'integer':
		case 'rational':
		case 'real':
			return bool(a[0].val.leq(a[1].val))
		}
		break
	case '=':
		if (eq(a[0], a[1]))
			return bool(true)
		if (isConst(a[0]) && isConst(a[1]))
			return bool(false)
		break
	case '|':
		var args = a.filter(x => !eqFalse(x))
		a = term(a.op, ...args)
		switch (a.length) {
		case 0:
			return bool(false)
		case 1:
			return a[0]
		}
		if (a.some(eqTrue))
			return bool(true)
		break
	case '~':
		if (a[0].op !== 'bool')
			break
		return bool(!a[0].val)
	}
	return a
}

function flatten(op, a, cs) {
	if (a.op === op)
		for (var x of a) {
			flatten(op, x, cs)
			return
		}
	cs.push(a)
}

function freeVariables(a) {
	var r = new Set()

	function rec(a, bound) {
		switch (a.op) {
		case '!':
		case '?':
			for (var x of a.variables)
				bound = iop.put(bound, x, x)
			break
		case 'variable':
			if (!iop.get(bound, a))
				r.add(a)
			break
		}
		for (var x of a)
			rec(x, bound)
	}

	rec(a)
	return Array.from(r)
}

function fun(name) {
	var a = []
	a.name = name
	a.op = 'fun'
	a.toString = function () {
		if (!this.name)
			this.name = letter(funCount++).toLowerCase()
		return this.name
	}
	return a
}

function integer(val) {
	switch (typeof val) {
	case 'number':
	case 'string':
		val = bigInt(val)
		break
	}
	var a = []
	a.op = 'integer'
	a.toString = function () {
		return this.val
	}
	a.val = val
	return a
}

function isConst(a) {
	switch (a.op) {
	case 'bool':
	case 'distinct_obj':
	case 'integer':
	case 'rational':
	case 'real':
		return true
	}
}

function isTerm(a) {
	if (!Array.isArray(a))
		return
	if (typeof a.op !== 'string')
		return
	return true
}

function isomorphic(a, b, m=new Map()) {
	if (a === b)
		return m
	if (a.op !== b.op)
		return
	if (a.op === 'variable') {
		var x = m.get(a)
		if (x === b)
			return m
		if (!x) {
			m.set(a, b)
			return m
		}
		return
	}
	if (a.fun !== b.fun)
		return
	if (!a.length) {
		if (eq(a, b))
			return m
		return
	}
	if (a.length !== b.length)
		return
	for (var i = 0; i < a.length && m; i++)
		m = isomorphic(a[i], b[i], m)
	return m
}

function letter(n) {
	if (n < 26)
		return String.fromCharCode(65 + n)
	return 'Z' + (n - 25)
}

function lowerNot(a, sign) {
	assert(typeof sign === 'boolean')
	switch (a.op) {
	case '!':
		return quant(sign ? '!' : '?', a.variables, lowerNot(a[0], sign))
	case '!=':
		return lowerNot(term('=', ...a), !sign)
	case '&':
		return term(sign ? '&' : '|', ...a.map(x => lowerNot(x, sign)))
	case '<=>':
		return term(a.op, lowerNot(a[0], sign), lowerNot(a[1], true))
	case '<~>':
		return lowerNot(term('<=>', ...a), !sign)
	case '=>':
		return lowerNot(term('|', term('~', a[0]), a[1]), sign)
	case '?':
		return quant(sign ? '?' : '|', a.variables, lowerNot(a[0], sign))
	case '|':
		return term(sign ? '|' : '&', ...a.map(x => lowerNot(x, sign)))
	case '~':
		return lowerNot(a[0], !sign)
	case '~&':
		return lowerNot(term('&', ...a), !sign)
	case '~|':
		return lowerNot(term('|', ...a), !sign)
	}
	if (sign)
		return a
	return term('~', a)
}

function map(a, f) {
	if (!a.length)
		return a
	a = clone(a, false, 1)
	for (var i = 0; i < a.length; i++)
		a[i] = f(a[i])
	return a
}

function occurs(a, b, m) {
	if (a === b)
		return true
	if (m) {
		var b1 = m.get(b)
		if (b1)
			return occurs(a, b1, m)
	}
	for (var x of b)
		if (occurs(a, x, m))
			return true
}

function quant(op, variables, arg) {
	assert(typeof op === 'string')
	assert(variables.every(x => x.op === 'variable'))
	assert(isTerm(arg))
	var a = [arg]
	a.op = op
	a.toString = function () {
		return this.op + '[' + this.variables.join(', ') + ']: ' + this[0]
	}
	a.variables = variables
	return a
}

function raiseAnd(a) {

	function rename(a) {
		if (!complex(a))
			return a
		var b = skolem(freeVariables(a))
		a = term('=>', b, a)
		convert1(a)
		return b
	}

	switch (a.op) {
	case '&':
		return map(a, raiseAnd)
	case '|':
		a = map(a, raiseAnd)
		if (iop.count(a, x => x.op === '&') === 1) {
			var cs = []
			var i = a.findIndex(x => x.op === '&')
			flatten('&', a[i], cs)
			cs = alternate(a, i, cs)
			return term('&', ...cs)
		}
		return map(a, x => x.op === '&' ? rename(x) : x)
	}
	return a
}

function rational(val) {
	switch (typeof val) {
	case 'number':
	case 'string':
		val = bigRat(val)
		break
	}
	var a = []
	a.op = 'rational'
	a.toString = function () {
		return this.val
	}
	a.val = val
	return a
}

function real(val) {
	switch (typeof val) {
	case 'number':
	case 'string':
		val = bigRat(val)
		break
	}
	var a = []
	a.op = 'real'
	a.toString = function () {
		return this.val
	}
	a.val = val
	return a
}

function skolem(args) {
	return {
		args,
		fun: {
			op: 'fun',
		},
		op: 'call',
	}
}

function term(op, ...args) {
	var a = Array.from(args)
	a.op = op
	a.toString = function () {
		return op + '(' + this.join(', ') + ')'
	}
	return a
}

function unify(a, b, m=new Map()) {
	if (a === b)
		return m
	if (a.op === 'variable')
		return unifyVariable(a, b, m)
	if (b.op === 'variable')
		return unifyVariable(b, a, m)
	if (a.op !== b.op)
		return
	if (!a.length) {
		if (eq(a, b))
			return m
		return
	}
	if (a.f !== b.f)
		return
	if (a.length !== b.length)
		return
	for (var i = 0; i < a.length && m; i++)
		m = unify(a[i], b[i], m)
	return m
}

function unifyVariable(a, b, m) {
	var a1 = m.get(a)
	if (a1)
		return unify(a1, b, m)
	var b1 = m.get(b)
	if (b1)
		return unify(a, b1, m)
	if (occurs(a, b, m))
		return
	m.set(a, b)
	return m
}

function vals(m) {
	for (var r = []; m; m = m.outer)
		r.push(m.val)
	return r
}

function variable(name) {
	var a = []
	a.name = name
	a.op = 'variable'
	a.toString = function () {
		if (!this.name)
			this.name = letter(variableCount++)
		return this.name
	}
	return a
}

exports.bool = bool
exports.call = call
exports.convert = convert
exports.distinct_obj = distinct_obj
exports.eq = eq
exports.evaluate = evaluate
exports.fun = fun
exports.integer = integer
exports.isomorphic = isomorphic
exports.occurs = occurs
exports.quant = quant
exports.rational = rational
exports.real = real
exports.term = term
exports.unify = unify
exports.variable = variable
