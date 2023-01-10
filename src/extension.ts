import * as vscode from 'vscode';
import { MSI_func } from "./MSI/2command";
import { store } from "./utils/store"
import { DepNodeProvider } from "./TV/nodeDependency"
import { ReaderPanel } from "./webview/ReaderPanel"

import { node_data } from "./@types"

export function activate(context: vscode.ExtensionContext) {
    store.rootdir = context.extensionUri.fsPath;
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
