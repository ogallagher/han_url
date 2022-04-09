/**
 * @fileoverview Convert 한글 to url using phonetic latin/ascii characters.
 * 
 * @author <github.com/ogallagher> (갈라거 오엔, Owen Gallagher)
 */

// imports

const fs = require('fs')
const path = require('path')

const x = require('./const/etc.js')
const k = require('./const/keys.js')
const f = require('./const/filesystem.js')
const h = require('./const/korean.js')

/**
 * Map file names to loaded contents in memory.
 */
const data = new Map()
exports.data = data

// init data with empty keys
for (let filename of f.file_paths.keys()) {
	data.set(filename, new Map())
}

/**
 * Load data from the persistent data dir.
 * 
 * @returns {Promise} Resolves `undefined` when all data is loaded.
 */
function load_data(files) {
	if (files == undefined) {
		console.log(`info load all data files`)
		files = f.file_paths.keys()
	}
	
	return new Promise(function(resolve) {
		let promises = []
	
		for (let file of files) {
			if (f.file_paths.has(file)) {
				console.log(`debug load ${file} at ${f.file_paths.get(file)}`)
				
				if (file.endsWith(x.ext_json)) {
					promises.push(new Promise((resolve, reject) => {
						try {
							const json = require(f.file_paths.get(file))
							const map = data.get(file)
						
							for (let key of Object.keys(json)) {
								map.set(key, json[key])
							}
						
							resolve()
						
							console.log(
								`debug loaded ${file} = ${map}`
							)
						}
						catch (err) {
							console.log(
								`error failed to load ${
									f.file_paths.get(file)
								}\n${
									err.stack
								}`
							)
						
							reject()
						}
					}))
				}
				else {
					console.log(`warning ignoring unsupported format file ${file}`)
				}
			}
			else {
				console.log(`warning ignoring unknown data file ${file}`)
			}
		}
		
		Promise.all(promises)
		.finally(resolve)
	})
}
exports.load_data = load_data

/**
 * Write data to the persistent data dir.
 * 
 * @returns {Promise} Resolves `undefined` when all data is saved.
 */
function save_data(files) {
	if (files == undefined) {
		console.log(`info save all data to files`)
		files = data.keys()
	}
	
	return new Promise(function(resolve) {
		let promises = []
		
		for (let name of data.keys()) {
			promises.push(new Promise(function(res, rej) {
				fs.writeFile(f.file_paths.get(name), data.get(name), (err) => {
					if (err) {
						console.log(`error failed to save ${name}\n${err.stack}`)
						rej()
					}
					else {
						res()
					}
				})
			}))
		}
		
		Promise.all(promises)
		.finally(resolve)
	})
}
exports.save_data = save_data

function convert_han_url(han) {
	console.log(`info convert 한글 주소 "${han}" to url`)
	
	// reset reg exp states
	x.re_protocol.lastIndex = 0
	x.re_domain_parts.lastIndex = 0
	
	// match protocol
	let res_protocol = x.re_protocol.exec(han)
	if (res_protocol) {
		// set res_protocol to all chars matched
		res_protocol = res_protocol[0]
	}
	else {
		res_protocol = ''
	}
	console.log(`protocol = ${res_protocol}`)
	
	// match domain parts
	x.re_domain_parts.lastIndex = x.re_protocol.lastIndex
	
	let res_domain_parts = x.re_domain_parts.exec(han)
	if (res_domain_parts) {
		// set domain parts to all chars matched
		res_domain_parts = res_domain_parts[0]
	}
	else {
		console.log('error failed to find domain parts in url')
		return null
	}
	
	// convert domain parts
	let domain_parts = res_domain_parts.split('.')
	// sub
	for (let i=0; i<domain_parts.length-2; i++) {
		domain_parts[i] = convert_han_subdomain(domain_parts[i])
	}
	// dom
	let y = domain_parts.length-2
	domain_parts[y] = convert_han_domain(domain_parts[y])
	// tld
	let z = domain_parts.length-1
	domain_parts[z] = convert_han_tld(domain_parts[z])
	
	console.log(`domain parts = ${domain_parts}`)
	
	// match path parts
	x.re_path_parts.lastIndex = x.re_domain_parts.lastIndex
	
	let res_path_parts = x.re_path_parts.exec(han)
	if (res_path_parts) {
		// set path parts to all chars matched
		res_path_parts = res_path_parts[0]
	}
	else {
		res_path_parts = ''
	}
	
	// convert path parts
	if (res_path_parts[0] == '/') {
		res_path_parts = res_path_parts.substring(1)
	}
	let path_parts = res_path_parts.split('/')
	for (let i=0; i<path_parts.length; i++) {
		path_parts[i] = convert_han_path(path_parts[i])
	}
	
	console.log(`path parts = ${path_parts}`)
	
	// rebuild url and return
	return `${res_protocol || "https://"}${domain_parts.join('.')}/${path_parts.join('/')}`
}
exports.convert_han_url = convert_han_url

