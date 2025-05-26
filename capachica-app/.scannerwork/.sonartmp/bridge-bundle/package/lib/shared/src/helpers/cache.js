"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramCache = void 0;
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
const lru_1 = require("./lru");
/**
 * A cache of created TypeScript's Program instances
 *
 * @param programs It associates a program identifier (usually a tsconfig) to an instance of a TypeScript's Program.
 * @param lru Cache to keep strong references to the latest used Programs to avoid GC
 */
class ProgramCache {
    constructor(max = 2) {
        this.programs = new Map();
        this.lru = new lru_1.LRU(max);
    }
    clear() {
        this.programs.clear();
        this.lru.clear();
    }
}
exports.ProgramCache = ProgramCache;
//# sourceMappingURL=cache.js.map