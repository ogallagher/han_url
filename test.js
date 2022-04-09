/**
 * @fileoverview Mocha unit tests for han_url.
 */

const assert = require('assert')

const hanurl = require('./han_url.js')
const pkg = require('./package.json')

describe(`${pkg.name} v${pkg.version} unit tests`, function() {
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
		
		it('handles load failures', function() {
			// load fake
			return hanurl.load_data('nothing.json')
			.then(
				() => {
					assert.ok(false, 'did not reject on load of fake data file')
				},
				(fails) => {
					console.log(`info load fails: ${fails}`)
					assert.ok(true)
				}
			)
		})
	})
	
	describe('save_data', function() {
		it.skip('saves all and any files to data dir', function() {
			
		})
		
		it.skip('handles save failures', function() {
			
		})
	})
	
	describe('han_to_latin', function() {
		it('converts hangul text to latin phonetically and preserves unsupported characters', function() {
			let han, lat
			const scenarios = [
				[
					'라랄알을라', 
					'lararareulla'
				],
				[
					'따르는 괴물의 물이 딸라요', 
					'ddareuneun goemurui muri ddallayo'
				],
				[
					'밥솥 밥 값 값이 첫 첫차와 막차 찍다가 씨 있다', 
					'bapsot bap gapt gapshi cheot cheotchawa makcha jjikdaga sshi itda'
				],
				[
					'이 응용프로그램은 가끔 한링크라고 불러',
					'i eungyongpeurogeuraemeun gaggeum hanlingkeurago bulleo'
				],
				[
					'https://코.웹싸이트.콤/장소',
					'https://ko.wepssaiteu.kom/jangso'
				]
			]
		
			for (let scenario of scenarios) {
				han = scenario[0]
				lat = scenario[1]
			
				assert.equal(
					hanurl.han_to_latin(han), 
					lat,
					`failed to generate latin for ${han}`
				)
			}
		})
	})
	
	describe('url conversion via maps', function() {
		it('converts han to latin', function() {
			let han = '코.위키백과.옭/위키/꿈나무'
			let url = hanurl.convert_han_url(han)
			console.log(`info converted url = ${url}`)
			assert.equal(url, 'https://ko.wikipedia.org/wiki/꿈나무')
		})
		
		it.skip('converts latin to han')
	})
})
