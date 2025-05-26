export interface TSConfig {
    filename: string;
    contents: string;
    isFallbackTSConfig?: boolean;
}
export declare class ProjectTSConfigs {
    private readonly dir;
    db: Map<string, TSConfig>;
    constructor(dir?: string, launchLookup?: boolean);
    get(tsconfig: string): TSConfig | undefined;
    /**
     * Iterate over saved tsConfig returning a fake tsconfig
     * as a fallback for the given file
     *
     * @param file the JS/TS file for which the tsconfig needs to be found
     */
    iterateTSConfigs(file: string): Generator<TSConfig, void, undefined>;
    /**
     * Look for tsconfig files in a given path and its child paths.
     * node_modules is ignored
     *
     * @param dir parent folder where the search starts
     */
    tsConfigLookup(dir?: string): void;
    /**
     * Check for any changes in the list of known tsconfigs
     *
     * @param force the check will be bypassed if we are not on SonarLint, unless force is `true`
     */
    reloadTsConfigs(force?: boolean): boolean;
    /**
     * Check a list of tsconfig paths and add their contents
     * to the internal list of tsconfigs.
     *
     * @param tsconfigs list of new or changed TSConfigs
     * @param force force the update of tsconfigs if we are not on SonarLint
     * @return true if there are changes, thus cache may need to be invalidated
     */
    upsertTsConfigs(tsconfigs: string[], force?: boolean): boolean;
}
