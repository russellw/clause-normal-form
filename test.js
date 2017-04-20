var assert = require('assert')
var bigInt = require('big-integer')
var bigRat = require('big-rational')
var index = require('./index')

function assertEq(a, b) {
	assert(index.eq(a, b))
}

function assertNeq(a, b) {
	assert(!index.eq(a, b))
}

describe('atoms', function () {
	describe('bool', function () {
		it('op', function () {
			var a = index.bool(false)
			assert(a.op === 'bool')
		})
		it('false', function () {
			var a = index.bool(false)
			assert(a.val === false)
		})
		it('true', function () {
			var a = index.bool(true)
			assert(a.val === true)
		})
		it('length', function () {
			var a = index.bool(false)
			assert(a.length === 0)
		})
	})
	describe('distinct_obj', function () {
		it('op', function () {
			var a = index.distinct_obj('name')
			assert(a.op === 'distinct_obj')
		})
		it('name', function () {
			var a = index.distinct_obj('name')
			assert(a.name === 'name')
		})
		it('length', function () {
			var a = index.distinct_obj('name')
			assert(a.length === 0)
		})
	})
	describe('integer', function () {
		it('op', function () {
			var a = index.integer('123')
			assert(a.op === 'integer')
		})
		it('number val', function () {
			var a = index.integer(123)
			assert(a.val.eq(bigInt('123')))
		})
		it('string val', function () {
			var a = index.integer('123')
			assert(a.val.eq(bigInt(123)))
		})
		it('length', function () {
			var a = index.integer('123')
			assert(a.length === 0)
		})
	})
	describe('rational', function () {
		it('op', function () {
			var a = index.rational('1/2')
			assert(a.op === 'rational')
		})
		it('number val', function () {
			var a = index.rational(0.5)
			assert(a.val.eq(bigRat('1/2')))
		})
		it('string val', function () {
			var a = index.rational('1/2')
			assert(a.val.eq(bigRat(0.5)))
		})
		it('length', function () {
			var a = index.rational('1/2')
			assert(a.length === 0)
		})
	})
	describe('real', function () {
		it('op', function () {
			var a = index.real('0.5')
			assert(a.op === 'real')
		})
		it('number val', function () {
			var a = index.real(0.5)
			assert(a.val.eq(bigRat('0.5')))
		})
		it('string val', function () {
			var a = index.real('0.5')
			assert(a.val.eq(bigRat(0.5)))
		})
		it('length', function () {
			var a = index.real('0.5')
			assert(a.length === 0)
		})
	})
	describe('fun', function () {
		it('op', function () {
			var a = index.fun('name')
			assert(a.op === 'fun')
		})
		it('name', function () {
			var a = index.fun('name')
			assert(a.name === 'name')
		})
		it('length', function () {
			var a = index.fun('name')
			assert(a.length === 0)
		})
	})
	describe('variable', function () {
		it('op', function () {
			var a = index.variable('name')
			assert(a.op === 'variable')
		})
		it('name', function () {
			var a = index.variable('name')
			assert(a.name === 'name')
		})
		it('length', function () {
			var a = index.variable('name')
			assert(a.length === 0)
		})
	})
})
describe('terms', function () {
	describe('term', function () {
		it('op', function () {
			var x = index.fun()
			var a = index.term('&', x)
			assert(a.op === '&')
		})
		it('length', function () {
			var x = index.fun()
			var y = index.fun()
			var z = index.fun()
			var a = index.term('&', x, y, z)
			assert(a.length === 3)
		})
		it('1st arg', function () {
			var x = index.fun()
			var y = index.fun()
			var z = index.fun()
			var a = index.term('&', x, y, z)
			assert(a[0] === x)
		})
		it('2nd arg', function () {
			var x = index.fun()
			var y = index.fun()
			var z = index.fun()
			var a = index.term('&', x, y, z)
			assert(a[1] === y)
		})
		it('3rd arg', function () {
			var x = index.fun()
			var y = index.fun()
			var z = index.fun()
			var a = index.term('&', x, y, z)
			assert(a[2] === z)
		})
		it('rest args', function () {
			var x = index.fun()
			var y = index.fun()
			var z = index.fun()
			var args = [x, y, z]
			var a = index.term('&', ...args)
			assert(a[2] === z)
		})
	})
	describe('quant', function () {
		it('op', function () {
			var variables = [
				index.variable(),
				index.variable(),
				index.variable(),
			]
			var arg = index.fun()
			var a = index.quant('!', variables, arg)
			assert(a.op === '!')
		})
		it('variables', function () {
			var variables = [
				index.variable(),
				index.variable(),
				index.variable(),
			]
			var arg = index.fun()
			var a = index.quant('!', variables, arg)
			assert.deepEqual(a.variables, variables)
		})
		it('length', function () {
			var variables = [
				index.variable(),
				index.variable(),
				index.variable(),
			]
			var arg = index.fun()
			var a = index.quant('!', variables, arg)
			assert(a.length === 1)
		})
		it('arg', function () {
			var variables = [
				index.variable(),
				index.variable(),
				index.variable(),
			]
			var arg = index.fun()
			var a = index.quant('!', variables, arg)
			assert(a[0] === arg)
		})
	})
})
describe('eq', function () {
	describe('bool', function () {
		it('true = true', function () {
			assert(index.eq(index.bool(true), index.bool(true)))
		})
		it('true != false', function () {
			assert(!index.eq(index.bool(true), index.bool(false)))
		})
	})
	describe('distinct_obj', function () {
		it('"a" = "a"', function () {
			assert(index.eq(index.distinct_obj('a'), index.distinct_obj('a')))
		})
		it('"a" != "b"', function () {
			assert(!index.eq(index.distinct_obj('a'), index.distinct_obj('b')))
		})
	})
	describe('integer', function () {
		it('1 = 1', function () {
			assert(index.eq(index.integer(1), index.integer(1)))
		})
		it('1 != 2', function () {
			assert(!index.eq(index.integer(1), index.integer(2)))
		})
	})
	describe('rational', function () {
		it('1/2 = 1/2', function () {
			assert(index.eq(index.rational('1/2'), index.rational('1/2')))
		})
		it('1/2 != 1/3', function () {
			assert(!index.eq(index.rational('1/2'), index.rational('1/3')))
		})
	})
	describe('fun', function () {
		it('a = a', function () {
			var a = index.fun()
			assert(index.eq(a, a))
		})
		it('a != b', function () {
			var a = index.fun()
			var b = index.fun()
			assert(!index.eq(a, b))
		})
	})
	describe('term', function () {
		it('a&a = a&a', function () {
			var a = index.fun()
			assert(index.eq(index.term('&', a, a), index.term('&', a, a)))
		})
		it('a&a != a&b', function () {
			var a = index.fun()
			var b = index.fun()
			assert(!index.eq(index.term('&', a, a), index.term('&', a, b)))
		})
	})
	describe('quant', function () {
		it('![X]:a = ![X]:a', function () {
			var a = index.fun()
			var x = index.variable()
			assert(index.eq(index.quant('!', [x], a), index.quant('!', [x], a)))
		})
		it('![X]:a != ![Y]:a', function () {
			var a = index.fun()
			var x = index.variable()
			var y = index.variable()
			assert(!index.eq(index.quant('!', [x], a), index.quant('!', [y], a)))
		})
	})
})
describe('evaluate', function () {
	describe('atom', function () {
		it('a = a', function () {
			var a = index.fun()
			assert(index.evaluate(a) === a)
		})
	})
	describe('lookup', function () {
		it('a/a:b = b', function () {
			var a = index.fun()
			var b = index.fun()
			var m = new Map()
			m.set(a, b)
			assert(index.evaluate(a, m) === b)
		})
		it('a/b:b = a', function () {
			var a = index.fun()
			var b = index.fun()
			var m = new Map()
			m.set(b, b)
			assert(index.evaluate(a, m) === a)
		})
	})
	describe('&', function () {
		describe('0-ary', function () {
			it('(&) = true', function () {
				assert(index.eq(index.evaluate(index.term('&')), index.bool(true)))
			})
		})
		describe('unary', function () {
			it('(&)false = false', function () {
				assert(index.eq(index.evaluate(index.term('&', index.bool(false))), index.bool(false)))
			})
			it('(&)true = true', function () {
				assert(index.eq(index.evaluate(index.term('&', index.bool(true))), index.bool(true)))
			})
			it('(&)a = a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('&', a)), a))
			})
		})
		describe('binary', function () {
			it('false&false = false', function () {
				assert(index.eq(index.evaluate(index.term('&', index.bool(false), index.bool(false))), index.bool(false)))
			})
			it('false&true = false', function () {
				assert(index.eq(index.evaluate(index.term('&', index.bool(false), index.bool(true))), index.bool(false)))
			})
			it('true&false = false', function () {
				assert(index.eq(index.evaluate(index.term('&', index.bool(true), index.bool(false))), index.bool(false)))
			})
			it('true&true = true', function () {
				assert(index.eq(index.evaluate(index.term('&', index.bool(true), index.bool(true))), index.bool(true)))
			})
			it('a&false = false', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('&', a, index.bool(false))), index.bool(false)))
			})
			it('a&true = a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('&', a, index.bool(true))), a))
			})
		})
	})
	describe('|', function () {
		describe('0-ary', function () {
			it('(|) = false', function () {
				assert(index.eq(index.evaluate(index.term('|')), index.bool(false)))
			})
		})
		describe('unary', function () {
			it('(|)false = false', function () {
				assert(index.eq(index.evaluate(index.term('|', index.bool(false))), index.bool(false)))
			})
			it('(|)true = true', function () {
				assert(index.eq(index.evaluate(index.term('|', index.bool(true))), index.bool(true)))
			})
			it('(|)a = a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('|', a)), a))
			})
		})
		describe('binary', function () {
			it('false|false = false', function () {
				assert(index.eq(index.evaluate(index.term('|', index.bool(false), index.bool(false))), index.bool(false)))
			})
			it('false|true = true', function () {
				assert(index.eq(index.evaluate(index.term('|', index.bool(false), index.bool(true))), index.bool(true)))
			})
			it('true|false = true', function () {
				assert(index.eq(index.evaluate(index.term('|', index.bool(true), index.bool(false))), index.bool(true)))
			})
			it('true|true = true', function () {
				assert(index.eq(index.evaluate(index.term('|', index.bool(true), index.bool(true))), index.bool(true)))
			})
			it('a|false = a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('|', a, index.bool(false))), a))
			})
			it('a|true = true', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('|', a, index.bool(true))), index.bool(true)))
			})
		})
	})
	describe('~', function () {
		it('~false = true', function () {
			assert(index.eq(index.evaluate(index.term('~', index.bool(false))), index.bool(true)))
		})
		it('~true = false', function () {
			assert(index.eq(index.evaluate(index.term('~', index.bool(true))), index.bool(false)))
		})
		it('~a = ~a', function () {
			var a = index.fun()
			assert(index.eq(index.evaluate(index.term('~', a)), index.term('~', a)))
		})
	})
	describe('=', function () {
		describe('constant', function () {
			it('1 = 1', function () {
				assert(index.eq(index.evaluate(index.term('=', index.integer(1), index.integer(1))), index.bool(true)))
			})
			it('1 != 2', function () {
				assert(index.eq(index.evaluate(index.term('=', index.integer(1), index.integer(2))), index.bool(false)))
			})
		})
		describe('variable', function () {
			it('a = a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('=', a, a)), index.bool(true)))
			})
			it('a ?= b', function () {
				var a = index.fun()
				var b = index.fun()
				assert(index.eq(index.evaluate(index.term('=', a, b)), index.term('=', a, b)))
			})
		})
	})
	describe('!=', function () {
		describe('constant', function () {
			it('1 = 1', function () {
				assert(index.eq(index.evaluate(index.term('!=', index.integer(1), index.integer(1))), index.bool(false)))
			})
			it('1 != 2', function () {
				assert(index.eq(index.evaluate(index.term('!=', index.integer(1), index.integer(2))), index.bool(true)))
			})
		})
		describe('variable', function () {
			it('a = a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('!=', a, a)), index.bool(false)))
			})
			it('a ?= b', function () {
				var a = index.fun()
				var b = index.fun()
				assert(index.eq(index.evaluate(index.term('!=', a, b)), index.term('!=', a, b)))
			})
		})
	})
	describe('<', function () {
		describe('constant', function () {
			it('1 < 2', function () {
				assert(index.eq(index.evaluate(index.term('<', index.integer(1), index.integer(2))), index.bool(true)))
			})
			it('2 !< 1', function () {
				assert(index.eq(index.evaluate(index.term('<', index.integer(2), index.integer(1))), index.bool(false)))
			})
		})
		describe('variable', function () {
			it('a !< a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('<', a, a)), index.bool(false)))
			})
			it('a ?< b', function () {
				var a = index.fun()
				var b = index.fun()
				assert(index.eq(index.evaluate(index.term('<', a, b)), index.term('<', a, b)))
			})
		})
	})
	describe('<=', function () {
		describe('constant', function () {
			it('1 <= 1', function () {
				assert(index.eq(index.evaluate(index.term('<=', index.integer(1), index.integer(1))), index.bool(true)))
			})
			it('2 !<= 1', function () {
				assert(index.eq(index.evaluate(index.term('<=', index.integer(2), index.integer(1))), index.bool(false)))
			})
		})
		describe('variable', function () {
			it('a <= a', function () {
				var a = index.fun()
				assert(index.eq(index.evaluate(index.term('<=', a, a)), index.bool(true)))
			})
			it('a ?<= b', function () {
				var a = index.fun()
				var b = index.fun()
				assert(index.eq(index.evaluate(index.term('<=', a, b)), index.term('<=', a, b)))
			})
		})
	})
	describe('recursive', function () {
		it('true&(true&false) = false', function () {
			var b = index.term('&', index.bool(true), index.bool(false))
			assert(index.eq(index.evaluate(index.term('&', index.bool(true), b)), index.bool(false)))
		})
	})
})
describe('occurs', function () {
	it('a in a', function () {
		var a = index.fun()
		assert(index.occurs(a, a))
	})
	it('a !in b', function () {
		var a = index.fun()
		var b = index.fun()
		assert(!index.occurs(a, b))
	})
	it('a !in b/b:a', function () {
		var a = index.fun()
		var b = index.fun()
		var m = new Map()
		m.set(b, a)
		assert(index.occurs(a, b, m))
	})
	it('a in a&b', function () {
		var a = index.fun()
		var b = index.fun()
		assert(index.occurs(a, index.term('&', a, b)))
	})
})
describe('unify', function () {
	it('unify(a, a)', function () {
		var a = index.fun()
		assert(index.unify(a, a))
	})
	it('!unify(a, b)', function () {
		var a = index.fun()
		var b = index.fun()
		assert(!index.unify(a, b))
	})
	it('unify(1, 1)', function () {
		assert(index.unify(index.integer(1), index.integer(1)))
	})
	it('!unify(1, 2)', function () {
		assert(!index.unify(index.integer(1), index.integer(2)))
	})
	it('unify(a, X) = X:a', function () {
		var a = index.fun()
		var x = index.variable()
		var m = index.unify(a, x)
		assert(m.get(x) === a)
	})
	it('unify(X, a) = X:a', function () {
		var a = index.fun()
		var x = index.variable()
		var m = index.unify(x, a)
		assert(m.get(x) === a)
	})
	it('unify(a&b, a&b)', function () {
		var a = index.fun()
		var b = index.fun()
		assert(index.unify(index.term('&', a, b), index.term('&', a, b)))
	})
	it('!unify(X, ~X)', function () {
		var x = index.variable()
		assert(!index.unify(x, index.term('~', x)))
	})
})
describe('convert', function () {
	it('a -> [a]', function () {
		var a = index.fun()
		var clauses = index.term('&')
		clauses.push(index.term('|', a))
		assert(index.eq(index.convert(a), clauses))
	})
	it('a=b -> [a=b]', function () {
		var a = index.fun()
		var b = index.fun()
		var clauses = index.term('&')
		clauses.push(index.term('|', index.term('=', a, b)))
		assert(index.eq(index.convert(a), clauses))
	})
})
