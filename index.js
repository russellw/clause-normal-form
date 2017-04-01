'use strict';

function lowerNot(sign, a) {
	switch (a.op) {
	case '&&':
		var args = a.args.map(function (x) {
			return lowerNot(sign, x);
		});
		return {
			args: args,
			op: (sign ? '&&' : '||'),
		};
	}
}

// API

function convert(a) {
}

exports.convert = convert;
