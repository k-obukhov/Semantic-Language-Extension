'use strict';
import * as path from 'path';

import * as fs from "fs-extra";
import * as vscode from 'vscode';
import { getHelpFile, getTempDownloadsFolder, getTempDownloadsPath, getCompilerFolder } from './extPath';
import fetch from "node-fetch"
import * as crypto from "crypto"
import * as semver from "semver"
import AdmZip = require('adm-zip');
import * as ncp from "ncp"

const VersionFileName: string = "version.txt";
const ReleasesAPIString : string = "https://api.github.com/repos/NothingIsGood/SlangCompilier/releases";
const CurrentMajor = 1;
const SlangFile = "slang.zip";
const SlangChecksum = "checksum.txt";
const NetCoreSDKVersion = "netcoreapp3.1"

function getExtractedZipFolder(context: vscode.ExtensionContext)
{
    return path.join(getTempDownloadsFolder(context), "home", "runner", "work", "SlangCompilier", "SlangCompilier", "SlangCompilier", "bin", "Release", NetCoreSDKVersion);
}

function api<T>(path: string): Promise<T>
{
    return fetch(path).then(async response => 
    {
        if (!response.ok) 
        {
            throw new Error(response.statusText);
        }
        return response.json() as Promise<T>;
    })
    .then(data => data)
    .catch((error: Error) => 
    {
        vscode.window.showErrorMessage(error.message);
        throw error;
    });
}

export function checkCompilerVersion(context: vscode.ExtensionContext)
{
    const pathToVersionFile = getHelpFile(context, VersionFileName);
    let compilerVersion : string | undefined;
    if (fs.existsSync(path.normalize(pathToVersionFile)))
    {
        compilerVersion = fs.readFileSync(pathToVersionFile).toString();
    }

    try
    {
        api<{id: Number, tag_name: string}[]>(ReleasesAPIString).then(data => 
        {
            let bestVersion: semver.SemVer | undefined;
            let index: number = 0;
            for (let i = 0; i < data.length; ++i)
            {
                let version = semver.parse(data[i].tag_name);
                if (version != null)
                {
                    
                    if (version.major == CurrentMajor)
                    {
                        if (bestVersion == undefined)
                        {
                            bestVersion = version;
                            index = i;
                        }
                        else if (version > bestVersion && (version.major == bestVersion.major))
                        {
                            bestVersion = version;
                            index = i;
                        }
                    }
                }
            }
            if (bestVersion == undefined)
            {
                throw new Error("Cannot find major version of compiler")
            }
            else
            {
                if ((compilerVersion == undefined) || (bestVersion > new semver.SemVer(compilerVersion)))
                {
                    vscode.window.showInformationMessage(`Found actual version of SLang compiler - ${bestVersion}\nStart download...`);
                    downloadCompiler(data[index], context);
                }
                else
                {
                    vscode.window.showInformationMessage(`You are using latest stable version of SLang compiler: ${compilerVersion}`);
                }
            }
        });
    }
    catch (e)
    {
        vscode.window.showErrorMessage(`Error: ${e}`);
    }
}

function downloadCompiler(item: {id: Number, tag_name: string}, context: vscode.ExtensionContext)
{
    api<{assets: {name: string, browser_download_url: string}[]}>(`${ReleasesAPIString}/${item.id}`).then(async data => {
        let assetSlang = data.assets.find(i => i.name == SlangFile);
        let assetCheckSum = data.assets.find(i => i.name == SlangChecksum);
        if (assetSlang == undefined || assetCheckSum == undefined)
        {
            throw new Error("Cannot find compiler or checksum files");
        }

        initTmpFolder(context);
        const pathToArchive = getTempDownloadsPath(context, SlangFile);
        const pathToCheckSum = getTempDownloadsPath(context, SlangChecksum);
        
        downloadFile(assetSlang.browser_download_url, pathToArchive);
        downloadFile(assetCheckSum.browser_download_url, pathToCheckSum);

        const checkSumText = readCheckSum(pathToCheckSum);
        const checkSumGen = await generateCheckSum(pathToArchive);

        if (checkSumText == checkSumGen)
        {
            vscode.window.showInformationMessage("Downloaded, checksum is valid");
            unzipFile(pathToArchive, getTempDownloadsFolder(context));
            if (!fs.existsSync(getCompilerFolder(context)))
            {
                fs.mkdirSync(getCompilerFolder(context));
            }
            ncp.ncp(getExtractedZipFolder(context), getCompilerFolder(context), (err) => 
            {
                if (err)
                {
                    vscode.window.showErrorMessage(`Error in files extracing: ${err[0].message}`);
                    throw err;
                }
                fs.writeFileSync(getHelpFile(context, VersionFileName), item.tag_name);
                vscode.window.showInformationMessage(`You're using actual compiler version: ${item.tag_name}`);
            });
        }
        else
        {
            let e = new Error("Invalid check sum of file");
            vscode.window.showErrorMessage(e.message);
            throw e;
        }
    });
}

function initTmpFolder(context: vscode.ExtensionContext)
{
    let folder = getTempDownloadsFolder(context);
    if (!fs.existsSync(folder))
    {
        fs.mkdirSync(folder);
    }
}

async function downloadFile(url: string, savePath: string)
{
    const res = await fetch(url);
    await new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(savePath);
        res.body.pipe(stream);
        res.body.on("error", (err) => { reject(err); });
        stream.on("finish", () => { resolve(); });
    });
}

function readCheckSum(path: string)
{
    return fs.readFileSync(path).toString().split(' ')[0];
}

async function generateCheckSum(path: string): Promise<string | undefined>
{
    return new Promise((resolve, reject) => {
        let shasum = crypto.createHash('sha512');
        try {
            let s = fs.createReadStream(path);
            s.on('data', (data) => {shasum.update(data)});
            s.on('end', () => { return resolve(shasum.digest('hex')) });
        }
        catch (err)
        {
            return reject();
        }
    });
}

function unzipFile(pathToZip: string, pathToFolder: string)
{
    const zip = new AdmZip(pathToZip);
    zip.extractAllTo(pathToFolder, true);
}