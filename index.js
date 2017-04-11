'use strict'
var iop = require('iop')

function convert(a) {
	a = lowerNot(true, a)
	a = eliminateQuantifiers(a)
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

function lowerNot(sign, a) {
	switch (a.op) {
	case '!':
		var args = a.args.map(x => lowerNot(sign, x))
		return {
			args,
			op: sign ? '!' : '?',
			vars: a.vars,
		}
	case '!=':
		return lowerNot(!sign, {
			args: a.args,
			op: '=',
		})
	case '&':
		var args = a.args.map(x => lowerNot(sign, x))
		return {
			args,
			op: sign ? '&' : '|',
		}
	case '<=>':
		var args = [
			lowerNot(sign, a.args[0]),
			lowerNot(true, a.args[1]),
		]
		return {
			args,
			op: '<=>',
		}
	case '<~>':
		return lowerNot(!sign, {
			args: a.args,
			op: '<=>',
		})
	case '=>':
		var args = [
			{
				args: [a.args[0]],
				op: '~',
			},
			a.args[1],
		]
		return lowerNot(sign, {
			args,
			op: '|',
		})
	case '?':
		var args = a.args.map(x => lowerNot(sign, x))
		return {
			args,
			op: sign ? '?' : '!',
			vars: a.vars,
		}
	case '|':
		var args = a.args.map(x => lowerNot(sign, x))
		return {
			args,
			op: sign ? '|' : '&',
		}
	case '~':
		return lowerNot(!sign, a.args[0])
	case '~&':
		return lowerNot(!sign, {
			args: a.args,
			op: '&',
		})
	case '~|':
		return lowerNot(!sign, {
			args: a.args,
			op: '|',
		})
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
