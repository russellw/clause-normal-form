var assert = require('assert')
var index = require('./index')

describe('function', () => {
	it('name', () => {
		var a = index.fun('name')
		assert(a.name === 'name')
	})
	it('length', () => {
		var a = index.fun('name')
		assert(a.length === 0)
	})
})
describe('variable', () => {
	it('name', () => {
		var a = index.variable('name')
		assert(a.name === 'name')
	})
	it('length', () => {
		var a = index.variable('name')
		assert(a.length === 0)
	})
})
describe('term', () => {
	it('op', () => {
		var x = index.fun()
		var a = index.term('&', x)
		assert(a.op === '&')
	})
	it('length', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var a = index.term('&', x, y, z)
		assert(a.length === 3)
	})
	it('arg', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var a = index.term('&', x, y, z)
		assert(a[0] === x)
	})
	it('2nd arg', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var a = index.term('&', x, y, z)
		assert(a[1] === y)
	})
	it('3rd arg', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var a = index.term('&', x, y, z)
		assert(a[2] === z)
	})
	it('rest args', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var args = [x, y, z]
		var a = index.term('&', ...args)
		assert(a[2] === z)
	})
})
describe('quant', () => {
	it('op', () => {
		var vars = [
			index.variable(),
			index.variable(),
			index.variable(),
		]
		var arg = index.fun()
		var a = index.quant('!', vars, arg)
		assert(a.op === '!')
	})
	it('vars', () => {
		var vars = [
			index.variable(),
			index.variable(),
			index.variable(),
		]
		var arg = index.fun()
		var a = index.quant('!', vars, arg)
		assert.deepEqual(a.vars, vars)
	})
	it('length', () => {
		var vars = [
			index.variable(),
			index.variable(),
			index.variable(),
		]
		var arg = index.fun()
		var a = index.quant('!', vars, arg)
		assert(a.length === 1)
	})
	it('arg', () => {
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
describe('convert', () => {
	it('constant', () => {
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
