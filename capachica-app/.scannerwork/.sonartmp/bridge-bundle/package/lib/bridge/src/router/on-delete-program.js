"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsts_1 = require("@sonar/jsts");
/**
 * Handles TypeScript Program deletion requests
 */
function default_1(request, response) {
    const { programId } = request.body;
    (0, jsts_1.deleteProgram)(programId);
    response.send('OK!');
}
exports.default = default_1;
//# sourceMappingURL=on-delete-program.js.map