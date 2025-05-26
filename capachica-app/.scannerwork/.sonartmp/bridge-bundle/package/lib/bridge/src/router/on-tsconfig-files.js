"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsts_1 = require("@sonar/jsts");
/**
 * Handles TSConfig files resolving requests
 *
 * TSConfig-based analysis either for JavaScript or TypeScript requires first
 * resolving the files to be analyzed based on provided TSConfigs. The logic
 * of the whole resolving lies in the bridge since it includes and bundles
 * TypeScript dependency, which is able to parse and analyze TSConfig files.
 */
function default_1(request, response, next) {
    try {
        const tsconfig = request.body.tsconfig;
        const options = (0, jsts_1.createProgramOptions)(tsconfig);
        response.json({
            files: options.rootNames,
            projectReferences: options.projectReferences
                ? options.projectReferences.map(ref => ref.path)
                : [],
        });
    }
    catch (error) {
        next(error);
    }
}
exports.default = default_1;
//# sourceMappingURL=on-tsconfig-files.js.map