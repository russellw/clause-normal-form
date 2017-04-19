var assert = require('assert')
var index = require('./index')

describe('function',
	function () {
		it('name', () => {
			var f = index.fun('name')
			assert(f.name === 'name')
		})
		it('length', () => {
			var f = index.fun('name')
			assert(f.length === 0)
		})
	})
describe('variable',
	function () {
		it('name', () => {
			var f = index.variable('name')
			assert(f.name === 'name')
		})
		it('length', () => {
			var f = index.variable('name')
			assert(f.length === 0)
		})
	})
describe('convert',
	function () {
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
