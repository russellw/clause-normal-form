'use strict'
var iop = require('iop')

function convert(a) {
	a = lowerNot(a, true)
	a = eliminateQuantifiers(a)
	a = eliminateEqv(a)
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
				var skolem = {
					args: vals(bound).filter(a => a.op === 'var'),
					fun: {
						op: 'fun',
					},
					op: 'call',
				}
				bound = iop.put(bound, x, skolem)
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
	var args = a.args.map(x => eliminateQuantifiers(x, bound))
	return {
		args,
		op: a.op,
	}
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

function vals(m) {
	for (var r = []; m; m = m.outer)
		r.push(m.val)
	return r
}

exports.convert = convert
