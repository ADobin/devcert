"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const assert_1 = tslib_1.__importDefault(require("assert"));
const glob_1 = require("glob");
const fs_1 = require("fs");
const utils_1 = require("../utils");
const constants_1 = require("../constants");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const child_process_1 = require("child_process");
const debug = debug_1.default('devcert:platforms:shared');
/**
 *  Given a directory or glob pattern of directories, attempt to install the
 *  CA certificate to each directory containing an NSS database.
 */
function addCertificateToNSSCertDB(nssDirGlob, certPath, certutilPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`trying to install certificate into NSS databases in ${nssDirGlob}`);
        glob_1.sync(nssDirGlob).forEach((potentialNSSDBDir) => {
            debug(`checking to see if ${potentialNSSDBDir} is a valid NSS database directory`);
            if (fs_1.existsSync(path_1.default.join(potentialNSSDBDir, 'cert8.db'))) {
                debug(`Found legacy NSS database in ${potentialNSSDBDir}, adding certificate ...`);
                utils_1.run(`${certutilPath} -A -d "${potentialNSSDBDir}" -t 'C,,' -i ${certPath} -n devcert`);
            }
            if (fs_1.existsSync(path_1.default.join(potentialNSSDBDir, 'cert9.db'))) {
                debug(`Found modern NSS database in ${potentialNSSDBDir}, adding certificate ...`);
                utils_1.run(`${certutilPath} -A -d "sql:${potentialNSSDBDir}" -t 'C,,' -i ${certPath} -n devcert`);
            }
        });
        debug(`finished scanning & installing certificate in NSS databases in ${nssDirGlob}`);
    });
}
exports.addCertificateToNSSCertDB = addCertificateToNSSCertDB;
/**
 *  Check to see if Firefox is still running, and if so, ask the user to close
 *  it. Poll until it's closed, then return.
 *
 * This is needed because Firefox appears to load the NSS database in-memory on
 * startup, and overwrite on exit. So we have to ask the user to quite Firefox
 * first so our changes don't get overwritten.
 */
function closeFirefox() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (isFirefoxOpen()) {
            yield user_interface_1.default.closeFirefoxBeforeContinuing();
            while (isFirefoxOpen()) {
                yield sleep(50);
            }
        }
    });
}
exports.closeFirefox = closeFirefox;
/**
 * Check if Firefox is currently open
 */
