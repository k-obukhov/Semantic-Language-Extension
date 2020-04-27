import * as path from "path";
import { ExtensionContext } from "vscode";


export function getHelpFile(context: ExtensionContext, subPath: string)
{
    return path.join(context.extensionPath, "help", subPath);
}

export function getTemplateFile(context: ExtensionContext, subPath: string)
{
    return path.join(context.extensionPath, "templates", subPath);
}

export function getCompilerPath(context: ExtensionContext)
{
    return path.join(context.extensionPath, "bin", "SlangCompiler.dll");
}

export function getHelpResourceImage(context: ExtensionContext, subPath: string)
{
    return path.join(context.extensionPath, "help", "img", subPath);
}

export function getSamplesWorkspacePath(context: ExtensionContext)
{
    return path.join(context.extensionPath, "bin", "Samples", "samples-workspace.code-workspace");
}