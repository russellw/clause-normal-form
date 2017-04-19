'use strict'
var bigInt = require('big-integer')
var bigRat = require('big-rational')
var clone = require('clone')
var iop = require('iop')

var clauses

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
	var a = []
	a.op = 'bool'
	a.val = val
	return a
}

function complex(a) {
	switch (a.op) {
	case '!':
	case '?':
	case '~':
		return complex(a.args[0])
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
	if (typeof a.op !== 'string')
		throw new Error(a)
	clauses = []
	convert1(a)
	return clauses
}

function convert1(a) {
	var variables = freeVariables(a)
	if (variables.length)
		a = {
			args: [a],
			op: '!',
			variables,
		}

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
		var literals = []
		flatten('|', c, literals)
		clauses.push({
			args: literals,
			op: '|',
		})
	}
}

function distinct_obj(name) {
	var a = []
	a.name = name
	a.op = 'distinct_obj'
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
		a = {
			args: [
				{
					args: [a, b],
					op: '=>',
				},
				{
					args: [b, a],
					op: '=>',
				},
			],
			op: '&',
		}
		convert1(a)
		return b
	}

	var x = rename(a.args[0])
	var y = rename(a.args[1])
	var args = [
		{
			args: [x, y],
			op: '=>',
		},
		{
			args: [y, x],
			op: '=>',
		},
	]
	a = {
		args,
		op: '&',
	}
	a = lowerNot(a, true)
	return a
}

function eliminateQuantifiers(a, bound) {
	switch (a.op) {
	case '!':
		var variables = a.variables.map(x => {
			var y = {
				op: 'variable',
			}
			bound = iop.put(bound, x, y)
			return y
		})
		var args = a.args.map(x => eliminateQuantifiers(x, bound))
		return {
			args,
			op: a.op,
			variables,
		}
	case '?':
		var variables = a.variables.map(x => {
			var y = skolem(vals(bound).filter(a => a.op === 'variable'))
			bound = iop.put(bound, x, y)
			return y
		})
		var args = a.args.map(x => eliminateQuantifiers(x, bound))
		return {
			args,
			op: a.op,
			variables,
		}
	case 'variable':
		var val = iop.get(bound, a)
		if (val)
			return val
		return a
	}
	return map(a, x => eliminateQuantifiers(x, bound))
}

function evaluate(a, m) {
	if (m) {
		var r = m.get(a)
		if (r)
			return r
	}
	return a
}

function flatten(op, a, cs) {
	if (a.op === op)
		for (var x of a.args) {
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
		for (var x of a.args)
			rec(x, bound)
	}

	rec(a)
	return Array.from(r)
}

function fun(name) {
	var a = []
	a.name = name
	a.op = 'fun'
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
	a.val = val
	return a
}

function lowerNot(a, sign) {
	switch (a.op) {
	case '!':
		var args = a.args.map(x => lowerNot(x, sign))
		return {
			args,
			op: sign ? '!' : '?',
			variables: a.variables,
		}
	case '!=':
		return lowerNot({
			args: a.args,
			op: '=',
		}, !sign)
	case '&':
		var args = a.args.map(x => lowerNot(x, sign))
		return {
			args,
			op: sign ? '&' : '|',
		}
	case '<=>':
		var args = [
			lowerNot(a.args[0], sign),
			lowerNot(a.args[1], true),
		]
		return {
			args,
			op: '<=>',
		}
	case '<~>':
		return lowerNot({
			args: a.args,
			op: '<=>',
		}, !sign)
	case '=>':
		var args = [
			{
				args: [a.args[0]],
				op: '~',
			},
			a.args[1],
		]
		return lowerNot({
			args,
			op: '|',
		}, sign)
	case '?':
		var args = a.args.map(x => lowerNot(x, sign))
		return {
			args,
			op: sign ? '?' : '!',
			variables: a.variables,
		}
	case '|':
		var args = a.args.map(x => lowerNot(x, sign))
		return {
			args,
			op: sign ? '|' : '&',
		}
	case '~':
		return lowerNot(a.args[0], !sign)
	case '~&':
		return lowerNot({
			args: a.args,
			op: '&',
		}, !sign)
	case '~|':
		return lowerNot({
			args: a.args,
			op: '|',
		}, !sign)
	}
	if (sign)
		return a
	return {
		args: [a],
		op: '~',
	}
}

function map(a, f) {
	if (!a.args)
		return a
	a = clone(a, false, 1)
	a.args = a.args.map(f)
	return a
}

function quant(op, variables, arg) {
	var a = [arg]
	a.op = op
	a.variables = variables
	return a
}

function raiseAnd(a) {

	function rename(a) {
		if (!complex(a))
			return a
		var b = skolem(freeVariables(a))
		a = {
			args: [b, a],
			op: '=>',
		}
		convert1(a)
		return b
	}

	switch (a.op) {
	case '&':
		return map(a, raiseAnd)
	case '|':
		a = map(a, raiseAnd)
		if (iop.count(a.args, x => x.op === '&') === 1) {
			var cs = []
			var i = a.args.findIndex(x => x.op === '&')
			flatten('&', a[i], cs)
			cs = alternate(a.args, i, cs)
			return {
				args: cs,
				op: '&',
			}
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
	return a
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
	return a
}

exports.bool = bool
exports.convert = convert
exports.distinct_obj = distinct_obj
exports.evaluate = evaluate
exports.fun = fun
exports.integer = integer
exports.quant = quant
exports.rational = rational
exports.real = real
exports.term = term
exports.variable = variable
