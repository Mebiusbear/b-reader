import path = require("path");
import {DataPath,scriptpath,csspath} from "./route";
import * as vscode from 'vscode';
import fs = require("fs");
import { node_data } from "../@types";

class Store {
	public rootdir = "";
	
	templateCss (webview:vscode.Webview) {
		const css_path = path.join(this.rootdir,DataPath.templateCss);
		return webview.asWebviewUri(vscode.Uri.file(css_path)).toString();
	}
	templateHtml () {
		return path.join(this.rootdir,DataPath.templateHtml);
	}
	jsonMeta () {
		return path.join(this.rootdir,DataPath.jsonMeta);
	}
	read_data_json () {
		return path.join(this.rootdir,DataPath.read_data_json);
	}
	book_path (book_name:string) {
		if (!fs.existsSync(path.join(this.rootdir,"bookshelf"))) { 
			fs.mkdirSync(path.join(this.rootdir,"bookshelf"));
		}
		const book_p = path.join(this.rootdir,`bookshelf/${book_name}`);
		const book_p_content = path.join(book_p,"content");
		const book_p_meta = path.join(book_p,"meta.json");
		const book_p_error = path.join(book_p,"error_chapter");
		if (!fs.existsSync(book_p)) {
			fs.mkdirSync(book_p);
			fs.mkdirSync(book_p_content);
			fs.mkdirSync(book_p_error);
		}
		return {meta:book_p_meta,error_chapter:book_p_error,content:book_p_content};
	}

	chapter_path (book_name:string,chapter_name:string) {
		return path.join(this.rootdir,"bookshelf",book_name,`${chapter_name}.txt`)
	}

	script_list (webview:vscode.Webview) {
		var res = "";
		Object.values(scriptpath).forEach ((values) => {
			const val_path = vscode.Uri.file(path.join(this.rootdir,values));
			res += '<script type="text/javascript" src="' + webview.asWebviewUri(val_path).toString() + '"></script>\n';
		})
		return res;
	}
}

class Book_store {
	public book_json = JSON.parse("{}");
	public book_meta:any = "";
	public now_chapter_json:node_data = {
		chapter_group : "",
		book_name  : "",
		chapter_name  : "",
		chapter_path  : "",
		chapter_url   : "",
		chapter_id    : 0,
	};

	set_book_json (bookname:string,bookjson:any) {
		this.book_json[bookname] = bookjson;
	};


}
  
const store = new Store();
const book_store = new Book_store();

export { store,book_store };