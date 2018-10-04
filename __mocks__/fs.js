/*
* This program and the accompanying materials are made available under the terms of the *
* Eclipse Public License v2.0 which accompanies this distribution, and is available at *
* https://www.eclipse.org/legal/epl-v20.html                                      *
*                                                                                 *
* SPDX-License-Identifier: EPL-2.0                                                *
*                                                                                 *
* Copyright Contributors to the Zowe Project.                                     *
*                                                                                 *
*/

// __mocks__/fs.js
'use strict';

const path = require('path');

const fs = jest.genMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = Object.create(null);
function __setMockFiles(newMockFiles) {
    mockFiles = Object.create(null);
    for (const file in newMockFiles) {
        const dir = path.dirname(file);
        if (!mockFiles[dir]) {
            mockFiles[dir] = {};
        }
        mockFiles[dir][path.basename(file)] = newMockFiles[file];
    }
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdirSync(filePath) {
    return mockFiles[filePath] || {};
}

// A custom version of `existsSync` that reads from the special mocked out
// file list set via __setMockFiles
function existsSync(filePath) {
    const fileContents = readdirSync(path.dirname(filePath))[path.basename(filePath)];
    if (typeof fileContents === "undefined") {
        return false;
    }
    return true;
}

// A custom version of `readFileSync` that reads from the special mocked out
// file list set via __setMockFiles
function readFileSync(filePath) {
    if (!existsSync(filePath)) {
        throw new Error("File not found");
    }
    return readdirSync(path.dirname(filePath))[path.basename(filePath)];
}

// A custom version of `readFileSync` that reads from the special mocked out
// file list set via __setMockFiles
function lstatSync(filePath) {
    return {
        isFile: () => false
    }
}

fs.__setMockFiles = __setMockFiles;
fs.existsSync = existsSync;
fs.readFileSync = readFileSync;
fs.readdirSync = readdirSync;
fs.lstatSync = lstatSync;

module.exports = fs;
