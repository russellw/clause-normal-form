var assert = require('assert')
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
describe('fun', function () {
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
	it('arg', function () {
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
		var vars = [
			index.variable(),
			index.variable(),
			index.variable(),
		]
		var arg = index.fun()
		var a = index.quant('!', vars, arg)
		assert(a.op === '!')
	})
	it('vars', function () {
		var vars = [
			index.variable(),
			index.variable(),
			index.variable(),
		]
		var arg = index.fun()
		var a = index.quant('!', vars, arg)
		assert.deepEqual(a.vars, vars)
	})
	it('length', function () {
		var vars = [
			index.variable(),
			index.variable(),
			index.variable(),
		]
		var arg = index.fun()
		var a = index.quant('!', vars, arg)
		assert(a.length === 1)
	})
	it('arg', function () {
		var vars = [
			index.variable(),
			index.variable(),
			index.variable(),
		]
		var arg = index.fun()
		var a = index.quant('!', vars, arg)
		assert(a[0] === arg)
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
