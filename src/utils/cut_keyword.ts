
// TODO vscode化
import { readdirSync, readFileSync, writeFileSync } from "fs";
import path = require("path");

const book_path = "/Users/bear/.vscode/extensions/bear.b-reader-0.2.1/bookshelf/官场问鼎-梅花三弄/content"
const chapter_list = readdirSync(book_path)

chapter_list.forEach ( (val) => {
	const chapter_path = path.join(book_path,val)
	if (chapter_path.match(/.*?.txt/)) {
		console.log(chapter_path);
		
		let chapter_content = readFileSync(chapter_path,{encoding:"utf-8"})
		chapter_content = chapter_content.replace(/恋上你看书网\n/,"")
		chapter_content = chapter_content.replace(/请收藏本站：https\:\/\/www\.bqg78\.com。笔趣阁手机版：https\:\/\/m\.bqg78\.com/,"")
		writeFileSync(chapter_path,chapter_content,{encoding:"utf-8"})
	}
})



