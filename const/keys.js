/**
 * @fileoverview Object and map keys.
 */

const meta = {
	_key: '#meta',
	last_update: 'last_update',
	count: 'count',
	description: 'description'
}

exports.meta = meta._key
exports.last_update = meta.last_update
exports.count = meta.count

const history = {
	when: 'when',
	han: 'han',
	latin: 'latin'
}

history.entry = {
	when: history.when,
	han: history.han,
	latin: history.latin
}

exports.when = history.when
exports.han = history.han
exports.latin = history.latin
