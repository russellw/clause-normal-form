'use strict'

function convert(a) {
}

function lowerNot(sign, a) {
	switch (a.op) {
	case '!':
		return lowerNot(!sign, a.args[0])
	case '&&':
		var args = a.args.map(
			function (x) {
				return lowerNot(sign, x)
			})
		return {
			args,
			op: sign ? '&&' : '||',
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
	case '||':
		var args = a.args.map(
			function (x) {
				return lowerNot(sign, x)
			})
		return {
			args,
			op: sign ? '||' : '&&',
		}
	}
	if (sign)
		return a
	return {
		args: [a],
		op: '!',
	}
}

exports.convert = convert
