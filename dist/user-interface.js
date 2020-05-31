"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const password_prompt_1 = tslib_1.__importDefault(require("password-prompt"));
const DefaultUI = {
    getWindowsEncryptionPassword() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield password_prompt_1.default('devcert password (http://bit.ly/devcert-what-password?): ');
        });
    },
    warnChromeOnLinuxWithoutCertutil() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.warn(`
WARNING: It looks like you have Chrome installed, but you specified
'skipCertutilInstall: true'. Unfortunately, without installing
certutil, it's impossible get Chrome to trust devcert's certificates
The certificates will work, but Chrome will continue to warn you that
they are untrusted.
    `);
        });
    },
    closeFirefoxBeforeContinuing() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            console.log('Please close Firefox before continuing');
        });
    },
    warnFirefoxUnableToConfigure() {
        console.warn(`WARNING: If Firefox is installed installed, devcert
was unable to get Firefox to trust the generated certificate.`);
    }
};
exports.default = DefaultUI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1pbnRlcmZhY2UuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2RsYW5ub3llL3Byb2plY3RzL2RldmNlcnQvIiwic291cmNlcyI6WyJ1c2VyLWludGVyZmFjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4RUFBNkM7QUFTN0MsTUFBTSxTQUFTLEdBQWtCO0lBQ3pCLDRCQUE0Qjs7WUFDaEMsT0FBTyxNQUFNLHlCQUFjLENBQUMsMkRBQTJELENBQUMsQ0FBQztRQUMzRixDQUFDO0tBQUE7SUFDSyxnQ0FBZ0M7O1lBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Ozs7OztLQU1aLENBQUMsQ0FBQztRQUNMLENBQUM7S0FBQTtJQUNLLDRCQUE0Qjs7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ3hELENBQUM7S0FBQTtJQUNELDRCQUE0QjtRQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDOzhEQUM2QyxDQUFDLENBQUM7SUFDOUQsQ0FBQztDQUNGLENBQUE7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGFzc3dvcmRQcm9tcHQgZnJvbSAncGFzc3dvcmQtcHJvbXB0JztcblxuZXhwb3J0IGludGVyZmFjZSBVc2VySW50ZXJmYWNlIHtcbiAgZ2V0V2luZG93c0VuY3J5cHRpb25QYXNzd29yZCgpOiBQcm9taXNlPHN0cmluZz47XG4gIHdhcm5DaHJvbWVPbkxpbnV4V2l0aG91dENlcnR1dGlsKCk6IFByb21pc2U8dm9pZD47XG4gIGNsb3NlRmlyZWZveEJlZm9yZUNvbnRpbnVpbmcoKTogUHJvbWlzZTx2b2lkPjtcbiAgd2FybkZpcmVmb3hVbmFibGVUb0NvbmZpZ3VyZSgpOiB2b2lkO1xuICB9XG5cbmNvbnN0IERlZmF1bHRVSTogVXNlckludGVyZmFjZSA9IHtcbiAgYXN5bmMgZ2V0V2luZG93c0VuY3J5cHRpb25QYXNzd29yZCgpIHtcbiAgICByZXR1cm4gYXdhaXQgcGFzc3dvcmRQcm9tcHQoJ2RldmNlcnQgcGFzc3dvcmQgKGh0dHA6Ly9iaXQubHkvZGV2Y2VydC13aGF0LXBhc3N3b3JkPyk6ICcpO1xuICB9LFxuICBhc3luYyB3YXJuQ2hyb21lT25MaW51eFdpdGhvdXRDZXJ0dXRpbCgpIHtcbiAgICBjb25zb2xlLndhcm4oYFxuV0FSTklORzogSXQgbG9va3MgbGlrZSB5b3UgaGF2ZSBDaHJvbWUgaW5zdGFsbGVkLCBidXQgeW91IHNwZWNpZmllZFxuJ3NraXBDZXJ0dXRpbEluc3RhbGw6IHRydWUnLiBVbmZvcnR1bmF0ZWx5LCB3aXRob3V0IGluc3RhbGxpbmdcbmNlcnR1dGlsLCBpdCdzIGltcG9zc2libGUgZ2V0IENocm9tZSB0byB0cnVzdCBkZXZjZXJ0J3MgY2VydGlmaWNhdGVzXG5UaGUgY2VydGlmaWNhdGVzIHdpbGwgd29yaywgYnV0IENocm9tZSB3aWxsIGNvbnRpbnVlIHRvIHdhcm4geW91IHRoYXRcbnRoZXkgYXJlIHVudHJ1c3RlZC5cbiAgICBgKTtcbiAgfSxcbiAgYXN5bmMgY2xvc2VGaXJlZm94QmVmb3JlQ29udGludWluZygpIHtcbiAgICBjb25zb2xlLmxvZygnUGxlYXNlIGNsb3NlIEZpcmVmb3ggYmVmb3JlIGNvbnRpbnVpbmcnKTtcbiAgfSxcbiAgd2FybkZpcmVmb3hVbmFibGVUb0NvbmZpZ3VyZSgpIHtcbiAgICBjb25zb2xlLndhcm4oYFdBUk5JTkc6IElmIEZpcmVmb3ggaXMgaW5zdGFsbGVkIGluc3RhbGxlZCwgZGV2Y2VydFxud2FzIHVuYWJsZSB0byBnZXQgRmlyZWZveCB0byB0cnVzdCB0aGUgZ2VuZXJhdGVkIGNlcnRpZmljYXRlLmApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERlZmF1bHRVSTsiXX0=