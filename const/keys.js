/**
 * @fileoverview Object and map keys.
 */

const meta = {
	_key: '#meta',
	last_update: 'last_update',
	description: 'description'
}

exports.meta = meta._key
exports.last_update = meta.last_update
exports.description = meta.description

const history = {
	uuid: 'uuid',
	when: 'when',
	han: 'han',
	latin: 'latin'
}

history.entry = {
	uuid: history.uuid,
	when: history.when,
	han: history.han,
	latin: history.latin
}

exports.uuid = history.uuid
exports.when = history.when
exports.han = history.han
exports.latin = history.latin
