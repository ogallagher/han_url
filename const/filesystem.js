/**
 * @fileoverview Files, directories, paths.
 */

const path = require('path')

/**
 * Data directory name.
 */
exports.data_dir = 'data'

/**
 * Absolute path to data directory.
 */
exports.data_path = path.resolve('.', exports.data_dir)

/**
 * Subdomains file.
 */
exports.subdomain_file = 'subdomain.json'
/**
 * Domains file.
 */
exports.domain_file = 'domain.json'
/**
 * Top level domains file.
 */
exports.tld_file = 'tld.json'
/**
 * Paths file.
 */
exports.path_file = 'path.json'

exports.history_file = 'history.json'

/**
 * Absolute path to subdomains file.
 */
exports.subdomain_path = path.resolve(exports.data_path, exports.subdomain_file)
/**
 * Absolute path to domains file.
 */
exports.domain_path = path.resolve(exports.data_path, exports.domain_file)
/**
 * Absolute path to top level domains file.
 */
exports.tld_path = path.resolve(exports.data_path, exports.tld_file)
/**
 * Absolute path to paths file.
 */
exports.path_path = path.resolve(exports.data_path, exports.path_file)

exports.history_path = path.resolve(exports.data_path, exports.history_file)

/**
 * Map file names to respective paths.
 */
exports.file_paths = new Map()

exports.file_paths.set(exports.subdomain_file, exports.subdomain_path)
exports.file_paths.set(exports.domain_file, exports.domain_path)
exports.file_paths.set(exports.tld_file, exports.tld_path)
exports.file_paths.set(exports.path_file, exports.path_path)
exports.file_paths.set(exports.history_file, exports.history_path)
