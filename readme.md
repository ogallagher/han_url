# **hanurl** / **한링크**

Convert between urls expressed with latin letters (ex. wikipedia.com, naver.com) and those with korean 한글 characters (ex. 위키백과.콤, 네이버.콤). This is done using a collection of customizable url part mappings and automatically generated phonetic conversion.

One explored application of the core library `han_url.js` is a Chrome browser extension, which supports input of urls expressed as hangul characters. This is different from the default search bar in the following ways: 

1. Default search can display and accept hangul characters, but these will be automatically escaped/url-encoded, as they are not actually supported url characters.
1. Most websites will not express their web addresses with hangul characters and instead use some combination of phonetic conversion and translation. With **hanurl**, a 한글 alias of an existing url can be used and created.
