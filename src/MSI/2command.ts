import { multiStepInput } from "./MultiStepInput"
import * as vscode from 'vscode';

export function MSI_func(context:vscode.ExtensionContext) {
	const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
		"笔趣阁78":multiStepInput,
	};
	
	const quickPick = vscode.window.createQuickPick();
	quickPick.title = '在线搜索小说';
	quickPick.step = 1;
	quickPick.totalSteps = 3;
	quickPick.items = Object.keys(options).map(label => ({ label }));
	
	quickPick.onDidChangeSelection(selection => {
		if (selection[0]) {
			options[selection[0].label](context).catch(console.error);
		}
	});
	quickPick.onDidHide(() => quickPick.dispose());
	quickPick.show();	
}
