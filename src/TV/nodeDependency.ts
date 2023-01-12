import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { store,book_store } from "../utils/store"
import { node_data } from "../@types"


export class DepNodeProvider implements vscode.TreeDataProvider<Dependency> {

	private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | void> = new vscode.EventEmitter<Dependency | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | void> = this._onDidChangeTreeData.event;

	constructor() {
		console.log("Go with NodeProvider");
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Dependency): vscode.TreeItem {
		// console.log(element);
		return element;
	}

	getChildren(element?: Dependency): Thenable<Dependency[]> {
		
		if (element){ // TODO class可以不带书名
			switch (element.group){
				case 2 : {
					const book_root   = store.book_path(element.bookname);
					const book_json_f = fs.readFileSync(book_root["meta"],{encoding:"utf-8"});
					const chapter_exist:Array<string> = fs.readdirSync(store.book_path(element.bookname)["content"])
					const book_json   = JSON.parse(book_json_f);
					const group_data  = JSON.parse("{}")
					const res: Dependency[]          = [];
					let chapter_group: Array<string> = [];

					Object.values(book_json).map ( (val,ind) => {
						const chapter_json = val as node_data
						if (!chapter_group.includes(chapter_json.chapter_group)) {
							group_data[chapter_json.chapter_group] = [];
							chapter_group.push((val as node_data).chapter_group);
						}
						if (!chapter_exist.includes(chapter_json.chapter_name + ".txt")) {
							chapter_json.chapter_exist = false;
						}else {
							chapter_json.chapter_exist = true;
						}
						group_data[chapter_json.chapter_group].push(chapter_json);
					})
					book_store.set_book_json(element.bookname,group_data)
					
					chapter_group.forEach((val,ind) => {
						res.push(
							new Dependency(val,"",1,element.bookname,vscode.TreeItemCollapsibleState.Collapsed)
						)
					});
					return Promise.resolve(res);
				}
				case 1 : {
					const res: Dependency[] = [];
					(book_store.book_json[element.bookname][element.label] as node_data[]).forEach((val,ind) => {
						if (!val.chapter_exist){
							// TODO 将文字该图标
							val.chapter_name += "(未下载)";
							console.log(val.chapter_name);
						}
						res.push(
							new Dependency(val.chapter_name,"",0,element.bookname,vscode.TreeItemCollapsibleState.None,{
								command:"b-reader.test",
								title:"hello",
								arguments:[val],
							})
						)
					});
					return Promise.resolve(res);
				}
				case 0 : {
					break;
				}
			}
			return Promise.resolve([new Dependency("","",0,"",vscode.TreeItemCollapsibleState.None)])
		}
		else {
			const res: Dependency[] = []
			const book_list = getBook()
			
			if (!book_list) { vscode.window.showErrorMessage("U have no book!") }
			else {
				book_list.forEach( (val,ind) => {
					if (val != undefined) {
						const name_author = val.split("-")
						res.push(
							new Dependency(name_author[0],name_author[1],2,val,vscode.TreeItemCollapsibleState.Collapsed)
						)
					}
				})
			}
			return Promise.resolve(res)
		}
	}
}

function getBook() {
	const bookshelf_path = path.join(store.rootdir,"bookshelf");
	const book_list_f    = fs.readdirSync(bookshelf_path);
	
	return book_list_f.map ((val,ind) => {
		if (val.match(/.*?-.*?/)){ return val; }
	}) as string[];
}

export class Dependency extends vscode.TreeItem {

	constructor(
		public readonly label: string,
		public readonly author: string,
		public readonly group : number,
		public readonly bookname : string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly command?: vscode.Command
	) {
		super(label, collapsibleState);

		this.tooltip = `${this.label}-${this.author}`;
		this.description = this.author;
	}

	// iconPath = {
	// 	light: path.join(store.rootdir, 'icon', 'dependency.svg'),
	// 	dark : path.join(store.rootdir, 'icon', 'dependency.svg')
	// };

	contextValue = 'dependency';
}