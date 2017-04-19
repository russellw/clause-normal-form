var assert = require('assert')
var index = require('./index')

describe('make',
	function () {
		it('function', () => {
			var f = index.fun('name')
			assert(f.name === 'name')
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