function isFirefoxOpen() {
    // NOTE: We use some Windows-unfriendly methods here (ps) because Windows
    // never needs to check this, because it doesn't update the NSS DB
    // automaticaly.
    assert_1.default(constants_1.isMac || constants_1.isLinux, 'checkForOpenFirefox was invoked on a platform other than Mac or Linux');
    return child_process_1.execSync('ps aux').indexOf('firefox') > -1;
}
function sleep(ms) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, ms));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9kbGFubm95ZS9wcm9qZWN0cy9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL3NoYXJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBd0I7QUFDeEIsMERBQWdDO0FBQ2hDLDREQUE0QjtBQUM1QiwrQkFBb0M7QUFDcEMsMkJBQTBDO0FBQzFDLG9DQUErQjtBQUMvQiw0Q0FBOEM7QUFDOUMsK0VBQW1DO0FBQ25DLGlEQUFpRDtBQUVqRCxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUV0RDs7O0dBR0c7QUFDSCxtQ0FBZ0QsVUFBa0IsRUFBRSxRQUFnQixFQUFFLFlBQW9COztRQUN4RyxLQUFLLENBQUMsdURBQXdELFVBQVcsRUFBRSxDQUFDLENBQUM7UUFDN0UsV0FBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDN0MsS0FBSyxDQUFDLHNCQUF1QixpQkFBa0Isb0NBQW9DLENBQUMsQ0FBQztZQUNyRixJQUFJLGVBQU0sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELEtBQUssQ0FBQyxnQ0FBaUMsaUJBQWtCLDBCQUEwQixDQUFDLENBQUE7Z0JBQ3BGLFdBQUcsQ0FBQyxHQUFJLFlBQWEsV0FBWSxpQkFBa0IsaUJBQWtCLFFBQVMsYUFBYSxDQUFDLENBQUM7YUFDOUY7WUFDRCxJQUFJLGVBQU0sQ0FBQyxjQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3BELEtBQUssQ0FBQyxnQ0FBaUMsaUJBQWtCLDBCQUEwQixDQUFDLENBQUE7Z0JBQ3BGLFdBQUcsQ0FBQyxHQUFJLFlBQWEsZUFBZ0IsaUJBQWtCLGlCQUFrQixRQUFTLGFBQWEsQ0FBQyxDQUFDO2FBQ2xHO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsa0VBQW1FLFVBQVcsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztDQUFBO0FBZEQsOERBY0M7QUFFRDs7Ozs7OztHQU9HO0FBQ0g7O1FBQ0UsSUFBSSxhQUFhLEVBQUUsRUFBRTtZQUNuQixNQUFNLHdCQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztZQUN4QyxPQUFNLGFBQWEsRUFBRSxFQUFFO2dCQUNyQixNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNqQjtTQUNGO0lBQ0gsQ0FBQztDQUFBO0FBUEQsb0NBT0M7QUFFRDs7R0FFRztBQUNIO0lBQ0UseUVBQXlFO0lBQ3pFLGtFQUFrRTtJQUNsRSxnQkFBZ0I7SUFDaEIsZ0JBQU0sQ0FBQyxpQkFBSyxJQUFJLG1CQUFPLEVBQUUsdUVBQXVFLENBQUMsQ0FBQztJQUNsRyxPQUFPLHdCQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCxlQUFxQixFQUFVOztRQUM3QixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgc3luYyBhcyBnbG9iIH0gZnJvbSAnZ2xvYic7XG5pbXBvcnQgeyBleGlzdHNTeW5jIGFzIGV4aXN0cyB9IGZyb20gJ2ZzJztcbmltcG9ydCB7IHJ1biB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7IGlzTWFjLCBpc0xpbnV4IH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCBVSSBmcm9tICcuLi91c2VyLWludGVyZmFjZSc7XG5pbXBvcnQgeyBleGVjU3luYyBhcyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6cGxhdGZvcm1zOnNoYXJlZCcpO1xuXG4vKipcbiAqICBHaXZlbiBhIGRpcmVjdG9yeSBvciBnbG9iIHBhdHRlcm4gb2YgZGlyZWN0b3JpZXMsIGF0dGVtcHQgdG8gaW5zdGFsbCB0aGVcbiAqICBDQSBjZXJ0aWZpY2F0ZSB0byBlYWNoIGRpcmVjdG9yeSBjb250YWluaW5nIGFuIE5TUyBkYXRhYmFzZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZENlcnRpZmljYXRlVG9OU1NDZXJ0REIobnNzRGlyR2xvYjogc3RyaW5nLCBjZXJ0UGF0aDogc3RyaW5nLCBjZXJ0dXRpbFBhdGg6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBkZWJ1ZyhgdHJ5aW5nIHRvIGluc3RhbGwgY2VydGlmaWNhdGUgaW50byBOU1MgZGF0YWJhc2VzIGluICR7IG5zc0Rpckdsb2IgfWApO1xuICBnbG9iKG5zc0Rpckdsb2IpLmZvckVhY2goKHBvdGVudGlhbE5TU0RCRGlyKSA9PiB7XG4gICAgZGVidWcoYGNoZWNraW5nIHRvIHNlZSBpZiAkeyBwb3RlbnRpYWxOU1NEQkRpciB9IGlzIGEgdmFsaWQgTlNTIGRhdGFiYXNlIGRpcmVjdG9yeWApO1xuICAgIGlmIChleGlzdHMocGF0aC5qb2luKHBvdGVudGlhbE5TU0RCRGlyLCAnY2VydDguZGInKSkpIHtcbiAgICAgIGRlYnVnKGBGb3VuZCBsZWdhY3kgTlNTIGRhdGFiYXNlIGluICR7IHBvdGVudGlhbE5TU0RCRGlyIH0sIGFkZGluZyBjZXJ0aWZpY2F0ZSAuLi5gKVxuICAgICAgcnVuKGAkeyBjZXJ0dXRpbFBhdGggfSAtQSAtZCBcIiR7IHBvdGVudGlhbE5TU0RCRGlyIH1cIiAtdCAnQywsJyAtaSAkeyBjZXJ0UGF0aCB9IC1uIGRldmNlcnRgKTtcbiAgICB9XG4gICAgaWYgKGV4aXN0cyhwYXRoLmpvaW4ocG90ZW50aWFsTlNTREJEaXIsICdjZXJ0OS5kYicpKSkge1xuICAgICAgZGVidWcoYEZvdW5kIG1vZGVybiBOU1MgZGF0YWJhc2UgaW4gJHsgcG90ZW50aWFsTlNTREJEaXIgfSwgYWRkaW5nIGNlcnRpZmljYXRlIC4uLmApXG4gICAgICBydW4oYCR7IGNlcnR1dGlsUGF0aCB9IC1BIC1kIFwic3FsOiR7IHBvdGVudGlhbE5TU0RCRGlyIH1cIiAtdCAnQywsJyAtaSAkeyBjZXJ0UGF0aCB9IC1uIGRldmNlcnRgKTtcbiAgICB9XG4gIH0pO1xuICBkZWJ1ZyhgZmluaXNoZWQgc2Nhbm5pbmcgJiBpbnN0YWxsaW5nIGNlcnRpZmljYXRlIGluIE5TUyBkYXRhYmFzZXMgaW4gJHsgbnNzRGlyR2xvYiB9YCk7XG59XG5cbi8qKlxuICogIENoZWNrIHRvIHNlZSBpZiBGaXJlZm94IGlzIHN0aWxsIHJ1bm5pbmcsIGFuZCBpZiBzbywgYXNrIHRoZSB1c2VyIHRvIGNsb3NlXG4gKiAgaXQuIFBvbGwgdW50aWwgaXQncyBjbG9zZWQsIHRoZW4gcmV0dXJuLlxuICpcbiAqIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgRmlyZWZveCBhcHBlYXJzIHRvIGxvYWQgdGhlIE5TUyBkYXRhYmFzZSBpbi1tZW1vcnkgb25cbiAqIHN0YXJ0dXAsIGFuZCBvdmVyd3JpdGUgb24gZXhpdC4gU28gd2UgaGF2ZSB0byBhc2sgdGhlIHVzZXIgdG8gcXVpdGUgRmlyZWZveFxuICogZmlyc3Qgc28gb3VyIGNoYW5nZXMgZG9uJ3QgZ2V0IG92ZXJ3cml0dGVuLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VGaXJlZm94KCk6IFByb21pc2U8dm9pZD4ge1xuICBpZiAoaXNGaXJlZm94T3BlbigpKSB7XG4gICAgYXdhaXQgVUkuY2xvc2VGaXJlZm94QmVmb3JlQ29udGludWluZygpO1xuICAgIHdoaWxlKGlzRmlyZWZveE9wZW4oKSkge1xuICAgICAgYXdhaXQgc2xlZXAoNTApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIGlmIEZpcmVmb3ggaXMgY3VycmVudGx5IG9wZW5cbiAqL1xuZnVuY3Rpb24gaXNGaXJlZm94T3BlbigpIHtcbiAgLy8gTk9URTogV2UgdXNlIHNvbWUgV2luZG93cy11bmZyaWVuZGx5IG1ldGhvZHMgaGVyZSAocHMpIGJlY2F1c2UgV2luZG93c1xuICAvLyBuZXZlciBuZWVkcyB0byBjaGVjayB0aGlzLCBiZWNhdXNlIGl0IGRvZXNuJ3QgdXBkYXRlIHRoZSBOU1MgREJcbiAgLy8gYXV0b21hdGljYWx5LlxuICBhc3NlcnQoaXNNYWMgfHwgaXNMaW51eCwgJ2NoZWNrRm9yT3BlbkZpcmVmb3ggd2FzIGludm9rZWQgb24gYSBwbGF0Zm9ybSBvdGhlciB0aGFuIE1hYyBvciBMaW51eCcpO1xuICByZXR1cm4gZXhlYygncHMgYXV4JykuaW5kZXhPZignZmlyZWZveCcpID4gLTE7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG59XG4iXX0=