function convert_han_subdomain(han) {
	let ascii = data?.get(f.subdomain_file)?.get(han) || han
	console.log(`debug ${han} --> ${ascii}`)
	return ascii
}
exports.convert_han_subdomain = convert_han_subdomain

function convert_han_domain(han) {
	let ascii = data?.get(f.domain_file)?.get(han) || han
	console.log(`debug ${han} --> ${ascii}`)
	return ascii
}
exports.convert_han_domain = convert_han_domain

function convert_han_tld(han) {
	let ascii = data?.get(f.tld_file)?.get(han) || han
	console.log(`debug ${han} --> ${ascii}`)
	return ascii
}
exports.convert_han_tld = convert_han_tld

function convert_han_path(han) {	
	let ascii = data?.get(f.path_file)?.get(han) || han
	console.log(`debug ${han} --> ${ascii}`)
	return ascii
}
exports.convert_han_path = convert_han_path

/**
 * Generate latin phonetic spelling from hangeul 한글 string.
 * 
 * Note this won't work for unicodes larger than 4 bytes.
 */
function han_to_latin(han) {
	let out = ''
	
	let code, offset
	let cho, jung, jong
	for (let char of han) {
		code = char.charCodeAt(0)
		
		if (h.first_code <= code && code <= h.last_code) {
			// is hangul syllable 가 and 힣
			offset = code - h.first_code
            jong = offset % 28
            jung = (offset - jong) / 28 % 21
            cho = parseInt((offset - jong) / 28 / 21)
            out += h.cho[cho] + h.jung[jung] + h.jong[jong]
		}
		else {
			// is something else; leave unchanged
			out += char
		}
	}
	
	return out
	// leave end ㄱ<vowel> unchanged
	.replace(/G([aeoiuyw])/g, 'g$1')
	// convert end ㄱ<consonant> to k
	.replace(/G/g, 'k')
	// leave end ㅂ<vowel|ㅂㄴ> unchanged
	.replace(/B([aeoiuywbn])/g, 'b$1')
	// convert end ㅂ<consonant> to p
	.replace(/B/g, 'p')
	// leave end ㄷ<vowel|ㄷㄴ> unchanged
	.replace(/D([aeoiuywdn])/g, 'd$1')
	// convert end ㄷ<consonant> to t
	.replace(/D/g, 't')
	// convert ㄹㄹ to ll
	.replace(/(L[rl]|rr)/g, 'll')
	// convert end ㄹ<vowel> to r
	.replace(/L([aeoiuyw])/g, 'r$1')
	// leave end ㄹ<consonant> as l
	.replace(/L/g, 'l')
	// alias ㅝ as wo
	.replace(/weo/g, 'wo')
	// convert 시 to shi and 씨 to sshi
	.replace(/si/g, 'shi')
}
exports.han_to_latin = han_to_latin
