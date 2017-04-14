'use strict'
var clone = require('clone')
var iop = require('iop')

var clauses

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
	clauses = []
	convert1(a)
	return clauses
}

function convert1(a) {
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

function eliminateEqv(a) {
	a = map(a, eliminateEqv)
	if (a.op !== '<=>')
		return a

	function rename(a) {
		if (!complex(a))
			return a
		var b = skolem(freeVars(a))
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
		var vars = a.vars.map(
			x =>  {
				var y = {
					op: 'var',
				}
				bound = iop.put(bound, x, y)
				return y
			})
		var args = a.args.map(x => eliminateQuantifiers(x, bound))
		return {
			args,
			op: a.op,
			vars,
		}
	case '?':
		var vars = a.vars.map(
			x =>  {
				var y = skolem(vals(bound).filter(a => a.op === 'var'))
				bound = iop.put(bound, x, y)
				return y
			})
		var args = a.args.map(x => eliminateQuantifiers(x, bound))
		return {
			args,
			op: a.op,
			vars,
		}
	case 'var':
		var val = iop.get(bound, a)
		if (val)
			return val
		return a
	}
	return map(a, x => eliminateQuantifiers(x, bound))
}

function flatten(op, a, cs) {
	if (a.op === op)
		for (var x of a.args) {
			flatten(op, x, cs)
			return
		}
	cs.push(a)
}

function freeVars(a) {
	var r = new Set()

	function rec(a, bound) {
		switch (a.op) {
		case '!':
		case '?':
			for (var x of a.vars)
				bound = iop.put(bound, x, x)
			break
		case 'var':
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

function lowerNot(a, sign) {
	switch (a.op) {
	case '!':
		var args = a.args.map(x => lowerNot(x, sign))
		return {
			args,
			op: sign ? '!' : '?',
			vars: a.vars,
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
			vars: a.vars,
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

function raiseAnd(a) {

	function rename(a) {
		if (!complex(a))
			return a
		var b = skolem(freeVars(a))
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
		return map(a, x => x.op === '&' ? rename(x) : x)
	}
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

function vals(m) {
	for (var r = []; m; m = m.outer)
		r.push(m.val)
	return r
}

exports.convert = convert
