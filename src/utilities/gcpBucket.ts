/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';
import axios from 'axios';

// https://storage.googleapis.com/aide-binary/run

async function ensureDirectoryExists(filePath: string): Promise<void> {
	const parentDir = path.dirname(filePath);

	if (fs.existsSync(parentDir)) {
		// The parent directory already exists, so we don't need to create it
		return;
	}

	// Recursively create the parent directory
	await ensureDirectoryExists(parentDir);

	// Create the directory
	fs.mkdirSync(parentDir);
}

export const downloadFromGCPBucket = async (bucketName: string, srcFilename: string, destFilename: string) => {
	const storage = new Storage();

	const options = {
		// Specify the source file
		source: srcFilename,

		// Specify the destination file
		destination: destFilename,
	};

	await ensureDirectoryExists(destFilename);

	// Download the file
	await storage.bucket(bucketName).file(srcFilename).download(options);
};


export const downloadUsingURL = async (bucketName: string, srcFileName: string, destFileName: string) => {
	const url = `https://storage.googleapis.com/${bucketName}/${srcFileName}`;
	const response = await axios.get(url, { responseType: 'stream' });
	const writer = fs.createWriteStream(destFileName);

	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
};

// const bucketName = 'your-bucket-name';
// const srcFilename = 'path/in/bucket/filename.ext';
// const destFilename = 'local/path/filename.ext';


// void (async () => {
// 	const bucketName = 'aide-binary';
// 	const srcFilename = 'run';
// 	await downloadUsingURL(
// 		bucketName,
// 		srcFilename,
// 		'/Users/skcd/Desktop/run',
// 	);
// })();
