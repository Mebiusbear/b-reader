import { html_out } from "../utils/behtml"
import { book_store, store } from "../utils/store"
import * as vscode from 'vscode';
import fs = require("fs");

import { node_data } from "../@types"

export class ReaderPanel {
	public static currentPanel: ReaderPanel | undefined;
	public readonly _panel: vscode.WebviewPanel;
	public readonly _chapter_json: node_data;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri,chapter_json:node_data) {
		store.rootdir = extensionUri.fsPath
		book_store.book_meta = JSON.parse(fs.readFileSync(store.book_path(chapter_json.book_name)["meta"],{encoding:"utf-8"}));
		book_store.now_chapter_json = chapter_json;

		// 如果已经存在面板
		if (ReaderPanel.currentPanel) {
			if (ReaderPanel.currentPanel._chapter_json == chapter_json){
				ReaderPanel.currentPanel._panel.reveal(vscode.ViewColumn.One,);
			}
			else {
				if (ReaderPanel.currentPanel._chapter_json.book_name != chapter_json.book_name) {
					book_store.book_meta = JSON.parse(fs.readFileSync(store.book_path(chapter_json.book_name)["meta"],{encoding:"utf-8"}));
					book_store.now_chapter_json = chapter_json;
				}
				ReaderPanel.currentPanel = new ReaderPanel(ReaderPanel.currentPanel._panel, extensionUri,chapter_json);
			}
			return;
		};
		// 创建新面板
		const panel = vscode.window.createWebviewPanel(
			"Reader","Reader",vscode.ViewColumn.One,
			{ enableScripts : true }
		);

		panel.webview.onDidReceiveMessage(
			message => {
				console.log(message)
				switch (message.command) {
					case "next"  : { 
						book_store.now_chapter_json = book_store.book_meta[book_store.now_chapter_json.chapter_id+1];
						panel.title = book_store.now_chapter_json.chapter_name;
						panel.webview.html = html_out(book_store.now_chapter_json,panel.webview);
						break; 
					}
					case "previous"  : { 
						book_store.now_chapter_json = book_store.book_meta[book_store.now_chapter_json.chapter_id-1];
						panel.title = book_store.now_chapter_json.chapter_name;
						panel.webview.html = html_out(book_store.now_chapter_json,panel.webview);
						break; 
					}
					return; // vscode.window.showErrorMessage(message.text)
				}
			},
			undefined
		);
		// vscode.window.onDidChangeWindowState( state => { console.log(state); } );
		ReaderPanel.currentPanel = new ReaderPanel(panel, extensionUri,chapter_json);
	}

		
	private _update(option:string,extensionUri: vscode.Uri,chapter_json:node_data) {
		const webview_panel = this._panel;
		webview_panel.title = chapter_json.chapter_name;
		webview_panel.webview.html = html_out(chapter_json,webview_panel.webview);
	}

	public dispose() {
		ReaderPanel.currentPanel = undefined;
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	
	public static test(extensionUri: vscode.Uri,book_name:string) {

	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri,chapter_json:node_data) {
		this._panel = panel;
		this._chapter_json = chapter_json;
		this._extensionUri = extensionUri;
		this._update("hold",extensionUri,chapter_json);
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
	}
}

