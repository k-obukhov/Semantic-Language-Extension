'use strict';
import * as path from 'path';
const fs = require('fs');

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
        vscode.commands.registerCommand('ext.InitProject', 
        async () => {
            // TODO изменить алгоритм
            // Нужно создавать папку в текущем воркспейсе либо запрашивать на открытие + запрос на имя проекта!
            let projectName = await vscode.window.showInputBox({
                placeHolder: "input Project Name"
            });

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
                    
                            fs.writeFile(pfile,'module Main\nstart\n\toutput \"Hello World!\";\nend', "utf-8", 
                                (err: Error) => {if(err) throw err; console.log("Project was created");
                            });
                            
                            if (!fs.existsSync(pfile)) 
                            {
                                vscode.window.showInformationMessage(`SL Project Created, Main file = ${pfile}`);
                                
                                vscode.workspace.openTextDocument(pfile).then((a: vscode.TextDocument) => {
                                    vscode.window.showTextDocument(a, 1, false);
                                });

                                vscode.workspace.updateWorkspaceFolders(0, undefined, {uri: vscode.Uri.file(dir), name: `SL Project: ${projectName}`});
                            }
                            else 
                            {
                                vscode.window.showErrorMessage('Project Error');
                            }

                        }
                        catch {
                            vscode.window.showErrorMessage("Error in project creating");
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
            fs.readFile(__dirname + "../../help/index.html", (err: Error, data: string) => 
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