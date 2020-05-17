'use strict';
import * as path from 'path';
import { getHelpFile, getTemplateFile, getHelpResourceImage, getSamplesWorkspacePath } from './utils/extPath';
import * as buildTask from './tasks/buildTask';

import * as fs from "fs-extra"
import * as vscode from 'vscode';
import { SlangLaunchTaskProvider } from './tasks/launchTask';
import { ConfigurationManager } from './utils/configManager'
import { checkCompilerVersion } from './utils/compilerDownloader';

export function activate(context: vscode.ExtensionContext) {
    
    checkCompilerVersion(context);

    const d = vscode.workspace.registerTaskProvider("slang", new buildTask.SlangBuildTaskProvider(context));
    context.subscriptions.push(d);

    context.subscriptions.push(vscode.workspace.registerTaskProvider("slang", new SlangLaunchTaskProvider(context)));

    vscode.workspace.onDidChangeWorkspaceFolders((e) => {ConfigurationManager.updateStatusBar()});
    ConfigurationManager.updateStatusBar();

    context.subscriptions.push(
        vscode.commands.registerCommand('ext.SetActive', async() => {
            vscode.window.showWorkspaceFolderPick().then((folder) => {
                if (folder != undefined)
                {
                    ConfigurationManager.setConfig(ConfigurationManager.activeProjectKey, folder.uri.fsPath);
                    vscode.window.showInformationMessage(`Active project changed = ${folder.uri.fsPath}`);
                }
            })
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

                            let launchFile : string = path.join(dir, ".vscode", "launch.json");
                            let sourcelaunch : string = getTemplateFile(context, "launch.json");

                            fs.copy(sourcelaunch, launchFile);
                            
                            if (!fs.existsSync(pfile)) 
                            {
                                vscode.window.showInformationMessage(`SL Project Created, Main file = ${pfile}`);
                                
                                vscode.workspace.openTextDocument(pfile).then((a: vscode.TextDocument) => {
                                    vscode.window.showTextDocument(a, 1, false);
                                });

                                vscode.workspace.updateWorkspaceFolders(0, undefined, {uri: vscode.Uri.file(dir), name: `SL Project: ${projectName}`});
                                ConfigurationManager.setConfig(ConfigurationManager.activeProjectKey, vscode.Uri.file(dir).fsPath);
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
        vscode.commands.registerCommand('ext.ShowSamples', () => {
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(getSamplesWorkspacePath(context)), true);
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
                        });
                    let strData = data.toString();
                    fs.readdirSync(path.join(context.extensionPath, "help", "img")).forEach((file) => {
                        var uri = vscode.Uri.file(getHelpResourceImage(context, file));
                        strData = strData.replace(`img/${file}`, panel.webview.asWebviewUri(uri).toString());
                    });
                    panel.webview.html = strData;
                }
            });
        })
    );
}

export function deactivate() {
}