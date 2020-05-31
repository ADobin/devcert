"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const utils_1 = require("../utils");
const shared_1 = require("./shared");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const debug = debug_1.default('devcert:platforms:macos');
class MacOSPlatform {
    constructor() {
        this.FIREFOX_BUNDLE_PATH = '/Applications/Firefox.app';
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, 'Library/Application Support/Firefox/Profiles/*');
    }
    /**
     * macOS is pretty simple - just add the certificate to the system keychain,
     * and most applications will delegate to that for determining trusted
     * certificates. Firefox, of course, does it's own thing. We can try to
     * automatically install the cert with Firefox if we can use certutil via the
     * `nss` Homebrew package, otherwise we go manual with user-facing prompts.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // Chrome, Safari, system utils
            debug('Adding devcert root CA to macOS system keychain');
            utils_1.run(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain -p ssl -p basic "${certificatePath}"`);
            if (this.isFirefoxInstalled()) {
                // Try to use certutil to install the cert automatically
                debug('Firefox install detected. Adding devcert root CA to Firefox trust store');
                if (!this.isNSSInstalled()) {
                    if (!options.skipCertutilInstall) {
                        if (command_exists_1.sync('brew')) {
                            debug(`certutil is not already installed, but Homebrew is detected. Trying to install certutil via Homebrew...`);
                            utils_1.run('brew install nss');
                        }
                        else {
                            debug(`Homebrew isn't installed, so we can't try to install certutil. Falling back to manual certificate install`);
                            return user_interface_1.default.warnFirefoxUnableToConfigure();
                        }
                    }
                    else {
                        debug(`certutil is not already installed, and skipCertutilInstall is true, so we have to fall back to a manual install`);
                        return user_interface_1.default.warnFirefoxUnableToConfigure();
                    }
                }
                let certutilPath = path_1.default.join(utils_1.run('brew --prefix nss').toString().trim(), 'bin', 'certutil');
                yield shared_1.closeFirefox();
                yield shared_1.addCertificateToNSSCertDB(this.FIREFOX_NSS_DIR, certificatePath, certutilPath);
            }
            else {
                debug('Firefox does not appear to be installed, skipping Firefox-specific steps...');
            }
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // No need to check if the domain is present, as hostile will handle the case where the domain is already in the host file.
            utils_1.run(`sudo "${process.execPath}" "${require.resolve('hostile/bin/cmd')}" set 127.0.0.1 ${domain}`);
        });
    }
    readProtectedFile(filepath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield utils_1.run(`sudo cat "${filepath}"`)).toString().trim();
        });
    }
    writeProtectedFile(filepath, contents) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (fs_1.existsSync(filepath)) {
                yield utils_1.run(`sudo rm "${filepath}"`);
            }
            fs_1.writeFileSync(filepath, contents);
            yield utils_1.run(`sudo chown 0 "${filepath}"`);
            yield utils_1.run(`sudo chmod 600 "${filepath}"`);
        });
    }
    isFirefoxInstalled() {
        return fs_1.existsSync(this.FIREFOX_BUNDLE_PATH);
    }
    isNSSInstalled() {
        try {
            return utils_1.run('brew list -1').toString().includes('\nnss\n');
        }
        catch (e) {
            return false;
        }
    }
}
exports.default = MacOSPlatform;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFyd2luLmpzIiwic291cmNlUm9vdCI6Ii9Vc2Vycy9kbGFubm95ZS9wcm9qZWN0cy9kZXZjZXJ0LyIsInNvdXJjZXMiOlsicGxhdGZvcm1zL2Rhcndpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx3REFBd0I7QUFDeEIsMkJBQXNFO0FBQ3RFLDBEQUFnQztBQUNoQyxtREFBdUQ7QUFDdkQsb0NBQStCO0FBRS9CLHFDQUFtRTtBQUVuRSwrRUFBbUM7QUFFbkMsTUFBTSxLQUFLLEdBQUcsZUFBVyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFFckQ7SUFBQTtRQUVVLHdCQUFtQixHQUFHLDJCQUEyQixDQUFDO1FBQ2xELG9CQUFlLEdBQUcsY0FBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO0lBcUUxRyxDQUFDO0lBbkVDOzs7Ozs7T0FNRztJQUNHLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsVUFBbUIsRUFBRTs7WUFFbkUsK0JBQStCO1lBQy9CLEtBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDO1lBQ3pELFdBQUcsQ0FBQyx5R0FBMEcsZUFBZ0IsR0FBRyxDQUFDLENBQUM7WUFFbkksSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtnQkFDN0Isd0RBQXdEO2dCQUN4RCxLQUFLLENBQUMseUVBQXlFLENBQUMsQ0FBQztnQkFDakYsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTt3QkFDaEMsSUFBSSxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUN6QixLQUFLLENBQUMseUdBQXlHLENBQUMsQ0FBQzs0QkFDakgsV0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUM7eUJBQ3pCOzZCQUFNOzRCQUNMLEtBQUssQ0FBQywyR0FBMkcsQ0FBQyxDQUFDOzRCQUNuSCxPQUFPLHdCQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQzt5QkFDMUM7cUJBQ0Y7eUJBQU07d0JBQ0wsS0FBSyxDQUFDLGlIQUFpSCxDQUFDLENBQUE7d0JBQ3hILE9BQU8sd0JBQUUsQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO3FCQUMxQztpQkFDRjtnQkFDRCxJQUFJLFlBQVksR0FBRyxjQUFJLENBQUMsSUFBSSxDQUFDLFdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDNUYsTUFBTSxxQkFBWSxFQUFFLENBQUM7Z0JBQ3JCLE1BQU0sa0NBQXlCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDdEY7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7YUFDdEY7UUFDSCxDQUFDO0tBQUE7SUFFSyw0QkFBNEIsQ0FBQyxNQUFjOztZQUMvQywySEFBMkg7WUFDM0gsV0FBRyxDQUFDLFNBQVMsT0FBTyxDQUFDLFFBQVEsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3BHLENBQUM7S0FBQTtJQUNLLGlCQUFpQixDQUFDLFFBQWdCOztZQUN0QyxPQUFPLENBQUMsTUFBTSxXQUFHLENBQUMsYUFBYSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakUsQ0FBQztLQUFBO0lBRUssa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjs7WUFDekQsSUFBSSxlQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BCLE1BQU0sV0FBRyxDQUFDLFlBQVksUUFBUSxHQUFHLENBQUMsQ0FBQzthQUNwQztZQUNELGtCQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sV0FBRyxDQUFDLGlCQUFpQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sV0FBRyxDQUFDLG1CQUFtQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FBQTtJQUVPLGtCQUFrQjtRQUN4QixPQUFPLGVBQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU8sY0FBYztRQUNwQixJQUFJO1lBQ0YsT0FBTyxXQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNkO0lBQ0gsQ0FBQztDQUVGO0FBeEVELGdDQXdFQztBQUFBLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHdyaXRlRmlsZVN5bmMgYXMgd3JpdGVGaWxlLCBleGlzdHNTeW5jIGFzIGV4aXN0cyB9IGZyb20gJ2ZzJztcbmltcG9ydCBjcmVhdGVEZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgeyBzeW5jIGFzIGNvbW1hbmRFeGlzdHMgfSBmcm9tICdjb21tYW5kLWV4aXN0cyc7XG5pbXBvcnQgeyBydW4gfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQiwgY2xvc2VGaXJlZm94IH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuJztcbmltcG9ydCBVSSBmcm9tICcuLi91c2VyLWludGVyZmFjZSc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6cGxhdGZvcm1zOm1hY29zJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hY09TUGxhdGZvcm0gaW1wbGVtZW50cyBQbGF0Zm9ybSB7XG5cbiAgcHJpdmF0ZSBGSVJFRk9YX0JVTkRMRV9QQVRIID0gJy9BcHBsaWNhdGlvbnMvRmlyZWZveC5hcHAnO1xuICBwcml2YXRlIEZJUkVGT1hfTlNTX0RJUiA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FLCAnTGlicmFyeS9BcHBsaWNhdGlvbiBTdXBwb3J0L0ZpcmVmb3gvUHJvZmlsZXMvKicpO1xuXG4gIC8qKlxuICAgKiBtYWNPUyBpcyBwcmV0dHkgc2ltcGxlIC0ganVzdCBhZGQgdGhlIGNlcnRpZmljYXRlIHRvIHRoZSBzeXN0ZW0ga2V5Y2hhaW4sXG4gICAqIGFuZCBtb3N0IGFwcGxpY2F0aW9ucyB3aWxsIGRlbGVnYXRlIHRvIHRoYXQgZm9yIGRldGVybWluaW5nIHRydXN0ZWRcbiAgICogY2VydGlmaWNhdGVzLiBGaXJlZm94LCBvZiBjb3Vyc2UsIGRvZXMgaXQncyBvd24gdGhpbmcuIFdlIGNhbiB0cnkgdG9cbiAgICogYXV0b21hdGljYWxseSBpbnN0YWxsIHRoZSBjZXJ0IHdpdGggRmlyZWZveCBpZiB3ZSBjYW4gdXNlIGNlcnR1dGlsIHZpYSB0aGVcbiAgICogYG5zc2AgSG9tZWJyZXcgcGFja2FnZSwgb3RoZXJ3aXNlIHdlIGdvIG1hbnVhbCB3aXRoIHVzZXItZmFjaW5nIHByb21wdHMuXG4gICAqL1xuICBhc3luYyBhZGRUb1RydXN0U3RvcmVzKGNlcnRpZmljYXRlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIC8vIENocm9tZSwgU2FmYXJpLCBzeXN0ZW0gdXRpbHNcbiAgICBkZWJ1ZygnQWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBtYWNPUyBzeXN0ZW0ga2V5Y2hhaW4nKTtcbiAgICBydW4oYHN1ZG8gc2VjdXJpdHkgYWRkLXRydXN0ZWQtY2VydCAtZCAtciB0cnVzdFJvb3QgLWsgL0xpYnJhcnkvS2V5Y2hhaW5zL1N5c3RlbS5rZXljaGFpbiAtcCBzc2wgLXAgYmFzaWMgXCIkeyBjZXJ0aWZpY2F0ZVBhdGggfVwiYCk7XG5cbiAgICBpZiAodGhpcy5pc0ZpcmVmb3hJbnN0YWxsZWQoKSkge1xuICAgICAgLy8gVHJ5IHRvIHVzZSBjZXJ0dXRpbCB0byBpbnN0YWxsIHRoZSBjZXJ0IGF1dG9tYXRpY2FsbHlcbiAgICAgIGRlYnVnKCdGaXJlZm94IGluc3RhbGwgZGV0ZWN0ZWQuIEFkZGluZyBkZXZjZXJ0IHJvb3QgQ0EgdG8gRmlyZWZveCB0cnVzdCBzdG9yZScpO1xuICAgICAgaWYgKCF0aGlzLmlzTlNTSW5zdGFsbGVkKCkpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zLnNraXBDZXJ0dXRpbEluc3RhbGwpIHtcbiAgICAgICAgICBpZiAoY29tbWFuZEV4aXN0cygnYnJldycpKSB7XG4gICAgICAgICAgICBkZWJ1ZyhgY2VydHV0aWwgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLCBidXQgSG9tZWJyZXcgaXMgZGV0ZWN0ZWQuIFRyeWluZyB0byBpbnN0YWxsIGNlcnR1dGlsIHZpYSBIb21lYnJldy4uLmApO1xuICAgICAgICAgICAgcnVuKCdicmV3IGluc3RhbGwgbnNzJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnKGBIb21lYnJldyBpc24ndCBpbnN0YWxsZWQsIHNvIHdlIGNhbid0IHRyeSB0byBpbnN0YWxsIGNlcnR1dGlsLiBGYWxsaW5nIGJhY2sgdG8gbWFudWFsIGNlcnRpZmljYXRlIGluc3RhbGxgKTtcbiAgICAgICAgICAgIHJldHVybiBVSS53YXJuRmlyZWZveFVuYWJsZVRvQ29uZmlndXJlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlYnVnKGBjZXJ0dXRpbCBpcyBub3QgYWxyZWFkeSBpbnN0YWxsZWQsIGFuZCBza2lwQ2VydHV0aWxJbnN0YWxsIGlzIHRydWUsIHNvIHdlIGhhdmUgdG8gZmFsbCBiYWNrIHRvIGEgbWFudWFsIGluc3RhbGxgKVxuICAgICAgICAgIHJldHVybiBVSS53YXJuRmlyZWZveFVuYWJsZVRvQ29uZmlndXJlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxldCBjZXJ0dXRpbFBhdGggPSBwYXRoLmpvaW4ocnVuKCdicmV3IC0tcHJlZml4IG5zcycpLnRvU3RyaW5nKCkudHJpbSgpLCAnYmluJywgJ2NlcnR1dGlsJyk7XG4gICAgICBhd2FpdCBjbG9zZUZpcmVmb3goKTtcbiAgICAgIGF3YWl0IGFkZENlcnRpZmljYXRlVG9OU1NDZXJ0REIodGhpcy5GSVJFRk9YX05TU19ESVIsIGNlcnRpZmljYXRlUGF0aCwgY2VydHV0aWxQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ0ZpcmVmb3ggZG9lcyBub3QgYXBwZWFyIHRvIGJlIGluc3RhbGxlZCwgc2tpcHBpbmcgRmlyZWZveC1zcGVjaWZpYyBzdGVwcy4uLicpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGFkZERvbWFpblRvSG9zdEZpbGVJZk1pc3NpbmcoZG9tYWluOiBzdHJpbmcpIHsgICAgXG4gICAgLy8gTm8gbmVlZCB0byBjaGVjayBpZiB0aGUgZG9tYWluIGlzIHByZXNlbnQsIGFzIGhvc3RpbGUgd2lsbCBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlIGRvbWFpbiBpcyBhbHJlYWR5IGluIHRoZSBob3N0IGZpbGUuXG4gICAgcnVuKGBzdWRvIFwiJHtwcm9jZXNzLmV4ZWNQYXRofVwiIFwiJHtyZXF1aXJlLnJlc29sdmUoJ2hvc3RpbGUvYmluL2NtZCcpfVwiIHNldCAxMjcuMC4wLjEgJHtkb21haW59YCk7XG4gIH1cbiAgYXN5bmMgcmVhZFByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiAoYXdhaXQgcnVuKGBzdWRvIGNhdCBcIiR7ZmlsZXBhdGh9XCJgKSkudG9TdHJpbmcoKS50cmltKCk7XG4gIH1cblxuICBhc3luYyB3cml0ZVByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZykge1xuICAgIGlmIChleGlzdHMoZmlsZXBhdGgpKSB7XG4gICAgICBhd2FpdCBydW4oYHN1ZG8gcm0gXCIke2ZpbGVwYXRofVwiYCk7XG4gICAgfVxuICAgIHdyaXRlRmlsZShmaWxlcGF0aCwgY29udGVudHMpO1xuICAgIGF3YWl0IHJ1bihgc3VkbyBjaG93biAwIFwiJHtmaWxlcGF0aH1cImApO1xuICAgIGF3YWl0IHJ1bihgc3VkbyBjaG1vZCA2MDAgXCIke2ZpbGVwYXRofVwiYCk7XG4gIH1cblxuICBwcml2YXRlIGlzRmlyZWZveEluc3RhbGxlZCgpIHtcbiAgICByZXR1cm4gZXhpc3RzKHRoaXMuRklSRUZPWF9CVU5ETEVfUEFUSCk7XG4gIH1cblxuICBwcml2YXRlIGlzTlNTSW5zdGFsbGVkKCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gcnVuKCdicmV3IGxpc3QgLTEnKS50b1N0cmluZygpLmluY2x1ZGVzKCdcXG5uc3NcXG4nKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbn07Il19