import * as vscode from 'vscode';
import { MSI_func } from "./MSI/2command";
import { store } from "./utils/store"
import { DepNodeProvider } from "./TV/nodeDependency"
import { ReaderPanel } from "./webview/ReaderPanel"

import { node_data } from "./@types"
import { search } from "./utils/search"



export function activate(context: vscode.ExtensionContext) {
    store.rootdir = context.extensionUri.fsPath;
    console.log(store.rootdir);
    // FIXME 调试打包后地址分布
    
    // const b = search.search_function("万族之劫", ".bookbox");
    // search.get_catalogue(b)
    
    // b.then( res => {search.get_catalogue(res[0])});
    
	const nodeDependenciesProvider = new DepNodeProvider();
	vscode.window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('b-reader.searchOnline', ()=>{
            MSI_func(context)
        }),
        vscode.commands.registerCommand('b-reader.test', (message)=>{
            const chapter_json = message as node_data
            
            ReaderPanel.createOrShow(context.extensionUri,chapter_json);
        }),
    );
}
