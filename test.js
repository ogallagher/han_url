/**
 * @fileoverview Mocha unit tests for han_url.
 */

const assert = require('assert')
const path = require('path')
const fs = require('fs')

const temp_logger = require('temp_js_logger')

const hanurl = require('./han_url.js')
const f = require('./const/filesystem.js')
const k = require('./const/keys.js')
const pkg = require('./package.json')

describe(`${pkg.name} v${pkg.version} unit tests`, function() {
	const data_size = 5
	
	before(function() {
		// init logging
		temp_logger.config({
			level: 'debug',
			with_timestamp: false,
			caller_name: `${pkg.name}.test`,
			with_lineno: true,
			parse_level_prefix: true,
			with_level: true,
			with_cli_colors: true
		})
		
		return temp_logger.imports_promise
		// load all hanurl data
		.then(hanurl.load_data)
		.then(() => {
			console.log(`debug hanurl.data:\n${JSON.stringify(hanurl.data, undefined, 2)}`)
		})
	})
	
	describe('load_data', function() {
		it('loads all and any files from data dir', function() {
			// check load
			assert.equal(
				hanurl.data.size, 
				data_size, 
				`hanurl.data size ${hanurl.data.size} != ${data_size}`
			)
			
			assert.ok(hanurl.data.has('domain.json'))
			assert.ok(hanurl.data.get('domain.json').has('위키백과'))
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
		it('saves all and any files to data dir', function() {
			// register test data file
			const test_file = 'test.json'
			const test_path = path.resolve(f.data_path, test_file)
			
			f.file_paths.set(test_file, test_path)
			hanurl.data.set(test_file, new Map())
			
			return new Promise(function(res) {
				// delete if exists
				fs.exists(test_path, function(exists) {
					if (exists) {
						console.log(`info delete existing test data file ${test_path}`)
					}
					else {
						console.log(`debug test data file not yet found`)
					}
					
					res()
				})
			})
			.then(() => {
				return new Promise(function(res, rej) {
					// create test data
					const test_data = hanurl.data.get(test_file)
					test_data.set('key-boolean', true)
					test_data.set('key-number', 1)
					test_data.set('key-string', 'value')
				
					// write new test data file
					hanurl.save_data(test_file)
				
					// read new test data file
					fs.readFile(test_path, function(err, data) {
						if (err) {
							console.log(
								`error failed to read test file ${
									test_path
								} after write:\n${
									err.stack
								}`
							)
							rej(new Error(err.message))
						}
						else {
							data = JSON.parse(data)
							
							for (let key of test_data.keys()) {
								assert.ok(key in data, `${key} not found in test data ${data}`)
								assert.equal(test_data.get(key), data[key])
							}
							
							res()
						}
					})
				})
			})
		})
		
		it('handles save failures', function() {
			// save fake
			return hanurl.save_data('nothing.json')
			.then(
				() => {
					assert.ok(false, 'did not reject on save of fake data file')
				},
				(fails) => {
					console.log(`info save fails for nothing.json: ${fails}`)
					assert.ok(true)
				}
			)
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
	
	describe.skip('latin_to_han', function() {
		
	})
	
	describe('url conversion via maps', function() {
		it('converts han to latin', function() {
			let han = '코.위키백과.옭/위키/꿈나무'
			let url = hanurl.convert_han_url(han, false, true)
			console.log(`info converted url = ${url}`)
			assert.equal(url, 'https://ko.wikipedia.org/wiki/꿈나무')
		})
		
		it.skip('converts latin to han', function() {
			let url = 'ko.wikipedia.org/wiki/꿈나무'
			let han = hanurl.convert_latin_url(url, false, true)
			console.log(`info converted han url = ${han}`)
			assert.equal(han, '코.위키백과.옭/위키/꿈나무')				
		})
	})
	
	describe('url conversion via phonetics', function() {
		it('converts han to latin phonetically', function() {
			let han = 'http://기억이.나지.않은/한링크/입니다'
			let url = hanurl.convert_han_url(han, true, true)
			console.log(`info converted url = ${url}`)
			assert.equal(url, 'http://gieogi.naji.anheun/hanlingkeu/ibnida')
		})
	})
	
	describe('data.history', function() {
		const test_protocol = 'https://'
		const test_domain = `test.${pkg.name}.${pkg.version}`
		const url_prefix = test_protocol + test_domain
		
		before(function() {
			// clear test entries from history
			let filter_out
			let deleted_ids = []
			function filter_entry(key_val) {
				try {
					if (
						key_val[0] == k.description ||
						!key_val[1][k.han].startsWith(url_prefix)
					) {
						filter_out[key_val[0]] = key_val[1]
					}
					else {
						deleted_ids.push(key_val[0])
					}
				}
				catch (err) {
					console.log(
						`error failed to filter ${key_val.join('=')}.\n${err.stack}`
					)
				}
			}
			function filter_id(key_id) {
				if (deleted_ids.indexOf(key_id[1]) == -1) {
					filter_out[key_id[0]] = key_id[1]
				}
			}
			
			let history = hanurl.data.get(f.history_file)
			
			filter_out = {}
			Object.entries(history.get(k.uuid)).map(filter_entry)
			history.set(k.uuid, filter_out)
			
			filter_out = {}
			Object.entries(history.get(k.when)).map(filter_id)
			history.set(k.when, filter_out)
			
			filter_out = {}
			Object.entries(history.get(k.han)).map(filter_id)
			history.set(k.han, filter_out)
			
			filter_out = {}
			Object.entries(history.get(k.latin)).map(filter_id)
			history.set(k.latin, filter_out)
		})
		
		it('updates for each new conversion', function() {
			let history = hanurl.data.get(f.history_file)
			
			let han1 = url_prefix + '/지금-음악은-못-들려'
			assert.ok(
				!(han1 in history.get(k.han)),
				`found han url ${han1} before adding to history`
			)
			let latin1 = hanurl.convert_han_url(han1, true, false)
			assert.ok(
				han1 in history.get(k.han),
				`${
					han1
				} not found in history.han:\n${
					JSON.stringify(history.get(k.han), undefined, 2)
				}`
			)
			assert.ok(
				latin1 in history.get(k.latin),
				`${latin1} not found in history.latin`
			)
			let whens = []
			Object.values(history.get(k.uuid)).map(function(v) {
				if (v.han == han1) whens.push(v)
			})
			assert.equal(
				whens.length, 
				1, 
				`${
					han1
				} history.when search results length not 1:\n${
					JSON.stringify(whens, undefined, 2)
				}`
			)
			
			return hanurl.save_data(f.history_file)
		})
	})
})
