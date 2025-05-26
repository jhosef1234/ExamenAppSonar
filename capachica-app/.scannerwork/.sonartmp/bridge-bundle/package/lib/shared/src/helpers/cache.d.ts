import { LRU } from './lru';
import ts from 'typescript';
import { TSConfig } from './tsconfigs';
export type ProgramResult = {
    tsConfig: TSConfig;
    files: string[];
    projectReferences: string[];
    missingTsConfig: boolean;
    program: WeakRef<ts.Program>;
    isFallbackProgram?: boolean;
};
/**
 * A cache of created TypeScript's Program instances
 *
 * @param programs It associates a program identifier (usually a tsconfig) to an instance of a TypeScript's Program.
 * @param lru Cache to keep strong references to the latest used Programs to avoid GC
 */
export declare class ProgramCache {
    programs: Map<string, ProgramResult>;
    lru: LRU<ts.Program>;
    constructor(max?: number);
    clear(): void;
}
