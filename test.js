var assert = require('assert')
var bigInt = require('big-integer')
var bigRat = require('big-rational')
var index = require('./index')

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
describe('evaluate', function () {
	it('constant', function () {
		var a = index.fun()
		assert(index.evaluate(a) === a)
	})
	it('get', function () {
		var a = index.fun()
		var b = index.fun()
		var m = new Map()
		m.set(a, b)
		assert(index.evaluate(a, m) === b)
	})
	it('get not found', function () {
		var a = index.fun()
		var b = index.fun()
		var m = new Map()
		m.set(b, b)
		assert(index.evaluate(a, m) === a)
	})
})
describe('convert', function () {
	it('constant', function () {
		var a = {
			args: [],
			op: 'fun',
		}
		var c = {
			args: [a],
			op: '|',
		}
		var cs = [c]
		assert.deepEqual(index.convert(a), cs)
	})
})
