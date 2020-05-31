"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
// import path from 'path';
const debug_1 = tslib_1.__importDefault(require("debug"));
const mkdirp_1 = require("mkdirp");
const fs_1 = require("fs");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const certificate_authority_1 = require("./certificate-authority");
const debug = debug_1.default('devcert:certificates');
/**
 * Generate a domain certificate signed by the devcert root CA. Domain
 * certificates are cached in their own directories under
 * CONFIG_ROOT/domains/<domain>, and reused on subsequent requests. Because the
 * individual domain certificates are signed by the devcert root CA (which was
 * added to the OS/browser trust stores), they are trusted.
 */
function generateDomainCertificate(domain) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        mkdirp_1.sync(constants_1.pathForDomain(domain));
        debug(`Generating private key for ${domain}`);
        let domainKeyPath = constants_1.pathForDomain(domain, 'private-key.key');
        generateKey(domainKeyPath);
        debug(`Generating certificate signing request for ${domain}`);
        let csrFile = constants_1.pathForDomain(domain, `certificate-signing-request.csr`);
        constants_1.withDomainSigningRequestConfig(domain, (configpath) => {
            utils_1.openssl(`req -new -config "${configpath}" -key "${domainKeyPath}" -out "${csrFile}"`);
        });
        debug(`Generating certificate for ${domain} from signing request and signing with root CA`);
        let domainCertPath = constants_1.pathForDomain(domain, `certificate.crt`);
        yield certificate_authority_1.withCertificateAuthorityCredentials(({ caKeyPath, caCertPath }) => {
            constants_1.withDomainCertificateConfig(domain, (domainCertConfigPath) => {
                utils_1.openssl(`ca -config "${domainCertConfigPath}" -in "${csrFile}" -out "${domainCertPath}" -keyfile "${caKeyPath}" -cert "${caCertPath}" -days 7000 -batch`);
            });
        });
    });
}
exports.default = generateDomainCertificate;
// Generate a cryptographic key, used to sign certificates or certificate signing requests.
function generateKey(filename) {
    debug(`generateKey: ${filename}`);
    utils_1.openssl(`genrsa -out "${filename}" 2048`);
    fs_1.chmodSync(filename, 400);
}
exports.generateKey = generateKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VydGlmaWNhdGVzLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9kbGFubm95ZS9wcm9qZWN0cy9kZXZjZXJ0LyIsInNvdXJjZXMiOlsiY2VydGlmaWNhdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUEyQjtBQUMzQiwwREFBZ0M7QUFDaEMsbUNBQXdDO0FBQ3hDLDJCQUF3QztBQUN4QywyQ0FBeUc7QUFDekcsbUNBQWtDO0FBQ2xDLG1FQUE4RTtBQUU5RSxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUVsRDs7Ozs7O0dBTUc7QUFDSCxtQ0FBd0QsTUFBYzs7UUFDcEUsYUFBTSxDQUFDLHlCQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU5QixLQUFLLENBQUMsOEJBQStCLE1BQU8sRUFBRSxDQUFDLENBQUM7UUFDaEQsSUFBSSxhQUFhLEdBQUcseUJBQWEsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUM3RCxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFM0IsS0FBSyxDQUFDLDhDQUErQyxNQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLElBQUksT0FBTyxHQUFHLHlCQUFhLENBQUMsTUFBTSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7UUFDdkUsMENBQThCLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDcEQsZUFBTyxDQUFDLHFCQUFzQixVQUFXLFdBQVksYUFBYyxXQUFZLE9BQVEsR0FBRyxDQUFDLENBQUM7UUFDOUYsQ0FBQyxDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsOEJBQStCLE1BQU8sZ0RBQWdELENBQUMsQ0FBQztRQUM5RixJQUFJLGNBQWMsR0FBRyx5QkFBYSxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBRTlELE1BQU0sMkRBQW1DLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFO1lBQ3RFLHVDQUEyQixDQUFDLE1BQU0sRUFBRSxDQUFDLG9CQUFvQixFQUFFLEVBQUU7Z0JBQzNELGVBQU8sQ0FBQyxlQUFnQixvQkFBcUIsVUFBVyxPQUFRLFdBQVksY0FBZSxlQUFnQixTQUFVLFlBQWEsVUFBVyxxQkFBcUIsQ0FBQyxDQUFBO1lBQ3JLLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQUE7QUFyQkQsNENBcUJDO0FBRUQsMkZBQTJGO0FBQzNGLHFCQUE0QixRQUFnQjtJQUMxQyxLQUFLLENBQUMsZ0JBQWlCLFFBQVMsRUFBRSxDQUFDLENBQUM7SUFDcEMsZUFBTyxDQUFDLGdCQUFpQixRQUFTLFFBQVEsQ0FBQyxDQUFDO0lBQzVDLGNBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdkIsQ0FBQztBQUpELGtDQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgc3luYyBhcyBta2RpcnAgfSBmcm9tICdta2RpcnAnO1xuaW1wb3J0IHsgY2htb2RTeW5jIGFzIGNobW9kIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgcGF0aEZvckRvbWFpbiwgd2l0aERvbWFpblNpZ25pbmdSZXF1ZXN0Q29uZmlnLCB3aXRoRG9tYWluQ2VydGlmaWNhdGVDb25maWcgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBvcGVuc3NsIH0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQgeyB3aXRoQ2VydGlmaWNhdGVBdXRob3JpdHlDcmVkZW50aWFscyB9IGZyb20gJy4vY2VydGlmaWNhdGUtYXV0aG9yaXR5JztcblxuY29uc3QgZGVidWcgPSBjcmVhdGVEZWJ1ZygnZGV2Y2VydDpjZXJ0aWZpY2F0ZXMnKTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBhIGRvbWFpbiBjZXJ0aWZpY2F0ZSBzaWduZWQgYnkgdGhlIGRldmNlcnQgcm9vdCBDQS4gRG9tYWluXG4gKiBjZXJ0aWZpY2F0ZXMgYXJlIGNhY2hlZCBpbiB0aGVpciBvd24gZGlyZWN0b3JpZXMgdW5kZXJcbiAqIENPTkZJR19ST09UL2RvbWFpbnMvPGRvbWFpbj4sIGFuZCByZXVzZWQgb24gc3Vic2VxdWVudCByZXF1ZXN0cy4gQmVjYXVzZSB0aGVcbiAqIGluZGl2aWR1YWwgZG9tYWluIGNlcnRpZmljYXRlcyBhcmUgc2lnbmVkIGJ5IHRoZSBkZXZjZXJ0IHJvb3QgQ0EgKHdoaWNoIHdhc1xuICogYWRkZWQgdG8gdGhlIE9TL2Jyb3dzZXIgdHJ1c3Qgc3RvcmVzKSwgdGhleSBhcmUgdHJ1c3RlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEb21haW5DZXJ0aWZpY2F0ZShkb21haW46IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBta2RpcnAocGF0aEZvckRvbWFpbihkb21haW4pKTtcblxuICBkZWJ1ZyhgR2VuZXJhdGluZyBwcml2YXRlIGtleSBmb3IgJHsgZG9tYWluIH1gKTtcbiAgbGV0IGRvbWFpbktleVBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgJ3ByaXZhdGUta2V5LmtleScpO1xuICBnZW5lcmF0ZUtleShkb21haW5LZXlQYXRoKTtcblxuICBkZWJ1ZyhgR2VuZXJhdGluZyBjZXJ0aWZpY2F0ZSBzaWduaW5nIHJlcXVlc3QgZm9yICR7IGRvbWFpbiB9YCk7XG4gIGxldCBjc3JGaWxlID0gcGF0aEZvckRvbWFpbihkb21haW4sIGBjZXJ0aWZpY2F0ZS1zaWduaW5nLXJlcXVlc3QuY3NyYCk7XG4gIHdpdGhEb21haW5TaWduaW5nUmVxdWVzdENvbmZpZyhkb21haW4sIChjb25maWdwYXRoKSA9PiB7XG4gICAgb3BlbnNzbChgcmVxIC1uZXcgLWNvbmZpZyBcIiR7IGNvbmZpZ3BhdGggfVwiIC1rZXkgXCIkeyBkb21haW5LZXlQYXRoIH1cIiAtb3V0IFwiJHsgY3NyRmlsZSB9XCJgKTtcbiAgfSk7XG5cbiAgZGVidWcoYEdlbmVyYXRpbmcgY2VydGlmaWNhdGUgZm9yICR7IGRvbWFpbiB9IGZyb20gc2lnbmluZyByZXF1ZXN0IGFuZCBzaWduaW5nIHdpdGggcm9vdCBDQWApO1xuICBsZXQgZG9tYWluQ2VydFBhdGggPSBwYXRoRm9yRG9tYWluKGRvbWFpbiwgYGNlcnRpZmljYXRlLmNydGApO1xuXG4gIGF3YWl0IHdpdGhDZXJ0aWZpY2F0ZUF1dGhvcml0eUNyZWRlbnRpYWxzKCh7IGNhS2V5UGF0aCwgY2FDZXJ0UGF0aCB9KSA9PiB7XG4gICAgd2l0aERvbWFpbkNlcnRpZmljYXRlQ29uZmlnKGRvbWFpbiwgKGRvbWFpbkNlcnRDb25maWdQYXRoKSA9PiB7XG4gICAgICBvcGVuc3NsKGBjYSAtY29uZmlnIFwiJHsgZG9tYWluQ2VydENvbmZpZ1BhdGggfVwiIC1pbiBcIiR7IGNzckZpbGUgfVwiIC1vdXQgXCIkeyBkb21haW5DZXJ0UGF0aCB9XCIgLWtleWZpbGUgXCIkeyBjYUtleVBhdGggfVwiIC1jZXJ0IFwiJHsgY2FDZXJ0UGF0aCB9XCIgLWRheXMgNzAwMCAtYmF0Y2hgKVxuICAgIH0pO1xuICB9KTtcbn1cblxuLy8gR2VuZXJhdGUgYSBjcnlwdG9ncmFwaGljIGtleSwgdXNlZCB0byBzaWduIGNlcnRpZmljYXRlcyBvciBjZXJ0aWZpY2F0ZSBzaWduaW5nIHJlcXVlc3RzLlxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlS2V5KGZpbGVuYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgZGVidWcoYGdlbmVyYXRlS2V5OiAkeyBmaWxlbmFtZSB9YCk7XG4gIG9wZW5zc2woYGdlbnJzYSAtb3V0IFwiJHsgZmlsZW5hbWUgfVwiIDIwNDhgKTtcbiAgY2htb2QoZmlsZW5hbWUsIDQwMCk7XG59Il19