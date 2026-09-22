"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_ROLES = void 0;
exports.isUserRole = isUserRole;
exports.USER_ROLES = {
    ADMIN: "ADMIN",
    SUPERVISOR: "SUPERVISOR",
    REP: "REP",
};
function isUserRole(value) {
    return Object.values(exports.USER_ROLES).includes(value);
}
//# sourceMappingURL=roles.js.map