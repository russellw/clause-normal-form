var assert = require('assert')
var index = require('./index')

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
