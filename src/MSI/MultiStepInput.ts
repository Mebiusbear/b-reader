import { QuickPickItem, window, Disposable, CancellationToken, QuickInputButton, QuickInput, ExtensionContext, QuickInputButtons, Uri } from 'vscode';
import { searchOn_bqg ,searchOnline_bqg, downloadOnline_bqg } from "../utils/downloads"
import { MultiStepInput } from "./MultiStepInput_class"
import { book_data, search_data } from "../@types"
import { search } from '../utils/search';


export const Sleep = (ms:number)=> {
    return new Promise(resolve=>setTimeout(resolve, ms))
}

export async function multiStepInput(context: ExtensionContext) {

	interface State {
		title: string;
		step: number;
		totalSteps: number;
		resourceGroup: QuickPickItem | string;
		name: string;
		runtime: QuickPickItem;
	}

	async function collectInputs() {
		const state = {} as Partial<State>;
		await MultiStepInput.run(input => inputBookName(input, state));
		return state as State;
	}

	const title = '在线搜索小说';

    async function inputBookName(input: MultiStepInput, state: Partial<State>) {
        state.resourceGroup = await input.showInputBox({
            title,
            step: 2,
			totalSteps: 3,
			prompt: '请输入需要搜索的小说名字',
            // value: '作者超级帅',
            value: '婚后心动',
            valueSelection: [0, 5],
            placeHolder: 'For Example : 作者无敌帅',
			validate: validateNameIsUnique,
			shouldResume: shouldResume
        })

		const bookname = state.resourceGroup;
		const search_list:  book_data[] = await search.search_function(bookname, ".bookbox");
		// 如果为空
        return (input: MultiStepInput) => pickBookSource(input,state,search_list);
    }

    async function pickBookSource(input: MultiStepInput, state: Partial<State>,search_list:book_data[]) {
		const booksourcelist : QuickPickItem[] = search_list.map((val,ind) => {
			return `id : ${ind} , ${val.book_author} => ${val.book_name}`
		}).map (label => ({label}));

		const pick = await input.showQuickPick({
			title,
			step: 3,
			totalSteps: 3,
			placeholder: '请选择小说',
			items: booksourcelist,
			activeItem: typeof state.resourceGroup !== 'string' ? state.resourceGroup : undefined,
			shouldResume: shouldResume
		});
		state.resourceGroup = pick;
		console.log(search_list);
		
		const book_id:number = Number(pick.label.match(/id : (.*?), /)![1]);
		const book_url = search_list[book_id].book_url;
		search.get_catalogue(search_list[book_id])
		// await searchOnline_bqg(search_list[book_id])
		// await downloadOnline_bqg(search_list[book_id])
		// TODO 加上最后确认一步
		// TODO 下载进度显示
	}


	function shouldResume() {
		// Could show a notification with the option to resume.
		return new Promise<boolean>((resolve, reject) => {
			true
			// noop
		});
	}

	async function validateNameIsUnique(name: string) {
		// ...validate...
		await new Promise(resolve => setTimeout(resolve, 1000));
		return name === 'vscode' ? 'Name not unique' : undefined;
	}

	const state = await collectInputs();
	window.showInformationMessage(`Download Success!`);
}

