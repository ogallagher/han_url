/**
 * @fileoverview Miscellaneous constants.
 */

exports.ext_json = '.json'

/**
 * Regexp for protocol (`http://` or `https://`).
 */
exports.re_protocol = /^(https?:\/\/)/g

// zzz.yyy...aaa.tld
/**
 * Regexp for domain parts (`zzz.yyy...aaa.tld`).
 */
exports.re_domain_parts = /([^\/]+\.)*[^\/]+/g

// /aaa/bbb.../zzz
/**
 * Regexp for path parts (`/aaa/bbb/.../zzz`).
 */
exports.re_path_parts = /(\/[^\/]*)+/g
