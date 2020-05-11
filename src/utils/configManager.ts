import * as vscode from 'vscode'
import * as fs from 'fs-extra'

export class ConfigurationManager
{
    public static readonly activeProjectKey = "slang.default_project";
    
    public static setConfig(key: string, value: any): void {
        vscode.workspace.getConfiguration().update(key, value, vscode.ConfigurationTarget.Workspace).then(() => 
        {
            if (key == this.activeProjectKey)
            {
                this.updateStatusBarWithValue(value);
            }
        });
    }

    public static getConfig(key: string): unknown 
    {
        return vscode.workspace.getConfiguration().get(key);
    }

    public static updateStatusBarWithValue(value: unknown)
    {
        if (typeof(value) == 'string' && value != null)
        {
            if (fs.existsSync(value))
            {
                vscode.window.setStatusBarMessage(`Active project — ${value}`);
            }
            else
            {
                vscode.window.setStatusBarMessage(`Active project set but does not exists`);
            }
        }
        else
        {
            vscode.window.setStatusBarMessage("Active project was not set");
        }
    }

    public static updateStatusBar() {
        let folder = this.getConfig(this.activeProjectKey);
        this.updateStatusBarWithValue(folder);
    }
}