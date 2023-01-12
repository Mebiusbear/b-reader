import { html } from "cheerio/lib/api/manipulation";
import fs = require("fs");
import {store} from './store';
import * as vscode from 'vscode';
import { node_data } from "../@types"

function load_template(template_path: string) {
	return fs.readFileSync(template_path, "utf8");
}

function load_text(text_list: string[]) {
	var text:string = "";
	text_list.forEach((val) => {
		text += "<p>" + val + "</p>";
	})
	return text;
}

export function html_out (chapter_json:node_data,webview:vscode.Webview){
	const js_data = store.script_list(webview);
	// FIXME 找不到文件后进行下载
	const chapter_content = fs.readFileSync(chapter_json.chapter_path,{encoding:"utf-8"}).split("\n")
	const html_template_path:string = store.templateHtml();
	const html_template     :string = load_template(html_template_path);
	const html_output       :string = html_template.replace(/\{\{([A-Za-z0-9-_]+)\}\}/gi,
		(a,$1,$2) => {
			switch ($1) {
				case "content" : return load_text(chapter_content);
				case "script"  : return js_data;
				case "title"   : return chapter_json.chapter_name;
				case "css_path": return store.templateCss(webview);
			}
		return "";
	})
	return html_output;
}