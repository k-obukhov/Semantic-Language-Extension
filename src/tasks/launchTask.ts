import * as path from "path";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";

export class SlangLaunchTaskProvider implements vscode.TaskProvider
{
    private context: ExtensionContext;
    constructor (extContext: ExtensionContext)
    {
        this.context = extContext;
    }

    provideTasks(token?: vscode.CancellationToken | undefined): vscode.ProviderResult<vscode.Task[]> {
        return getLaunchTask(this.context);
    }
    resolveTask(task: vscode.Task, token?: vscode.CancellationToken | undefined): vscode.ProviderResult<vscode.Task> {
        return undefined;
    }
}

function getLaunchTask(context: ExtensionContext): vscode.Task[] | undefined
{
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
    {
        let pathToProject: string | undefined = vscode.workspace.getConfiguration().get("slang.default_project");
        if (pathToProject == undefined)
        {
            vscode.window.showErrorMessage("Error, start project is not set");
            return [];
        }

        const cli = path.normalize(path.join(pathToProject, "bin/program.out"));
        const definition : vscode.TaskDefinition = {
            type: "shell",
            label: "SL: Launch"
        };
        const exec = new vscode.ShellExecution(cli, {cwd: pathToProject});
        const task = new vscode.Task(definition, vscode.TaskScope.Workspace, "Launch", "Slang", exec);
        task.group = vscode.TaskGroup.Test;
        task.presentationOptions = {
            echo: false,
            focus: true,
            panel: vscode.TaskPanelKind.Dedicated,
            reveal: vscode.TaskRevealKind.Always
        };
        return [task];
    }
    else
    {
        vscode.window.showErrorMessage("There is no workspace folders");
    }
}
