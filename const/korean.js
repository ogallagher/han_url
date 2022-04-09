/**
 * @fileoverview Constants related to 한국어, 한글.
 */

exports.first_code = '가'.charCodeAt(0)
exports.last_code = '힣'.charCodeAt(0)

/**
 * Syllable start 자모. Unicode order ascending.
 */
exports.cho = [
	// 'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ',
	'g', 'gg', 'n', 'd', 'dd', 'r', 'm', 'b',
	// 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ',
	'bb', 's', 'ss', '', 'j', 'jj', 'ch', 'k',
	// 'ㅌ', 'ㅍ', 'ㅎ'
	't', 'p', 'h'
]
/**
 * Syllable middle 자모. Unicode order ascending.
 */
exports.jung = [
	// 'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ',
	'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye',
	// 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ',
	'o', 'wa', 'wae', 'oe', 'yo', 'u', 'weo', 'we',
	// 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
	'wi', 'yu', 'eu', 'ui', 'i'
]
/**
 * Syllable end 자모. Unicode order ascending.
 */
exports.jong = [
	// '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ',
	'', 'G', 'gG', 'Gs', 'n', 'nj', 'nh', 'D',
	// 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ',
	'L', 'lG', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh',
	// 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ',
	'm', 'B', 'bs', 's', 'ss', 'ng', 'j', 'cc',
	// 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
	'k', 't', 'p', 'h'
]
