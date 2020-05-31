"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const tmp_1 = tslib_1.__importDefault(require("tmp"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const path_1 = tslib_1.__importDefault(require("path"));
const sudo_prompt_1 = tslib_1.__importDefault(require("sudo-prompt"));
const constants_1 = require("./constants");
const debug = debug_1.default('devcert:util');
function openssl(cmd) {
    return run(`openssl ${cmd}`, {
        stdio: 'pipe',
        env: Object.assign({
            RANDFILE: path_1.default.join(constants_1.configPath('.rnd'))
        }, process.env)
    });
}
exports.openssl = openssl;
function run(cmd, options = {}) {
    debug(`exec: \`${cmd}\``);
    return child_process_1.execSync(cmd, options);
}
exports.run = run;
function waitForUser() {
    return new Promise((resolve) => {
        process.stdin.resume();
        process.stdin.on('data', resolve);
    });
}
exports.waitForUser = waitForUser;
function reportableError(message) {
    return new Error(`${message} | This is a bug in devcert, please report the issue at https://github.com/davewasmer/devcert/issues`);
}
exports.reportableError = reportableError;
function mktmp() {
    // discardDescriptor because windows complains the file is in use if we create a tmp file
    // and then shell out to a process that tries to use it
    return tmp_1.default.fileSync({ discardDescriptor: true }).name;
}
exports.mktmp = mktmp;
function sudo(cmd) {
    return new Promise((resolve, reject) => {
        sudo_prompt_1.default.exec(cmd, { name: 'devcert' }, (err, stdout, stderr) => {
            let error = err || (typeof stderr === 'string' && stderr.trim().length > 0 && new Error(stderr));
            error ? reject(error) : resolve(stdout);
        });
    });
}
exports.sudo = sudo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2RsYW5ub3llL3Byb2plY3RzL2RldmNlcnQvIiwic291cmNlcyI6WyJ1dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpREFBMEQ7QUFDMUQsc0RBQXNCO0FBQ3RCLDBEQUFnQztBQUNoQyx3REFBd0I7QUFDeEIsc0VBQXFDO0FBRXJDLDJDQUVxQjtBQUVyQixNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7QUFFMUMsaUJBQXdCLEdBQVc7SUFDakMsT0FBTyxHQUFHLENBQUMsV0FBWSxHQUFJLEVBQUUsRUFBRTtRQUM3QixLQUFLLEVBQUUsTUFBTTtRQUNiLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ2pCLFFBQVEsRUFBRSxjQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDeEMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDO0tBQ2hCLENBQUMsQ0FBQztBQUNMLENBQUM7QUFQRCwwQkFPQztBQUVELGFBQW9CLEdBQVcsRUFBRSxVQUEyQixFQUFFO0lBQzVELEtBQUssQ0FBQyxXQUFZLEdBQUksSUFBSSxDQUFDLENBQUM7SUFDNUIsT0FBTyx3QkFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBSEQsa0JBR0M7QUFFRDtJQUNFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM3QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFMRCxrQ0FLQztBQUVELHlCQUFnQyxPQUFlO0lBQzdDLE9BQU8sSUFBSSxLQUFLLENBQUMsR0FBRyxPQUFPLHNHQUFzRyxDQUFDLENBQUM7QUFDckksQ0FBQztBQUZELDBDQUVDO0FBRUQ7SUFDRSx5RkFBeUY7SUFDekYsdURBQXVEO0lBQ3ZELE9BQU8sYUFBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hELENBQUM7QUFKRCxzQkFJQztBQUVELGNBQXFCLEdBQVc7SUFDOUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxxQkFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFpQixFQUFFLE1BQXFCLEVBQUUsTUFBcUIsRUFBRSxFQUFFO1lBQzVHLElBQUksS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFFO1lBQ2xHLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFQRCxvQkFPQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGV4ZWNTeW5jLCBFeGVjU3luY09wdGlvbnMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB0bXAgZnJvbSAndG1wJztcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBzdWRvUHJvbXB0IGZyb20gJ3N1ZG8tcHJvbXB0JztcblxuaW1wb3J0IHtcbiAgY29uZmlnUGF0aCxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OnV0aWwnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9wZW5zc2woY21kOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHJ1bihgb3BlbnNzbCAkeyBjbWQgfWAsIHtcbiAgICBzdGRpbzogJ3BpcGUnLFxuICAgIGVudjogT2JqZWN0LmFzc2lnbih7XG4gICAgICBSQU5ERklMRTogcGF0aC5qb2luKGNvbmZpZ1BhdGgoJy5ybmQnKSlcbiAgICB9LCBwcm9jZXNzLmVudilcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydW4oY21kOiBzdHJpbmcsIG9wdGlvbnM6IEV4ZWNTeW5jT3B0aW9ucyA9IHt9KSB7XG4gIGRlYnVnKGBleGVjOiBcXGAkeyBjbWQgfVxcYGApO1xuICByZXR1cm4gZXhlY1N5bmMoY21kLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JVc2VyKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBwcm9jZXNzLnN0ZGluLnJlc3VtZSgpO1xuICAgIHByb2Nlc3Muc3RkaW4ub24oJ2RhdGEnLCByZXNvbHZlKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXBvcnRhYmxlRXJyb3IobWVzc2FnZTogc3RyaW5nKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gfCBUaGlzIGlzIGEgYnVnIGluIGRldmNlcnQsIHBsZWFzZSByZXBvcnQgdGhlIGlzc3VlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZld2FzbWVyL2RldmNlcnQvaXNzdWVzYCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBta3RtcCgpIHtcbiAgLy8gZGlzY2FyZERlc2NyaXB0b3IgYmVjYXVzZSB3aW5kb3dzIGNvbXBsYWlucyB0aGUgZmlsZSBpcyBpbiB1c2UgaWYgd2UgY3JlYXRlIGEgdG1wIGZpbGVcbiAgLy8gYW5kIHRoZW4gc2hlbGwgb3V0IHRvIGEgcHJvY2VzcyB0aGF0IHRyaWVzIHRvIHVzZSBpdFxuICByZXR1cm4gdG1wLmZpbGVTeW5jKHsgZGlzY2FyZERlc2NyaXB0b3I6IHRydWUgfSkubmFtZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN1ZG8oY21kOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBzdWRvUHJvbXB0LmV4ZWMoY21kLCB7IG5hbWU6ICdkZXZjZXJ0JyB9LCAoZXJyOiBFcnJvciB8IG51bGwsIHN0ZG91dDogc3RyaW5nIHwgbnVsbCwgc3RkZXJyOiBzdHJpbmcgfCBudWxsKSA9PiB7XG4gICAgICBsZXQgZXJyb3IgPSBlcnIgfHwgKHR5cGVvZiBzdGRlcnIgPT09ICdzdHJpbmcnICYmIHN0ZGVyci50cmltKCkubGVuZ3RoID4gMCAmJiBuZXcgRXJyb3Ioc3RkZXJyKSkgO1xuICAgICAgZXJyb3IgPyByZWplY3QoZXJyb3IpIDogcmVzb2x2ZShzdGRvdXQpO1xuICAgIH0pO1xuICB9KTtcbn1cbiJdfQ==