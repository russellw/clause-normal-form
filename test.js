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
			assertEq(index.bool(true), index.bool(true))
		})
		it('true != false', function () {
			assertNeq(index.bool(true), index.bool(false))
		})
	})
	describe('distinct_obj', function () {
		it('"a" = "a"', function () {
			var a = index.distinct_obj('a')
			assertEq(a, a)
		})
		it('"a" != "b"', function () {
			var a = index.distinct_obj('a')
			var b = index.distinct_obj('b')
			assertNeq(a, b)
		})
	})
	describe('integer', function () {
		it('1 = 1', function () {
			assertEq(index.integer(1), index.integer(1))
		})
		it('1 != 2', function () {
			assertNeq(index.integer(1), index.integer(2))
		})
	})
	describe('rational', function () {
		it('1/2 = 1/2', function () {
			assertEq(index.rational('1/2'), index.rational('1/2'))
		})
		it('1/2 != 1/3', function () {
			assertNeq(index.rational('1/2'), index.rational('1/3'))
		})
	})
	describe('real', function () {
		it('1/2 = 1/2', function () {
			assertEq(index.real('1.23e456'), index.real('1.23e456'))
		})
		it('1/2 != 1/3', function () {
			assertNeq(index.real('1.0'), index.real('1.1'))
		})
	})
	describe('fun', function () {
		it('a = a', function () {
			var a = index.fun()
			assertEq(a, a)
		})
		it('a != b', function () {
			var a = index.fun()
			var b = index.fun()
			assertNeq(a, b)
		})
	})
	describe('term', function () {
		it('a&a = a&a', function () {
			var a = index.fun()
			assertEq(index.term('&', a, a), index.term('&', a, a))
		})
		it('a&a != a&b', function () {
			var a = index.fun()
			var b = index.fun()
			assertNeq(index.term('&', a, a), index.term('&', a, b))
		})
	})
	describe('quant', function () {
		it('![X]:a = ![X]:a', function () {
			var a = index.fun()
			var x = index.variable()
			assertEq(index.quant('!', [x], a), index.quant('!', [x], a))
		})
		it('![X]:a != ![Y]:a', function () {
			var a = index.fun()
			var x = index.variable()
			var y = index.variable()
			assertNeq(index.quant('!', [x], a), index.quant('!', [y], a))
		})
	})
	describe('call', function () {
		it('f(1) = f(1)', function () {
			var f = index.fun()
			assert(index.eq(index.call(f, [index.integer(1)]), index.call(f, [index.integer(1)])))
		})
		it('f(1) != g(1)', function () {
			var f = index.fun()
			var g = index.fun()
			assert(!index.eq(index.call(f, [index.integer(1)]), index.call(g, [index.integer(1)])))
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
				assertEq(index.evaluate(index.term('&')), index.bool(true))
			})
		})
		describe('unary', function () {
			it('(&)false = false', function () {
				assertEq(index.evaluate(index.term('&', index.bool(false))), index.bool(false))
			})
			it('(&)true = true', function () {
				assertEq(index.evaluate(index.term('&', index.bool(true))), index.bool(true))
			})
			it('(&)a = a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('&', a)), a)
			})
		})
		describe('binary', function () {
			it('false&false = false', function () {
				assertEq(index.evaluate(index.term('&', index.bool(false), index.bool(false))), index.bool(false))
			})
			it('false&true = false', function () {
				assertEq(index.evaluate(index.term('&', index.bool(false), index.bool(true))), index.bool(false))
			})
			it('true&false = false', function () {
				assertEq(index.evaluate(index.term('&', index.bool(true), index.bool(false))), index.bool(false))
			})
			it('true&true = true', function () {
				assertEq(index.evaluate(index.term('&', index.bool(true), index.bool(true))), index.bool(true))
			})
			it('a&false = false', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('&', a, index.bool(false))), index.bool(false))
			})
			it('a&true = a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('&', a, index.bool(true))), a)
			})
		})
	})
	describe('|', function () {
		describe('0-ary', function () {
			it('(|) = false', function () {
				assertEq(index.evaluate(index.term('|')), index.bool(false))
			})
		})
		describe('unary', function () {
			it('(|)false = false', function () {
				assertEq(index.evaluate(index.term('|', index.bool(false))), index.bool(false))
			})
			it('(|)true = true', function () {
				assertEq(index.evaluate(index.term('|', index.bool(true))), index.bool(true))
			})
			it('(|)a = a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('|', a)), a)
			})
		})
		describe('binary', function () {
			it('false|false = false', function () {
				assertEq(index.evaluate(index.term('|', index.bool(false), index.bool(false))), index.bool(false))
			})
			it('false|true = true', function () {
				assertEq(index.evaluate(index.term('|', index.bool(false), index.bool(true))), index.bool(true))
			})
			it('true|false = true', function () {
				assertEq(index.evaluate(index.term('|', index.bool(true), index.bool(false))), index.bool(true))
			})
			it('true|true = true', function () {
				assertEq(index.evaluate(index.term('|', index.bool(true), index.bool(true))), index.bool(true))
			})
			it('a|false = a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('|', a, index.bool(false))), a)
			})
			it('a|true = true', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('|', a, index.bool(true))), index.bool(true))
			})
		})
	})
	describe('~', function () {
		it('~false = true', function () {
			assertEq(index.evaluate(index.term('~', index.bool(false))), index.bool(true))
		})
		it('~true = false', function () {
			assertEq(index.evaluate(index.term('~', index.bool(true))), index.bool(false))
		})
		it('~a = ~a', function () {
			var a = index.fun()
			assertEq(index.evaluate(index.term('~', a)), index.term('~', a))
		})
		it('~~a = a', function () {
			var a = index.fun()
			assertEq(index.evaluate(index.term('~', index.term('~', a))), a)
		})
	})
	describe('=', function () {
		describe('constant', function () {
			it('1 = 1', function () {
				assertEq(index.evaluate(index.term('=', index.integer(1), index.integer(1))), index.bool(true))
			})
			it('1 != 2', function () {
				assertEq(index.evaluate(index.term('=', index.integer(1), index.integer(2))), index.bool(false))
			})
		})
		describe('variable', function () {
			it('a = a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('=', a, a)), index.bool(true))
			})
			it('a ?= b', function () {
				var a = index.fun()
				var b = index.fun()
				assertEq(index.evaluate(index.term('=', a, b)), index.term('=', a, b))
			})
		})
	})
	describe('!=', function () {
		describe('constant', function () {
			it('1 = 1', function () {
				assertEq(index.evaluate(index.term('!=', index.integer(1), index.integer(1))), index.bool(false))
			})
			it('1 != 2', function () {
				assertEq(index.evaluate(index.term('!=', index.integer(1), index.integer(2))), index.bool(true))
			})
		})
		describe('variable', function () {
			it('a = a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('!=', a, a)), index.bool(false))
			})
			it('a ?= b', function () {
				var a = index.fun()
				var b = index.fun()
				assertEq(index.evaluate(index.term('!=', a, b)), index.term('!=', a, b))
			})
		})
	})
	describe('<', function () {
		describe('constant', function () {
			it('1 < 2', function () {
				assertEq(index.evaluate(index.term('<', index.integer(1), index.integer(2))), index.bool(true))
			})
			it('2 !< 1', function () {
				assertEq(index.evaluate(index.term('<', index.integer(2), index.integer(1))), index.bool(false))
			})
		})
		describe('variable', function () {
			it('a !< a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('<', a, a)), index.bool(false))
			})
			it('a ?< b', function () {
				var a = index.fun()
				var b = index.fun()
				assertEq(index.evaluate(index.term('<', a, b)), index.term('<', a, b))
			})
		})
	})
	describe('<=', function () {
		describe('constant', function () {
			it('1 <= 1', function () {
				assertEq(index.evaluate(index.term('<=', index.integer(1), index.integer(1))), index.bool(true))
			})
			it('2 !<= 1', function () {
				assertEq(index.evaluate(index.term('<=', index.integer(2), index.integer(1))), index.bool(false))
			})
		})
		describe('variable', function () {
			it('a <= a', function () {
				var a = index.fun()
				assertEq(index.evaluate(index.term('<=', a, a)), index.bool(true))
			})
			it('a ?<= b', function () {
				var a = index.fun()
				var b = index.fun()
				assertEq(index.evaluate(index.term('<=', a, b)), index.term('<=', a, b))
			})
		})
	})
	describe('recursive', function () {
		it('true&(true&false) = false', function () {
			var b = index.term('&', index.bool(true), index.bool(false))
			assertEq(index.evaluate(index.term('&', index.bool(true), b)), index.bool(false))
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
	it('unify(f(1), f(1))', function () {
		var f = index.fun()
		assert(index.unify(index.call(f, [index.integer(1)]), index.call(f, [index.integer(1)])))
	})
	it('!unify(f(1), g(1))', function () {
		var f = index.fun()
		var g = index.fun()
		assert(!index.unify(index.call(f, [index.integer(1)]), index.call(g, [index.integer(1)])))
	})
})
describe('isomorphic', function () {
	it('isomorphic(a, a)', function () {
		var a = index.fun()
		assert(index.isomorphic(a, a))
	})
	it('isomorphic(a, b)', function () {
		var a = index.fun()
		var b = index.fun()
		assert(index.isomorphic(a, b))
	})
	it("isomorphic('a', 'a')", function () {
		assert(index.isomorphic(index.fun('a'), index.fun('a')))
	})
	it("!isomorphic('a', 'b')", function () {
		assert(!index.isomorphic(index.fun('a'), index.fun('b')))
	})
})
describe('convert', function () {
	it('a -> a', function () {
		var a = index.fun()
		var clauses = index.term('&')
		clauses.push(index.term('|', a))
		assertEq(index.convert(a), clauses)
	})
	it('~~a -> a', function () {
		var a = index.fun()
		var clauses = index.term('&')
		clauses.push(index.term('|', a))
		assertEq(index.convert(index.term('~', index.term('~', a))), clauses)
	})
	it('a=b -> a=b', function () {
		var a = index.fun()
		var b = index.fun()
		var clauses = index.term('&')
		clauses.push(index.term('|', index.term('=', a, b)))
		assertEq(index.convert(index.term('=', a, b)), clauses)
	})
	it('f(X) -> f(Y)', function () {
		var f = index.fun()
		var x = index.variable()
		var a = index.call(f, [x])
		var clauses = index.convert(a)
		var b = clauses[0][0]
		var m = index.unify(a, b)
		var y = m.get(x)
		assert(y.op === 'variable')
	})
	it('![X]: ?[Y]: p(X, Y) -> p(Z, s(Z))', function () {
		var p = index.fun()
		var x = index.variable()
		var y = index.variable()
		var a = index.quant('!', [x], index.quant('?', [y], index.call(p, [x, y])))
		var s = index.fun()
		var z = index.variable()
		var b = index.call(p, [
			z,
			index.call(s, [z]),
		])
		var clauses = index.term('&')
		clauses.push(index.term('|', b))
		assert(index.isomorphic(index.convert(a), clauses))
	})
	it('a, b -> a, b', function () {
		var a = index.fun()
		var b = index.fun()
		var clauses = index.term('&')
		clauses.push(index.term('|', a))
		clauses.push(index.term('|', b))
		assert(index.isomorphic(index.convert(index.term('&', a, b)), clauses))
	})
	it('a(1), b(2) -> a(1), b(2)', function () {
		var a = index.call(index.fun(), [index.integer('1')])
		var b = index.call(index.fun(), [index.integer('2')])
		var clauses = index.term('&')
		clauses.push(index.term('|', a))
		clauses.push(index.term('|', b))
		assert(index.isomorphic(index.convert(index.term('&', a, b)), clauses))
	})
})
describe('isFalse', function () {
	it('isFalse(false)', function () {
		assert(index.isFalse(index.bool(false)))
	})
	it('!isFalse(true)', function () {
		assert(!index.isFalse(index.bool(true)))
	})
	it('!isFalse(~false)', function () {
		assert(!index.isFalse(index.term('~', index.bool(false))))
	})
	it('isFalse(~true)', function () {
		assert(index.isFalse(index.term('~', index.bool(true))))
	})
	it('isFalse(false & false)', function () {
		assert(index.isFalse(index.term('&', index.bool(false), index.bool(false))))
	})
	it('isFalse(false & true)', function () {
		assert(index.isFalse(index.term('&', index.bool(false), index.bool(true))))
	})
	it('isFalse(true & false)', function () {
		assert(index.isFalse(index.term('&', index.bool(true), index.bool(false))))
	})
	it('!isFalse(true & true)', function () {
		assert(!index.isFalse(index.term('&', index.bool(true), index.bool(true))))
	})
	it('isFalse(false | false)', function () {
		assert(index.isFalse(index.term('|', index.bool(false), index.bool(false))))
	})
	it('!isFalse(false | true)', function () {
		assert(!index.isFalse(index.term('|', index.bool(false), index.bool(true))))
	})
	it('!isFalse(true | false)', function () {
		assert(!index.isFalse(index.term('|', index.bool(true), index.bool(false))))
	})
	it('!isFalse(true | true)', function () {
		assert(!index.isFalse(index.term('|', index.bool(true), index.bool(true))))
	})
	it('!isFalse(a)', function () {
		assert(!index.isFalse(index.fun()))
	})
})
describe('isTrue', function () {
	it('!isTrue(false)', function () {
		assert(!index.isTrue(index.bool(false)))
	})
	it('isTrue(true)', function () {
		assert(index.isTrue(index.bool(true)))
	})
	it('isTrue(~false)', function () {
		assert(index.isTrue(index.term('~', index.bool(false))))
	})
	it('!isTrue(~true)', function () {
		assert(!index.isTrue(index.term('~', index.bool(true))))
	})
	it('!isTrue(false & false)', function () {
		assert(!index.isTrue(index.term('&', index.bool(false), index.bool(false))))
	})
	it('!isTrue(false & true)', function () {
		assert(!index.isTrue(index.term('&', index.bool(false), index.bool(true))))
	})
	it('!isTrue(true & false)', function () {
		assert(!index.isTrue(index.term('&', index.bool(true), index.bool(false))))
	})
	it('isTrue(true & true)', function () {
		assert(index.isTrue(index.term('&', index.bool(true), index.bool(true))))
	})
	it('!isTrue(false | false)', function () {
		assert(!index.isTrue(index.term('|', index.bool(false), index.bool(false))))
	})
	it('isTrue(false | true)', function () {
		assert(index.isTrue(index.term('|', index.bool(false), index.bool(true))))
	})
	it('isTrue(true | false)', function () {
		assert(index.isTrue(index.term('|', index.bool(true), index.bool(false))))
	})
	it('isTrue(true | true)', function () {
		assert(index.isTrue(index.term('|', index.bool(true), index.bool(true))))
	})
	it('!isTrue(a)', function () {
		assert(!index.isTrue(index.fun()))
	})
})
