import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import * as extPath from "../utils/extPath"

export function initBuild(context: ExtensionContext)
{
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
    {
        // have many folders
        let pathToProject: string = "";
        if (vscode.workspace.workspaceFolders.length != 1)
        {
            let allItems: string[] = [];
            vscode.workspace.workspaceFolders.forEach((value, _index) => allItems.push(value.uri.fsPath));
            vscode.window.showQuickPick(allItems, {canPickMany: false}, undefined).then((value) => {
                if (value != undefined)
                {
                    pathToProject = value;
                }
                else
                {
                    return;
                }
            });
        }
        // have one
        else
        {
            pathToProject = vscode.workspace.workspaceFolders[0].uri.fsPath;
        }
        let pathToCompiler = extPath.getCompilerPath(context);

        let args = [
            pathToProject,
            path.join(pathToProject, "gen"),
            "cpp",
            path.join(pathToProject, "bin/program.out")
        ];

        const cli = path.normalize(pathToCompiler);
        const exec = new vscode.ShellExecution(cli, args, {cwd: pathToProject});

        const definition : vscode.TaskDefinition = {
            type: "shell",
            label: "SL: Build"
        };

        let folder = vscode.workspace.workspaceFolders.find((value, n_, obj_) => value.uri.fsPath == pathToProject);
        if (folder != undefined)
        {
            const buildTask = new vscode.Task(definition, folder, "Build", "Slang", exec, "$slang");
            buildTask.group = vscode.TaskGroup.Build;
            buildTask.presentationOptions = {
                echo: false,
                focus: true,
                panel: vscode.TaskPanelKind.Dedicated,
                reveal: vscode.TaskRevealKind.Always
            };

            const taskProvider: vscode.TaskProvider = {
                provideTasks: () => {
                    return [
                        buildTask
                    ];
                },
                resolveTask: () => {
                    return undefined;
                }
            };

            const d = vscode.workspace.registerTaskProvider("slang", taskProvider);
            context.subscriptions.push(d);
        }
    }
}