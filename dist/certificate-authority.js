"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const rimraf_1 = require("rimraf");
const debug_1 = tslib_1.__importDefault(require("debug"));
const constants_1 = require("./constants");
const platforms_1 = tslib_1.__importDefault(require("./platforms"));
const utils_1 = require("./utils");
const certificates_1 = require("./certificates");
const debug = debug_1.default('devcert:certificate-authority');
/**
 * Install the once-per-machine trusted root CA. We'll use this CA to sign
 * per-app certs.
 */
function installCertificateAuthority(options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Checking if older devcert install is present`);
        scrubOldInsecureVersions();
        debug(`Generating a root certificate authority`);
        let rootKeyPath = utils_1.mktmp();
        let rootCertPath = utils_1.mktmp();
        debug(`Generating the OpenSSL configuration needed to setup the certificate authority`);
        seedConfigFiles();
        debug(`Generating a private key`);
        certificates_1.generateKey(rootKeyPath);
        debug(`Generating a CA certificate`);
        utils_1.openssl(`req -new -x509 -config "${constants_1.caSelfSignConfig}" -key "${rootKeyPath}" -out "${rootCertPath}" -days 7000`);
        debug('Saving certificate authority credentials');
        yield saveCertificateAuthorityCredentials(rootKeyPath, rootCertPath);
        debug(`Adding the root certificate authority to trust stores`);
        yield platforms_1.default.addToTrustStores(rootCertPath, options);
    });
}
exports.default = installCertificateAuthority;
/**
 * Older versions of devcert left the root certificate keys unguarded and
 * accessible by userland processes. Here, we check for evidence of this older
 * version, and if found, we delete the root certificate keys to remove the
 * attack vector.
 */
function scrubOldInsecureVersions() {
    // Use the old verion's logic for determining config directory
    let configDir;
    if (constants_1.isWindows && process.env.LOCALAPPDATA) {
        configDir = path_1.default.join(process.env.LOCALAPPDATA, 'devcert', 'config');
    }
    else {
        let uid = process.getuid && process.getuid();
        let userHome = (constants_1.isLinux && uid === 0) ? path_1.default.resolve('/usr/local/share') : require('os').homedir();
        configDir = path_1.default.join(userHome, '.config', 'devcert');
    }
    // Delete the root certificate keys, as well as the generated app certificates
    debug(`Checking ${configDir} for legacy files ...`);
    [
        path_1.default.join(configDir, 'openssl.conf'),
        path_1.default.join(configDir, 'devcert-ca-root.key'),
        path_1.default.join(configDir, 'devcert-ca-root.crt'),
        path_1.default.join(configDir, 'devcert-ca-version'),
        path_1.default.join(configDir, 'certs')
    ].forEach((filepath) => {
        if (fs_1.existsSync(filepath)) {
            debug(`Removing legacy file: ${filepath}`);
            rimraf_1.sync(filepath);
        }
    });
}
/**
 * Initializes the files OpenSSL needs to sign certificates as a certificate
 * authority, as well as our CA setup version
 */
function seedConfigFiles() {
    // This is v2 of the devcert certificate authority setup
    fs_1.writeFileSync(constants_1.caVersionFile, '2');
    // OpenSSL CA files
    fs_1.writeFileSync(constants_1.opensslDatabaseFilePath, '');
    fs_1.writeFileSync(constants_1.opensslSerialFilePath, '01');
}
function withCertificateAuthorityCredentials(cb) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Retrieving devcert's certificate authority credentials`);
        let tmpCAKeyPath = utils_1.mktmp();
        let tmpCACertPath = utils_1.mktmp();
        let caKey = yield platforms_1.default.readProtectedFile(constants_1.rootCAKeyPath);
        let caCert = yield platforms_1.default.readProtectedFile(constants_1.rootCACertPath);
        fs_1.writeFileSync(tmpCAKeyPath, caKey);
        fs_1.writeFileSync(tmpCACertPath, caCert);
        yield cb({ caKeyPath: tmpCAKeyPath, caCertPath: tmpCACertPath });
        fs_1.unlinkSync(tmpCAKeyPath);
        fs_1.unlinkSync(tmpCACertPath);
    });
}
exports.withCertificateAuthorityCredentials = withCertificateAuthorityCredentials;
function saveCertificateAuthorityCredentials(keypath, certpath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Saving devcert's certificate authority credentials`);
        let key = fs_1.readFileSync(keypath, 'utf-8');
        let cert = fs_1.readFileSync(certpath, 'utf-8');
        yield platforms_1.default.writeProtectedFile(constants_1.rootCAKeyPath, key);
        yield platforms_1.default.writeProtectedFile(constants_1.rootCACertPath, cert);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydGlmaWNhdGUtYXV0aG9yaXR5LmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9kbGFubm95ZS9wcm9qZWN0cy9kZXZjZXJ0LyIsInNvdXJjZXMiOlsiY2VydGlmaWNhdGUtYXV0aG9yaXR5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUF3QjtBQUN4QiwyQkFLWTtBQUNaLG1DQUF3QztBQUN4QywwREFBZ0M7QUFFaEMsMkNBU3FCO0FBQ3JCLG9FQUEwQztBQUMxQyxtQ0FBeUM7QUFDekMsaURBQTZDO0FBRzdDLE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBRTNEOzs7R0FHRztBQUNILHFDQUEwRCxVQUFtQixFQUFFOztRQUM3RSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztRQUN0RCx3QkFBd0IsRUFBRSxDQUFDO1FBRTNCLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQ2pELElBQUksV0FBVyxHQUFHLGFBQUssRUFBRSxDQUFDO1FBQzFCLElBQUksWUFBWSxHQUFHLGFBQUssRUFBRSxDQUFDO1FBRTNCLEtBQUssQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFDO1FBQ3hGLGVBQWUsRUFBRSxDQUFDO1FBRWxCLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ2xDLDBCQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFekIsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDckMsZUFBTyxDQUFDLDJCQUE0Qiw0QkFBaUIsV0FBWSxXQUFZLFdBQVksWUFBYSxjQUFjLENBQUMsQ0FBQztRQUV0SCxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUNsRCxNQUFNLG1DQUFtQyxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUVyRSxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztRQUMvRCxNQUFNLG1CQUFlLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lB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QUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckMsSUFBSSxJQUFJLEdBQUcsaUJBQVEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkMsTUFBTSxtQkFBZSxDQUFDLGtCQUFrQixDQUFDLHlCQUFhLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0QsTUFBTSxtQkFBZSxDQUFDLGtCQUFrQixDQUFDLDBCQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge1xuICB1bmxpbmtTeW5jIGFzIHJtLFxuICByZWFkRmlsZVN5bmMgYXMgcmVhZEZpbGUsXG4gIHdyaXRlRmlsZVN5bmMgYXMgd3JpdGVGaWxlLFxuICBleGlzdHNTeW5jIGFzIGV4aXN0c1xufSBmcm9tICdmcyc7XG5pbXBvcnQgeyBzeW5jIGFzIHJpbXJhZiB9IGZyb20gJ3JpbXJhZic7XG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQge1xuICByb290Q0FLZXlQYXRoLFxuICByb290Q0FDZXJ0UGF0aCxcbiAgY2FTZWxmU2lnbkNvbmZpZyxcbiAgb3BlbnNzbFNlcmlhbEZpbGVQYXRoLFxuICBvcGVuc3NsRGF0YWJhc2VGaWxlUGF0aCxcbiAgaXNXaW5kb3dzLFxuICBpc0xpbnV4LFxuICBjYVZlcnNpb25GaWxlXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBjdXJyZW50UGxhdGZvcm0gZnJvbSAnLi9wbGF0Zm9ybXMnO1xuaW1wb3J0IHsgb3BlbnNzbCwgbWt0bXAgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IGdlbmVyYXRlS2V5IH0gZnJvbSAnLi9jZXJ0aWZpY2F0ZXMnO1xuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4vaW5kZXgnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OmNlcnRpZmljYXRlLWF1dGhvcml0eScpO1xuXG4vKipcbiAqIEluc3RhbGwgdGhlIG9uY2UtcGVyLW1hY2hpbmUgdHJ1c3RlZCByb290IENBLiBXZSdsbCB1c2UgdGhpcyBDQSB0byBzaWduXG4gKiBwZXItYXBwIGNlcnRzLlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiBpbnN0YWxsQ2VydGlmaWNhdGVBdXRob3JpdHkob3B0aW9uczogT3B0aW9ucyA9IHt9KTogUHJvbWlzZTx2b2lkPiB7XG4gIGRlYnVnKGBDaGVja2luZyBpZiBvbGRlciBkZXZjZXJ0IGluc3RhbGwgaXMgcHJlc2VudGApO1xuICBzY3J1Yk9sZEluc2VjdXJlVmVyc2lvbnMoKTtcblxuICBkZWJ1ZyhgR2VuZXJhdGluZyBhIHJvb3QgY2VydGlmaWNhdGUgYXV0aG9yaXR5YCk7XG4gIGxldCByb290S2V5UGF0aCA9IG1rdG1wKCk7XG4gIGxldCByb290Q2VydFBhdGggPSBta3RtcCgpO1xuXG4gIGRlYnVnKGBHZW5lcmF0aW5nIHRoZSBPcGVuU1NMIGNvbmZpZ3VyYXRpb24gbmVlZGVkIHRvIHNldHVwIHRoZSBjZXJ0aWZpY2F0ZSBhdXRob3JpdHlgKTtcbiAgc2VlZENvbmZpZ0ZpbGVzKCk7XG5cbiAgZGVidWcoYEdlbmVyYXRpbmcgYSBwcml2YXRlIGtleWApO1xuICBnZW5lcmF0ZUtleShyb290S2V5UGF0aCk7XG5cbiAgZGVidWcoYEdlbmVyYXRpbmcgYSBDQSBjZXJ0aWZpY2F0ZWApO1xuICBvcGVuc3NsKGByZXEgLW5ldyAteDUwOSAtY29uZmlnIFwiJHsgY2FTZWxmU2lnbkNvbmZpZyB9XCIgLWtleSBcIiR7IHJvb3RLZXlQYXRoIH1cIiAtb3V0IFwiJHsgcm9vdENlcnRQYXRoIH1cIiAtZGF5cyA3MDAwYCk7XG5cbiAgZGVidWcoJ1NhdmluZyBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgY3JlZGVudGlhbHMnKTtcbiAgYXdhaXQgc2F2ZUNlcnRpZmljYXRlQXV0aG9yaXR5Q3JlZGVudGlhbHMocm9vdEtleVBhdGgsIHJvb3RDZXJ0UGF0aCk7XG5cbiAgZGVidWcoYEFkZGluZyB0aGUgcm9vdCBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgdG8gdHJ1c3Qgc3RvcmVzYCk7XG4gIGF3YWl0IGN1cnJlbnRQbGF0Zm9ybS5hZGRUb1RydXN0U3RvcmVzKHJvb3RDZXJ0UGF0aCwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogT2xkZXIgdmVyc2lvbnMgb2YgZGV2Y2VydCBsZWZ0IHRoZSByb290IGNlcnRpZmljYXRlIGtleXMgdW5ndWFyZGVkIGFuZFxuICogYWNjZXNzaWJsZSBieSB1c2VybGFuZCBwcm9jZXNzZXMuIEhlcmUsIHdlIGNoZWNrIGZvciBldmlkZW5jZSBvZiB0aGlzIG9sZGVyXG4gKiB2ZXJzaW9uLCBhbmQgaWYgZm91bmQsIHdlIGRlbGV0ZSB0aGUgcm9vdCBjZXJ0aWZpY2F0ZSBrZXlzIHRvIHJlbW92ZSB0aGVcbiAqIGF0dGFjayB2ZWN0b3IuXG4gKi9cbmZ1bmN0aW9uIHNjcnViT2xkSW5zZWN1cmVWZXJzaW9ucygpIHtcbiAgLy8gVXNlIHRoZSBvbGQgdmVyaW9uJ3MgbG9naWMgZm9yIGRldGVybWluaW5nIGNvbmZpZyBkaXJlY3RvcnlcbiAgbGV0IGNvbmZpZ0Rpcjogc3RyaW5nO1xuICBpZiAoaXNXaW5kb3dzICYmIHByb2Nlc3MuZW52LkxPQ0FMQVBQREFUQSkge1xuICAgIGNvbmZpZ0RpciA9IHBhdGguam9pbihwcm9jZXNzLmVudi5MT0NBTEFQUERBVEEsICdkZXZjZXJ0JywgJ2NvbmZpZycpO1xuICB9IGVsc2Uge1xuICAgIGxldCB1aWQgPSBwcm9jZXNzLmdldHVpZCAmJiBwcm9jZXNzLmdldHVpZCgpO1xuICAgIGxldCB1c2VySG9tZSA9IChpc0xpbnV4ICYmIHVpZCA9PT0gMCkgPyBwYXRoLnJlc29sdmUoJy91c3IvbG9jYWwvc2hhcmUnKSA6IHJlcXVpcmUoJ29zJykuaG9tZWRpcigpO1xuICAgIGNvbmZpZ0RpciA9IHBhdGguam9pbih1c2VySG9tZSwgJy5jb25maWcnLCAnZGV2Y2VydCcpO1xuICB9XG5cbiAgLy8gRGVsZXRlIHRoZSByb290IGNlcnRpZmljYXRlIGtleXMsIGFzIHdlbGwgYXMgdGhlIGdlbmVyYXRlZCBhcHAgY2VydGlmaWNhdGVzXG4gIGRlYnVnKGBDaGVja2luZyAkeyBjb25maWdEaXIgfSBmb3IgbGVnYWN5IGZpbGVzIC4uLmApO1xuICBbXG4gICAgcGF0aC5qb2luKGNvbmZpZ0RpciwgJ29wZW5zc2wuY29uZicpLFxuICAgIHBhdGguam9pbihjb25maWdEaXIsICdkZXZjZXJ0LWNhLXJvb3Qua2V5JyksXG4gICAgcGF0aC5qb2luKGNvbmZpZ0RpciwgJ2RldmNlcnQtY2Etcm9vdC5jcnQnKSxcbiAgICBwYXRoLmpvaW4oY29uZmlnRGlyLCAnZGV2Y2VydC1jYS12ZXJzaW9uJyksXG4gICAgcGF0aC5qb2luKGNvbmZpZ0RpciwgJ2NlcnRzJylcbiAgXS5mb3JFYWNoKChmaWxlcGF0aCkgPT4ge1xuICAgIGlmIChleGlzdHMoZmlsZXBhdGgpKSB7XG4gICAgICBkZWJ1ZyhgUmVtb3ZpbmcgbGVnYWN5IGZpbGU6ICR7IGZpbGVwYXRoIH1gKVxuICAgICAgcmltcmFmKGZpbGVwYXRoKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoZSBmaWxlcyBPcGVuU1NMIG5lZWRzIHRvIHNpZ24gY2VydGlmaWNhdGVzIGFzIGEgY2VydGlmaWNhdGVcbiAqIGF1dGhvcml0eSwgYXMgd2VsbCBhcyBvdXIgQ0Egc2V0dXAgdmVyc2lvblxuICovXG5mdW5jdGlvbiBzZWVkQ29uZmlnRmlsZXMoKSB7XG4gIC8vIFRoaXMgaXMgdjIgb2YgdGhlIGRldmNlcnQgY2VydGlmaWNhdGUgYXV0aG9yaXR5IHNldHVwXG4gIHdyaXRlRmlsZShjYVZlcnNpb25GaWxlLCAnMicpO1xuICAvLyBPcGVuU1NMIENBIGZpbGVzXG4gIHdyaXRlRmlsZShvcGVuc3NsRGF0YWJhc2VGaWxlUGF0aCwgJycpO1xuICB3cml0ZUZpbGUob3BlbnNzbFNlcmlhbEZpbGVQYXRoLCAnMDEnKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdpdGhDZXJ0aWZpY2F0ZUF1dGhvcml0eUNyZWRlbnRpYWxzKGNiOiAoeyBjYUtleVBhdGgsIGNhQ2VydFBhdGggfTogeyBjYUtleVBhdGg6IHN0cmluZywgY2FDZXJ0UGF0aDogc3RyaW5nIH0pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkKSB7XG4gIGRlYnVnKGBSZXRyaWV2aW5nIGRldmNlcnQncyBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgY3JlZGVudGlhbHNgKTtcbiAgbGV0IHRtcENBS2V5UGF0aCA9IG1rdG1wKCk7XG4gIGxldCB0bXBDQUNlcnRQYXRoID0gbWt0bXAoKTtcbiAgbGV0IGNhS2V5ID0gYXdhaXQgY3VycmVudFBsYXRmb3JtLnJlYWRQcm90ZWN0ZWRGaWxlKHJvb3RDQUtleVBhdGgpO1xuICBsZXQgY2FDZXJ0ID0gYXdhaXQgY3VycmVudFBsYXRmb3JtLnJlYWRQcm90ZWN0ZWRGaWxlKHJvb3RDQUNlcnRQYXRoKTtcbiAgd3JpdGVGaWxlKHRtcENBS2V5UGF0aCwgY2FLZXkpO1xuICB3cml0ZUZpbGUodG1wQ0FDZXJ0UGF0aCwgY2FDZXJ0KTtcbiAgYXdhaXQgY2IoeyBjYUtleVBhdGg6IHRtcENBS2V5UGF0aCwgY2FDZXJ0UGF0aDogdG1wQ0FDZXJ0UGF0aCB9KTtcbiAgcm0odG1wQ0FLZXlQYXRoKTtcbiAgcm0odG1wQ0FDZXJ0UGF0aCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNhdmVDZXJ0aWZpY2F0ZUF1dGhvcml0eUNyZWRlbnRpYWxzKGtleXBhdGg6IHN0cmluZywgY2VydHBhdGg6IHN0cmluZykge1xuICBkZWJ1ZyhgU2F2aW5nIGRldmNlcnQncyBjZXJ0aWZpY2F0ZSBhdXRob3JpdHkgY3JlZGVudGlhbHNgKTtcbiAgbGV0IGtleSA9IHJlYWRGaWxlKGtleXBhdGgsICd1dGYtOCcpO1xuICBsZXQgY2VydCA9IHJlYWRGaWxlKGNlcnRwYXRoLCAndXRmLTgnKTtcbiAgYXdhaXQgY3VycmVudFBsYXRmb3JtLndyaXRlUHJvdGVjdGVkRmlsZShyb290Q0FLZXlQYXRoLCBrZXkpO1xuICBhd2FpdCBjdXJyZW50UGxhdGZvcm0ud3JpdGVQcm90ZWN0ZWRGaWxlKHJvb3RDQUNlcnRQYXRoLCBjZXJ0KTtcbn1cbiJdfQ==