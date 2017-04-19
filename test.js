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
		var a = index.term('~', x)
		assert(a.length === 1)
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
