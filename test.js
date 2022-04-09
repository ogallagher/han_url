/**
 * @fileoverview Mocha unit tests for han_url.
 */

const assert = require('assert')

const hanurl = require('./han_url.js')
const pkg = require('./package.json')

describe(`${pkg.name} unit tests`, function() {
	const data_size = 5
	
	describe('load_data', function() {
		it('loads all and any files from data dir', function() {
			// load all
			return hanurl.load_data()
			.then(() => {
				console.log(`debug hanurl.data:\n${JSON.stringify(hanurl.data, undefined, 2)}`)
				
				assert.equal(
					hanurl.data.size, 
					data_size, 
					`hanurl.data size ${hanurl.data.size} != ${data_size}`
				)
				
				assert.ok(hanurl.data.has('domain.json'))
				assert.ok(hanurl.data.get('domain.json').has('위키백과'))
			})
		})
		
		it.skip('handles load failures', function() {
			
		})
	})
	
	describe('save_data', function() {
		it.skip('saves all and any files to data dir', function() {
			
		})
		
		it.skip('handles save failures', function() {
			
		})
	})
	
	describe('url conversion', function() {
		it('converts han to latin', function() {
			let han = '코.위키백과.옭/위키/꿈나무'
			let url = hanurl.convert_han_url(han)
			console.log(`info converted url = ${url}`)
			assert.equal(url, 'https://ko.wikipedia.org/wiki/꿈나무')
		})
		
		it.skip('converts latin to han')
	})
})
