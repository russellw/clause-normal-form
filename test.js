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
	it('second arg', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var a = index.term('&', x, y, z)
		assert(a[1] === y)
	})
	it('third arg', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var a = index.term('&', x, y, z)
		assert(a[2] === z)
	})
	it('args', () => {
		var x = index.fun()
		var y = index.fun()
		var z = index.fun()
		var args = [x, y, z]
		var a = index.term('&', ...args)
		assert(a[2] === z)
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
