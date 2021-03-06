// tslint:disable:non-literal-fs-path
// tslint:disable:no-any
// tslint:disable:no-console

import * as extract from "extract-zip";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import axios from "axios";

import { checkFileExists } from "../src/common/functions";
import { getLatestAsset, GitAsset } from "../src/common/gitReleases";

const WINDOWS_SWAPPERD_FILE = "swapper_windows_amd64.zip";

interface AfterPackContext {
    outDir: string;
    appOutDir: string;
    packager: any;
    electronPlatformName: string;
    arch: any;
    targets: any;
}

async function downloadFile(url: string, outputFile: string) {
    console.log(`Downloading ${url} to ${outputFile}`);
    const outPath = path.resolve(outputFile);
    const writer = fs.createWriteStream(outPath);

    const response = await axios({
        url,
        method: "GET",
        responseType: "stream"
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on("finish", () => {
            console.log("Finished downloading.");
            resolve();
        });
        writer.on("error", reject);
    });
}

async function extractZip(zipFile: string, outputDir: string) {
    console.log(`Extracting ${zipFile} to ${outputDir}`);
    return new Promise((resolve, reject) => {
        extract(zipFile, {
            dir: outputDir
        }, (error) => {
            if (error) {
                reject(error);
            }
            console.log(`Finished extracting.`);
            resolve();
        });
    });
}

/**
 * Ensures a Git asset exists, either in the local working directory or the temp directory
 * for downloads. The file is downloaded to the temp directory if it doesn't already exist.
 *
 * @param asset The asset object retrieved from the Git Releases API
 */
async function checkFile(asset: GitAsset): Promise<string> {
    const ext = `.${asset.name.split(".").pop()}`;
    const baseFileName = path.basename(asset.name, ext);
    const localFilePath = path.resolve(path.join(".", asset.name));
    const tempFilePath = path.resolve(path.join(os.tmpdir(), `${baseFileName}_${asset.id}_${asset.node_id}${ext}`));

    // Check if the file exists in the working directory
    if (await checkFileExists(localFilePath)) {
        console.log(`Found ${asset.name} in ${path.resolve(".")}`);
        return localFilePath;
    } else if (await checkFileExists(tempFilePath)) {
        // We've downloaded this file before
        console.log(`Found ${asset.name} in ${os.tmpdir()}`);
    } else {
        await downloadFile(asset.browser_download_url, tempFilePath);
    }
    return tempFilePath;
}

// tslint:disable-next-line:no-default-export
export default async function (context: AfterPackContext) {
    const platform = context.packager.platform.nodeName;
    if (platform === "win32") {
        try {
            const asset: GitAsset = await getLatestAsset(WINDOWS_SWAPPERD_FILE);
            const file = await checkFile(asset);
            await extractZip(file, context.appOutDir);
        } catch (error) {
            console.error(error);
            return;
        }
    }
}

// tslint:enable:no-console
// tslint:enable:no-any
// tslint:enable:non-literal-fs-path
