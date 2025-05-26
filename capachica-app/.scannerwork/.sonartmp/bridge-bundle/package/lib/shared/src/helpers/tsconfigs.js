"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTSConfigs = void 0;
/*
 * SonarQube JavaScript Plugin
 * Copyright (C) 2011-2023 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const context_1 = require("./context");
const files_1 = require("./files");
class ProjectTSConfigs {
    constructor(dir, launchLookup) {
        var _a;
        if (dir === void 0) { dir = (_a = (0, context_1.getContext)()) === null || _a === void 0 ? void 0 : _a.workDir; }
        if (launchLookup === void 0) { launchLookup = true; }
        this.dir = dir;
        this.db = new Map();
        if (launchLookup) {
            this.tsConfigLookup();
        }
    }
    get(tsconfig) {
        return this.db.get(tsconfig);
    }
    /**
     * Iterate over saved tsConfig returning a fake tsconfig
     * as a fallback for the given file
     *
     * @param file the JS/TS file for which the tsconfig needs to be found
     */
    *iterateTSConfigs(file) {
        yield* [...this.db.values()].sort((tsconfig1, tsconfig2) => {
            const tsconfig = bestTSConfigForFile(file, tsconfig1, tsconfig2);
            if (tsconfig === undefined) {
                return 0;
            }
            return tsconfig === tsconfig1 ? -1 : 1;
        });
        yield {
            filename: `tsconfig-${file}.json`,
            contents: JSON.stringify({
                compilerOptions: {
                    allowJs: true,
                    noImplicitAny: true,
                },
                files: [file],
            }),
            isFallbackTSConfig: true,
        };
    }
    /**
     * Look for tsconfig files in a given path and its child paths.
     * node_modules is ignored
     *
     * @param dir parent folder where the search starts
     */
    tsConfigLookup(dir = this.dir) {
        if (!fs_1.default.existsSync(dir)) {
            console.log(`ERROR Could not access working directory ${dir}`);
            return;
        }
        const files = fs_1.default.readdirSync(dir);
        for (const file of files) {
            const filename = (0, files_1.toUnixPath)(path_1.default.join(dir, file));
            const stats = fs_1.default.lstatSync(filename);
            if (file !== 'node_modules' && stats.isDirectory()) {
                this.tsConfigLookup(filename);
            }
            else if (fileIsTSConfig(filename) && !stats.isDirectory()) {
                const contents = fs_1.default.readFileSync(filename, 'utf-8');
                this.db.set(filename, {
                    filename,
                    contents,
                });
            }
        }
    }
    /**
     * Check for any changes in the list of known tsconfigs
     *
     * @param force the check will be bypassed if we are not on SonarLint, unless force is `true`
     */
    reloadTsConfigs(force = false) {
        var _a;
        // No need to rescan if we are not on sonarlint, unless we force it
        if (!((_a = (0, context_1.getContext)()) === null || _a === void 0 ? void 0 : _a.sonarlint) && !force) {
            return false;
        }
        let changes = false;
        // check for changes in known tsconfigs
        for (const tsconfig of this.db.values()) {
            try {
                const contents = (0, files_1.readFileSync)(tsconfig.filename);
                if (tsconfig.contents !== contents) {
                    changes = true;
                }
                tsconfig.contents = contents;
            }
            catch (e) {
                this.db.delete(tsconfig.filename);
                console.log(`ERROR: tsconfig is no longer accessible ${tsconfig.filename}`);
            }
        }
        return changes;
    }
    /**
     * Check a list of tsconfig paths and add their contents
     * to the internal list of tsconfigs.
     *
     * @param tsconfigs list of new or changed TSConfigs
     * @param force force the update of tsconfigs if we are not on SonarLint
     * @return true if there are changes, thus cache may need to be invalidated
     */
    upsertTsConfigs(tsconfigs, force = false) {
        var _a;
        // No need to rescan if we are not on sonarlint, unless we force it
        if (!((_a = (0, context_1.getContext)()) === null || _a === void 0 ? void 0 : _a.sonarlint) && !force) {
            return false;
        }
        let changes = false;
        for (const tsconfig of tsconfigs) {
            const normalizedTsConfig = (0, files_1.toUnixPath)(tsconfig);
            if (!this.db.has(normalizedTsConfig)) {
                try {
                    const contents = (0, files_1.readFileSync)(normalizedTsConfig);
                    this.db.set(normalizedTsConfig, {
                        filename: normalizedTsConfig,
                        contents,
                    });
                    changes = true;
                }
                catch (e) {
                    console.log(`ERROR: Could not read tsconfig ${tsconfig}`);
                }
            }
        }
        return changes;
    }
}
exports.ProjectTSConfigs = ProjectTSConfigs;
function fileIsTSConfig(filename) {
    return !!filename.match(/[tj]sconfig.*\.json/i);
}
/**
 * Given a file and two TSConfig, chose the better choice mostly
 * based on its path compared with source file. On equal path conditions,
 * tsconfig.json name has preference
 *
 * @param file source file for which we need a tsconfig
 * @param tsconfig1 first TSConfig instance we want to compare
 * @param tsconfig2 second TSConfig instance we want to compare
 */
function bestTSConfigForFile(file, tsconfig1, tsconfig2) {
    const fileDirs = path_1.default.dirname(file).split('/');
    const tsconfig1Dirs = path_1.default.dirname(tsconfig1.filename).split('/');
    const tsconfig2Dirs = path_1.default.dirname(tsconfig2.filename).split('/');
    let relativeDepth1 = -fileDirs.length;
    let relativeDepth2 = -fileDirs.length;
    for (let i = 0; i < fileDirs.length; i++) {
        if (tsconfig1Dirs.length > i && fileDirs[i] === tsconfig1Dirs[i]) {
            relativeDepth1++;
        }
        if (tsconfig2Dirs.length > i && fileDirs[i] === tsconfig2Dirs[i]) {
            relativeDepth2++;
        }
    }
    if (relativeDepth1 === 0 && tsconfig1Dirs.length > fileDirs.length) {
        relativeDepth1 = tsconfig1Dirs.length - fileDirs.length;
    }
    if (relativeDepth2 === 0 && tsconfig2Dirs.length > fileDirs.length) {
        relativeDepth2 = tsconfig2Dirs.length - fileDirs.length;
    }
    if (relativeDepth1 === relativeDepth2) {
        if (tsconfig1Dirs.length > tsconfig2Dirs.length) {
            return tsconfig2;
        }
        else if (tsconfig1Dirs.length < tsconfig2Dirs.length) {
            return tsconfig1;
        }
        if (path_1.default.basename(tsconfig1.filename).toLowerCase() === 'tsconfig.json') {
            return tsconfig1;
        }
        else if (path_1.default.basename(tsconfig2.filename).toLowerCase() === 'tsconfig.json') {
            return tsconfig2;
        }
    }
    else if (relativeDepth1 > relativeDepth2) {
        return relativeDepth1 <= 0 ? tsconfig1 : tsconfig2;
    }
    else {
        return relativeDepth2 <= 0 ? tsconfig2 : tsconfig1;
    }
}
//# sourceMappingURL=tsconfigs.js.map