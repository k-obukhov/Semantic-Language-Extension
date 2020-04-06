'use strict';
import * as path from 'path';
import { getHelpFile, getTemplateFile } from './utils/extPath';
import * as buildTask from './tasks/buildTask';

import * as fs from "fs-extra"
import * as vscode from 'vscode';
import { SlangLaunchTaskProvider } from './tasks/launchTask';

export function activate(context: vscode.ExtensionContext) {
    
    const d = vscode.workspace.registerTaskProvider("slang", new buildTask.SlangBuildTaskProvider(context));
    context.subscriptions.push(d);

    context.subscriptions.push(vscode.workspace.registerTaskProvider("slang", new SlangLaunchTaskProvider(context)))

    context.subscriptions.push(
        vscode.commands.registerCommand('ext.SetActive', async() => {
            if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
            {
                const quickPick = vscode.window.createQuickPick();
                quickPick.canSelectMany = false;
                quickPick.items = vscode.workspace.workspaceFolders.map((val, idx, arr) => {return {label: val.uri.fsPath}});
                quickPick.onDidChangeSelection(selection => {
                    if (selection[0]) {
                        vscode.workspace.getConfiguration().update('slang.default_project', selection[0].label);
                        vscode.window.showInformationMessage(`Active project updated — ${selection[0].label}`);
                        quickPick.dispose();
                    }
                });
                quickPick.onDidHide(() => quickPick.dispose());
                quickPick.show();
            }
        })
    );

	context.subscriptions.push(
        vscode.commands.registerCommand('ext.InitProject', 
        async () => {
            // TODO изменить алгоритм
            // Нужно создавать папку в текущем воркспейсе либо запрашивать на открытие + запрос на имя проекта!
            let projectName = await vscode.window.showInputBox({
                placeHolder: "input Project Name"
            });

            if (projectName == undefined)
            {
                vscode.window.showErrorMessage("Project name was not set");
                return;
            }

            const options: vscode.OpenDialogOptions = {
                canSelectMany: false,
                canSelectFolders: true,
                canSelectFiles: false,
                openLabel: 'Choose folder of project'
            };

            vscode.window.showOpenDialog(options).then(fileUri => {
                if (fileUri && fileUri[0]) 
                {
                    let dir : string = `${fileUri[0].fsPath}/${projectName}`;

                    if (!fs.existsSync(dir)) {
                        try {
                            fs.mkdirSync(dir);

                            let pfile : string = path.join(dir, "Main.sl");
                            let sourceMain : string = getTemplateFile(context, "Main.sl");

                            fs.copy(sourceMain, pfile);

                            let gitFile : string = path.join(dir, ".gitignore");
                            let sourceGit : string = getTemplateFile(context, ".gitignore");

                            fs.copy(sourceGit, gitFile);
                            
                            if (!fs.existsSync(pfile)) 
                            {
                                vscode.window.showInformationMessage(`SL Project Created, Main file = ${pfile}`);
                                
                                vscode.workspace.openTextDocument(pfile).then((a: vscode.TextDocument) => {
                                    vscode.window.showTextDocument(a, 1, false);
                                });

                                vscode.workspace.updateWorkspaceFolders(0, undefined, {uri: vscode.Uri.file(dir), name: `SL Project: ${projectName}`});
                                vscode.workspace.getConfiguration().update('slang.default_project', path.normalize(dir));
                            }
                            else 
                            {
                                vscode.window.showErrorMessage('Project Error');
                            }

                        }
                        catch (e) {
                            vscode.window.showErrorMessage(`Error in project creating - ${e}`);
                        }
                    }
                    else {
                        vscode.window.showErrorMessage("Folder is exist!");
                    }
                }
            });
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ext.ShowHelp', 
        () => 
        {
            fs.readFile(getHelpFile(context, "index.html"), (err, data) => 
            {
                if (err)
                {
                    vscode.window.showErrorMessage(`Error while reading help file = ${err}`);
                }
                else
                {
                    const panel = vscode.window.createWebviewPanel(
                        'SLang Help',
                        'SLang Help',
                        vscode.ViewColumn.One,
                        {
                            enableScripts: true
                        });

                    panel.webview.html = data.toString();
                }
            });
        })
    );
}

export function deactivate() {
}