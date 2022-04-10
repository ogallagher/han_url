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
 * @param {(Array|String)} files Optional list of file names to load.
 * 
 * @returns {Promise} Resolves `undefined` when all data is loaded, or rejects when some
 * data fails.
 */
function load_data(files) {
	// convert undefined to all
	if (files == undefined) {
		console.log(`info load all data files`)
		files = f.file_paths.keys()
	}
	
	// convert single value to array
	if (typeof files == 'string' || files instanceof String) {
		files = [files]
	}
	
	return new Promise(function(resolve, reject) {
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
						}
						catch (err) {
							console.log(
								`error failed to load ${
									f.file_paths.get(file)
								}\n${
									err.stack
								}`
							)
						
							reject(file)
						}
					}))
				}
				else {
					console.log(`warning ignoring unsupported format file ${file}`)
					promises.push(Promise.reject(file))
				}
			}
			else {
				console.log(`warning ignoring unknown data file ${file}`)
				promises.push(Promise.reject(file))
			}
		}
		
		Promise.all(promises)
		.then(resolve,reject)
	})
}
exports.load_data = load_data

/**
 * Write data to the persistent data dir.
 * 
 * @param {(Array|String)} files Optional list of file names to save.
 * 
 * @returns {Promise} Resolves `undefined` when all data is saved, and rejects file names for
 * if any fail on write.
 */
function save_data(files) {
	if (files == undefined) {
		console.log(`info save all data to files`)
		files = data.keys()
	}
	
	// convert single value to array
	if (typeof files == 'string' || files instanceof String) {
		files = [files]
	}
	
	return new Promise(function(res, rej) {
		let promises = []
		
		for (let name of files) {
			promises.push(new Promise(function(res, rej) {
				fs.writeFile(
					f.file_paths.get(name), 
					JSON.stringify(map_to_object(data.get(name)), undefined, 2), 
					(err) => {
						if (err) {
							console.log(`error failed to save ${name}\n${err.stack}`)
							rej(name)
						}
						else {
							res()
						}
					}
				)
			}))
		}
		
		Promise.all(promises)
		.then(res, rej)
	})
}
exports.save_data = save_data

/**
 * Add `han-url` entry to history.
 */
function history_add(han, url) {
	let h = data.get(f.history_file)
	let when = new Date().toISOString()
	
	let entry = {
		han: han,
		latin: url,
		when: when
	}
	
	// add entry for each primary key
	h.get(k.han)[han] = entry
	h.get(k.latin)[url] = entry
	h.get(k.when)[when] = entry
	
	// update meta
	let meta = h.get(k.meta)
	meta[k.last_update] = when
	meta[k.count]++
}

/**
 * Convert hangul url to latin url.
 * 
 * @param {String} han Hangul 한글 url.
 * @param {Boolean} phonetic_if_unknown Generate phonetic latin whenever a han->latin mapping 
 * does not yet exist for the given url part. Default is `false`.
 * @param {Boolean} forget Do not save this url conversion to history. Default is `false`.
 * 
 * @returns {String} Converted latin url.
 */
function convert_han_url(han, phonetic_if_unknown, forget) {
	console.log(`info convert 한글 주소 "${han}" to url`)
	
	// param defaults
	phonetic_if_unknown = (phonetic_if_unknown === undefined) ? false : phonetic_if_unknown
	forget = (forget === undefined) ? false : forget
	
	// check history for existing conversion
	// path = data.history.han[han].latin
	let url = data.get(f.history_file).get(k.han)[han]?.[k.latin]
	
	if (url !== undefined) {
		// known url
		console.log(`info recognized url ${han} --> ${url}`)
	}
	else {
		// new url
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
		console.log(`debug protocol = ${res_protocol}`)
	
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
			domain_parts[i] = convert_han_url_part(
				domain_parts[i], 
				f.subdomain_file, 
				phonetic_if_unknown
			)
		}
		// dom
		let y = domain_parts.length-2
		domain_parts[y] = convert_han_url_part(
			domain_parts[y], 
			f.domain_file,
			phonetic_if_unknown
		)
		// tld
		let z = domain_parts.length-1
		domain_parts[z] = convert_han_url_part(
			domain_parts[z],
			f.tld_file,
			phonetic_if_unknown
		)
	
		console.log(`info domain parts = ${domain_parts}`)
	
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
			path_parts[i] = convert_han_url_part(
				path_parts[i],
				f.path_file,
				phonetic_if_unknown
			)
		}
	
		console.log(`info path parts = ${path_parts}`)
	
		// rebuild url
		url = `${res_protocol || "https://"}${domain_parts.join('.')}/${path_parts.join('/')}`
	}
	
	// update history
	history_add(han, url)
	
	return url
}
exports.convert_han_url = convert_han_url

/**
 * Helper method for {@link convert_han_url}.
 */
function convert_han_url_part(han, part, phonetic_if_unknown) {
	// param defaults
	phonetic_if_unknown = (phonetic_if_unknown === undefined) ? false : phonetic_if_unknown
	
	let latin = undefined
	
	switch (part) {
		case f.subdomain_file:
		case 'subdomain':
			latin = data.get(f.subdomain_file).get(han)
			break
			
		case f.domain_file:
		case 'domain':
			latin = data.get(f.domain_file).get(han)
			break
			
		case f.tld_file:
		case 'tld':
			latin = data.get(f.tld_file).get(han)
			break
			
		case f.path_file:
		case 'path':
			latin = data.get(f.path_file).get(han)
			break
	}
	
	if (latin === undefined) {
		if (phonetic_if_unknown) {
			// generate phonetic mapping
			latin = han_to_latin(han)
		}
		else {
			// leave unchanged
			latin = han
		}
	}
	// else, han mapping exists
	
	console.log(`debug ${han} --> ${latin}`)
	return latin
}

/**
 * Generate latin phonetic spelling from hangeul 한글 string.
 * 
 * Note this won't work for unicodes larger than 4 bytes.
 * Derived from [github.com/kawoou/jquery-korean-pron](https://github.com/kawoou/jquery-korean-pron).
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
	// convert <vowel>ㄹ<vowel> to r
	.replace(/(?<=[aeoiuyw])L(?=[aeoiuyw])/g, 'r')
	// convert remaining ㄹ to l
	.replace(/L/g, 'l')
	// alias ㅝ as wo
	.replace(/weo/g, 'wo')
	// convert <vowel|ㅅ>ㅅ<vowel|ㅅ> to s
	.replace(/S(?=[aeoiuywsS])/g, 's')
	// convert <vowel|ㅈ>ㅈ<vowel|ㅈ> to j
	.replace(/J(?=[aeoiuywjJ])/g, 'j')
	// convert remaining ㅅ,ㅈ,ㅆ<consonant> to t
	.replace(/[SJ]|(?:([sS][sS])([^aeoiuyw]))/g, 't$2')
	// convert 시 to shi and 씨 to sshi
	.replace(/si/g, 'shi')
}
exports.han_to_latin = han_to_latin

/**
 * Convert a map to a plain object.
 * 
 * @param {Map} map Map to convert.
 * 
 * @returns {Object} Corresponding object with matching keys and values.
 */
function map_to_object(map) {
	let obj = {}
	
	for (let key of map.keys()) {
		obj[key] = map.get(key)
	}
	
	return obj
}
