import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import * as extPath from "../utils/extPath"
import { ConfigurationManager } from '../utils/configManager'

export class SlangBuildTaskProvider implements vscode.TaskProvider {

    private context: ExtensionContext;
    constructor (extContext: ExtensionContext)
    {
        this.context = extContext;
    }

    provideTasks(token?: vscode.CancellationToken | undefined): vscode.ProviderResult<vscode.Task[]> {
        return getBuildTask(this.context);
    }
    resolveTask(task: vscode.Task, token?: vscode.CancellationToken | undefined): vscode.ProviderResult<vscode.Task> {
        return undefined;
    }
}

function toStringQuotes(value: string)
{
    return `\"${value}\"`;
}

export function getBuildTask(context: ExtensionContext): vscode.Task[] | undefined
{
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
    {
        let pathToProject: unknown | undefined = ConfigurationManager.getConfig(ConfigurationManager.activeProjectKey);
        if (pathToProject == undefined)
        {
            vscode.window.showErrorMessage("Error, start project is not set");
            return [];
        }
        else if (typeof pathToProject == 'string')
        {
            let pathToCompiler = extPath.getCompilerPath(context);

            let args = [
                toStringQuotes(pathToCompiler),
                toStringQuotes(pathToProject),
                toStringQuotes(path.normalize(path.join(pathToProject, "gen"))),
                "cpp",
                toStringQuotes(path.normalize(path.join(pathToProject, "bin/program.out")))
            ];
    
            const cli = "dotnet";
            const exec = new vscode.ShellExecution(cli, args, {cwd: pathToProject});
    
            const definition : vscode.TaskDefinition = {
                type: "shell",
                label: "SL: Build"
            };
    
            const buildTask = new vscode.Task(definition, vscode.TaskScope.Workspace, "Build", "Slang", exec, "$slang");
            buildTask.group = vscode.TaskGroup.Build;
            buildTask.presentationOptions = {
                echo: false,
                focus: true,
                panel: vscode.TaskPanelKind.Dedicated,
                reveal: vscode.TaskRevealKind.Always
            };
                
            return [buildTask];
        }
    }
    else
    {
        vscode.window.showErrorMessage("There is no workspace folders");
    }
}