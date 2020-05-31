"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const rimraf_1 = tslib_1.__importDefault(require("rimraf"));
const constants_1 = require("./constants");
const platforms_1 = tslib_1.__importDefault(require("./platforms"));
const certificate_authority_1 = tslib_1.__importDefault(require("./certificate-authority"));
const certificates_1 = tslib_1.__importDefault(require("./certificates"));
const user_interface_1 = tslib_1.__importDefault(require("./user-interface"));
const debug = debug_1.default('devcert');
/**
 * Request an SSL certificate for the given app name signed by the devcert root
 * certificate authority. If devcert has previously generated a certificate for
 * that app name on this machine, it will reuse that certificate.
 *
 * If this is the first time devcert is being run on this machine, it will
 * generate and attempt to install a root certificate authority.
 *
 * Returns a promise that resolves with { key, cert }, where `key` and `cert`
 * are Buffers with the contents of the certificate private key and certificate
 * file, respectively
 */
function certificateFor(domain, options = {}) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        debug(`Certificate requested for ${domain}. Skipping certutil install: ${Boolean(options.skipCertutilInstall)}. Skipping hosts file: ${Boolean(options.skipHostsFile)}`);
        if (options.ui) {
            Object.assign(user_interface_1.default, options.ui);
        }
        if (!constants_1.isMac && !constants_1.isLinux && !constants_1.isWindows) {
            throw new Error(`Platform not supported: "${process.platform}"`);
        }
        if (!command_exists_1.sync('openssl')) {
            throw new Error('OpenSSL not found: OpenSSL is required to generate SSL certificates - make sure it is installed and available in your PATH');
        }
        let domainKeyPath = constants_1.pathForDomain(domain, `private-key.key`);
        let domainCertPath = constants_1.pathForDomain(domain, `certificate.crt`);
        if (!fs_1.existsSync(constants_1.rootCAKeyPath)) {
            debug('Root CA is not installed yet, so it must be our first run. Installing root CA ...');
            yield certificate_authority_1.default(options);
        }
        if (!fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`))) {
            debug(`Can't find certificate file for ${domain}, so it must be the first request for ${domain}. Generating and caching ...`);
            yield certificates_1.default(domain);
        }
        if (!options.skipHostsFile) {
            yield platforms_1.default.addDomainToHostFileIfMissing(domain);
        }
        debug(`Returning domain certificate`);
        return {
            key: fs_1.readFileSync(domainKeyPath),
            cert: fs_1.readFileSync(domainCertPath)
        };
    });
}
exports.certificateFor = certificateFor;
function hasCertificateFor(domain) {
    return fs_1.existsSync(constants_1.pathForDomain(domain, `certificate.crt`));
}
exports.hasCertificateFor = hasCertificateFor;
function configuredDomains() {
    return fs_1.readdirSync(constants_1.domainsDir);
}
exports.configuredDomains = configuredDomains;
function removeDomain(domain) {
    return rimraf_1.default.sync(constants_1.pathForDomain(domain));
}
exports.removeDomain = removeDomain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2RsYW5ub3llL3Byb2plY3RzL2RldmNlcnQvIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQkFBNEY7QUFDNUYsMERBQWdDO0FBQ2hDLG1EQUF1RDtBQUN2RCw0REFBNEI7QUFDNUIsMkNBT3FCO0FBQ3JCLG9FQUEwQztBQUMxQyw0RkFBa0U7QUFDbEUsMEVBQXVEO0FBQ3ZELDhFQUFxRDtBQUVyRCxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFRckM7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCx3QkFBcUMsTUFBYyxFQUFFLFVBQW1CLEVBQUU7O1FBQ3hFLEtBQUssQ0FBQyw2QkFBOEIsTUFBTyxnQ0FBaUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBRSwwQkFBMkIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0ssSUFBSSxPQUFPLENBQUMsRUFBRSxFQUFFO1lBQ2QsTUFBTSxDQUFDLE1BQU0sQ0FBQyx3QkFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMvQjtRQUVELElBQUksQ0FBQyxpQkFBSyxJQUFJLENBQUMsbUJBQU8sSUFBSSxDQUFDLHFCQUFTLEVBQUU7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNkIsT0FBTyxDQUFDLFFBQVMsR0FBRyxDQUFDLENBQUM7U0FDcEU7UUFFRCxJQUFJLENBQUMscUJBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLDRIQUE0SCxDQUFDLENBQUM7U0FDL0k7UUFFRCxJQUFJLGFBQWEsR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQzdELElBQUksY0FBYyxHQUFHLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLGVBQU0sQ0FBQyx5QkFBYSxDQUFDLEVBQUU7WUFDMUIsS0FBSyxDQUFDLG1GQUFtRixDQUFDLENBQUM7WUFDM0YsTUFBTSwrQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxlQUFNLENBQUMseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxFQUFFO1lBQ3JELEtBQUssQ0FBQyxtQ0FBb0MsTUFBTyx5Q0FBMEMsTUFBTyw4QkFBOEIsQ0FBQyxDQUFDO1lBQ2xJLE1BQU0sc0JBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekM7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUMxQixNQUFNLG1CQUFlLENBQUMsNEJBQTRCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7UUFFRCxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUN0QyxPQUFPO1lBQ0wsR0FBRyxFQUFFLGlCQUFRLENBQUMsYUFBYSxDQUFDO1lBQzVCLElBQUksRUFBRSxpQkFBUSxDQUFDLGNBQWMsQ0FBQztTQUMvQixDQUFDO0lBQ0osQ0FBQztDQUFBO0FBckNELHdDQXFDQztBQUVELDJCQUFrQyxNQUFjO0lBQzlDLE9BQU8sZUFBTSxDQUFDLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBRkQsOENBRUM7QUFFRDtJQUNFLE9BQU8sZ0JBQU8sQ0FBQyxzQkFBVSxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUZELDhDQUVDO0FBRUQsc0JBQTZCLE1BQWM7SUFDekMsT0FBTyxnQkFBTSxDQUFDLElBQUksQ0FBQyx5QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUZELG9DQUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmVhZEZpbGVTeW5jIGFzIHJlYWRGaWxlLCByZWFkZGlyU3luYyBhcyByZWFkZGlyLCBleGlzdHNTeW5jIGFzIGV4aXN0cyB9IGZyb20gJ2ZzJztcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgeyBzeW5jIGFzIGNvbW1hbmRFeGlzdHMgfSBmcm9tICdjb21tYW5kLWV4aXN0cyc7XG5pbXBvcnQgcmltcmFmIGZyb20gJ3JpbXJhZic7XG5pbXBvcnQge1xuICBpc01hYyxcbiAgaXNMaW51eCxcbiAgaXNXaW5kb3dzLFxuICBwYXRoRm9yRG9tYWluLFxuICBkb21haW5zRGlyLFxuICByb290Q0FLZXlQYXRoXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCBjdXJyZW50UGxhdGZvcm0gZnJvbSAnLi9wbGF0Zm9ybXMnO1xuaW1wb3J0IGluc3RhbGxDZXJ0aWZpY2F0ZUF1dGhvcml0eSBmcm9tICcuL2NlcnRpZmljYXRlLWF1dGhvcml0eSc7XG5pbXBvcnQgZ2VuZXJhdGVEb21haW5DZXJ0aWZpY2F0ZSBmcm9tICcuL2NlcnRpZmljYXRlcyc7XG5pbXBvcnQgVUksIHsgVXNlckludGVyZmFjZSB9IGZyb20gJy4vdXNlci1pbnRlcmZhY2UnO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0Jyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9ucyB7XG4gIHNraXBDZXJ0dXRpbEluc3RhbGw/OiB0cnVlLFxuICBza2lwSG9zdHNGaWxlPzogdHJ1ZSxcbiAgdWk/OiBVc2VySW50ZXJmYWNlXG59XG5cbi8qKlxuICogUmVxdWVzdCBhbiBTU0wgY2VydGlmaWNhdGUgZm9yIHRoZSBnaXZlbiBhcHAgbmFtZSBzaWduZWQgYnkgdGhlIGRldmNlcnQgcm9vdFxuICogY2VydGlmaWNhdGUgYXV0aG9yaXR5LiBJZiBkZXZjZXJ0IGhhcyBwcmV2aW91c2x5IGdlbmVyYXRlZCBhIGNlcnRpZmljYXRlIGZvclxuICogdGhhdCBhcHAgbmFtZSBvbiB0aGlzIG1hY2hpbmUsIGl0IHdpbGwgcmV1c2UgdGhhdCBjZXJ0aWZpY2F0ZS5cbiAqXG4gKiBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIGRldmNlcnQgaXMgYmVpbmcgcnVuIG9uIHRoaXMgbWFjaGluZSwgaXQgd2lsbFxuICogZ2VuZXJhdGUgYW5kIGF0dGVtcHQgdG8gaW5zdGFsbCBhIHJvb3QgY2VydGlmaWNhdGUgYXV0aG9yaXR5LlxuICpcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB7IGtleSwgY2VydCB9LCB3aGVyZSBga2V5YCBhbmQgYGNlcnRgXG4gKiBhcmUgQnVmZmVycyB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgY2VydGlmaWNhdGUgcHJpdmF0ZSBrZXkgYW5kIGNlcnRpZmljYXRlXG4gKiBmaWxlLCByZXNwZWN0aXZlbHlcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNlcnRpZmljYXRlRm9yKGRvbWFpbjogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pIHtcbiAgZGVidWcoYENlcnRpZmljYXRlIHJlcXVlc3RlZCBmb3IgJHsgZG9tYWluIH0uIFNraXBwaW5nIGNlcnR1dGlsIGluc3RhbGw6ICR7IEJvb2xlYW4ob3B0aW9ucy5za2lwQ2VydHV0aWxJbnN0YWxsKSB9LiBTa2lwcGluZyBob3N0cyBmaWxlOiAkeyBCb29sZWFuKG9wdGlvbnMuc2tpcEhvc3RzRmlsZSkgfWApO1xuXG4gIGlmIChvcHRpb25zLnVpKSB7XG4gICAgT2JqZWN0LmFzc2lnbihVSSwgb3B0aW9ucy51aSk7XG4gIH1cblxuICBpZiAoIWlzTWFjICYmICFpc0xpbnV4ICYmICFpc1dpbmRvd3MpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBsYXRmb3JtIG5vdCBzdXBwb3J0ZWQ6IFwiJHsgcHJvY2Vzcy5wbGF0Zm9ybSB9XCJgKTtcbiAgfVxuXG4gIGlmICghY29tbWFuZEV4aXN0cygnb3BlbnNzbCcpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdPcGVuU1NMIG5vdCBmb3VuZDogT3BlblNTTCBpcyByZXF1aXJlZCB0byBnZW5lcmF0ZSBTU0wgY2VydGlmaWNhdGVzIC0gbWFrZSBzdXJlIGl0IGlzIGluc3RhbGxlZCBhbmQgYXZhaWxhYmxlIGluIHlvdXIgUEFUSCcpO1xuICB9XG5cbiAgbGV0IGRvbWFpbktleVBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYHByaXZhdGUta2V5LmtleWApO1xuICBsZXQgZG9tYWluQ2VydFBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApO1xuXG4gIGlmICghZXhpc3RzKHJvb3RDQUtleVBhdGgpKSB7XG4gICAgZGVidWcoJ1Jvb3QgQ0EgaXMgbm90IGluc3RhbGxlZCB5ZXQsIHNvIGl0IG11c3QgYmUgb3VyIGZpcnN0IHJ1bi4gSW5zdGFsbGluZyByb290IENBIC4uLicpO1xuICAgIGF3YWl0IGluc3RhbGxDZXJ0aWZpY2F0ZUF1dGhvcml0eShvcHRpb25zKTtcbiAgfVxuXG4gIGlmICghZXhpc3RzKHBhdGhGb3JEb21haW4oZG9tYWluLCBgY2VydGlmaWNhdGUuY3J0YCkpKSB7XG4gICAgZGVidWcoYENhbid0IGZpbmQgY2VydGlmaWNhdGUgZmlsZSBmb3IgJHsgZG9tYWluIH0sIHNvIGl0IG11c3QgYmUgdGhlIGZpcnN0IHJlcXVlc3QgZm9yICR7IGRvbWFpbiB9LiBHZW5lcmF0aW5nIGFuZCBjYWNoaW5nIC4uLmApO1xuICAgIGF3YWl0IGdlbmVyYXRlRG9tYWluQ2VydGlmaWNhdGUoZG9tYWluKTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucy5za2lwSG9zdHNGaWxlKSB7XG4gICAgYXdhaXQgY3VycmVudFBsYXRmb3JtLmFkZERvbWFpblRvSG9zdEZpbGVJZk1pc3NpbmcoZG9tYWluKTtcbiAgfVxuXG4gIGRlYnVnKGBSZXR1cm5pbmcgZG9tYWluIGNlcnRpZmljYXRlYCk7XG4gIHJldHVybiB7XG4gICAga2V5OiByZWFkRmlsZShkb21haW5LZXlQYXRoKSxcbiAgICBjZXJ0OiByZWFkRmlsZShkb21haW5DZXJ0UGF0aClcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc0NlcnRpZmljYXRlRm9yKGRvbWFpbjogc3RyaW5nKSB7XG4gIHJldHVybiBleGlzdHMocGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS5jcnRgKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmVkRG9tYWlucygpIHtcbiAgcmV0dXJuIHJlYWRkaXIoZG9tYWluc0Rpcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVEb21haW4oZG9tYWluOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHJpbXJhZi5zeW5jKHBhdGhGb3JEb21haW4oZG9tYWluKSk7XG59Il19