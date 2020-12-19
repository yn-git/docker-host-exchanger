// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const COMMANDIDPREFIX = "docker-host-exchanger"
const commandIds = {
	change: `${COMMANDIDPREFIX}.change`
}

const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
statusBar.command = commandIds["change"];

function getDockerHostConfig(): string {
	const config: string | undefined = vscode.workspace.getConfiguration("docker").get("host")

	if (config) return config
	else return ""
}

function searchKey(dic: object, targetValue: string): string | undefined {
	for (const [key, value] of Object.entries(dic)) {
		if (targetValue === value) return key
	}
}

interface hostList {
	[key: string]: string
}
function getHostList(showMsg=false): hostList | undefined {
	const hostList = vscode.workspace.getConfiguration("dhe").get<hostList>("hostList");

	if (hostList !== undefined) {
		return hostList;
	}
	else {
		// TODO: rewrite error message
		if (showMsg) vscode.window.showInformationMessage("Please write settings.");
	}
}

function updateStatusBar(): void {
	const hostList = getHostList(true);
	if (hostList === undefined) {
		return
	}

	const nowConfig = getDockerHostConfig();
	if (nowConfig) {
		const relatedKey = searchKey(hostList, nowConfig);
		if (relatedKey !== undefined) statusBar.text = relatedKey;
		// TODO: エラー対処について書く
		else statusBar.text = "error";
	}
	else statusBar.text = "local";

	statusBar.show();

	return;
}

// test は後回し
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	updateStatusBar();
	context.subscriptions.push(statusBar);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(updateStatusBar));
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "docker-host-exchanger" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(commandIds["change"], () => {
		// The code you place here will be executed every time your command is executed
		

		const hostList = getHostList(true);
		if (hostList === undefined) return;
		const pick = vscode.window.showQuickPick(["local", ...Object.keys(hostList)]);
		
		pick.then((pickValue) => {
			if (pickValue === undefined) return;

			const dockerHostConfig = vscode.workspace.getConfiguration("docker");
			if (pickValue === "local")
				dockerHostConfig.update("host", undefined, true);
			else 
				dockerHostConfig.update("host", hostList[pickValue], true);

			// 設定を変えたことで，自動的に update 関数が呼ばれるはず

		})

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
