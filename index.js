'use strict'

function convert(a) {
}

function lowerNot(sign, a) {
	switch (a.op) {
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

exports.convert = convert
