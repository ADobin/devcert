"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const debug_1 = tslib_1.__importDefault(require("debug"));
const command_exists_1 = require("command-exists");
const shared_1 = require("./shared");
const utils_1 = require("../utils");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const debug = debug_1.default('devcert:platforms:linux');
class LinuxPlatform {
    constructor() {
        this.FIREFOX_NSS_DIR = path_1.default.join(process.env.HOME, '.mozilla/firefox/*');
        this.CHROME_NSS_DIR = path_1.default.join(process.env.HOME, '.pki/nssdb');
        this.FIREFOX_BIN_PATH = '/usr/bin/firefox';
        this.CHROME_BIN_PATH = '/usr/bin/google-chrome';
    }
    /**
     * Linux is surprisingly difficult. There seems to be multiple system-wide
     * repositories for certs, so we copy ours to each. However, Firefox does it's
     * usual separate trust store. Plus Chrome relies on the NSS tooling (like
     * Firefox), but uses the user's NSS database, unlike Firefox (which uses a
     * separate Mozilla one). And since Chrome doesn't prompt the user with a GUI
     * flow when opening certs, if we can't use certutil to install our certificate
     * into the user's NSS database, we're out of luck.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            debug('Adding devcert root CA to Linux system-wide trust stores');
            // run(`sudo cp ${ certificatePath } /etc/ssl/certs/devcert.crt`);
            utils_1.run(`sudo cp ${certificatePath} /usr/local/share/ca-certificates/devcert.crt`);
            // run(`sudo bash -c "cat ${ certificatePath } >> /etc/ssl/certs/ca-certificates.crt"`);
            utils_1.run(`sudo update-ca-certificates`);
            if (this.isFirefoxInstalled()) {
                // Firefox
                debug('Firefox install detected: adding devcert root CA to Firefox-specific trust stores ...');
                if (!command_exists_1.sync('certutil')) {
                    if (options.skipCertutilInstall) {
                        debug('NSS tooling is not already installed, and `skipCertutil` is true, so falling back to manual certificate install for Firefox');
                        user_interface_1.default.warnFirefoxUnableToConfigure();
                    }
                    else {
                        debug('NSS tooling is not already installed. Trying to install NSS tooling now with `apt install`');
                        utils_1.run('sudo apt install libnss3-tools');
                        debug('Installing certificate into Firefox trust stores using NSS tooling');
                        yield shared_1.closeFirefox();
                        yield shared_1.addCertificateToNSSCertDB(this.FIREFOX_NSS_DIR, certificatePath, 'certutil');
                    }
                }
            }
            else {
                debug('Firefox does not appear to be installed, skipping Firefox-specific steps...');
            }
            if (this.isChromeInstalled()) {
                debug('Chrome install detected: adding devcert root CA to Chrome trust store ...');
                if (!command_exists_1.sync('certutil')) {
                    user_interface_1.default.warnChromeOnLinuxWithoutCertutil();
                }
                else {
                    yield shared_1.closeFirefox();
                    yield shared_1.addCertificateToNSSCertDB(this.CHROME_NSS_DIR, certificatePath, 'certutil');
                }
            }
            else {
                debug('Chrome does not appear to be installed, skipping Chrome-specific steps...');
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
            return (yield utils_1.run(`sudo cat ${filepath}`)).toString().trim();
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
        return fs_1.existsSync(this.FIREFOX_BIN_PATH);
    }
    isChromeInstalled() {
        return fs_1.existsSync(this.CHROME_BIN_PATH);
    }
}
exports.default = LinuxPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGludXguanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2RsYW5ub3llL3Byb2plY3RzL2RldmNlcnQvIiwic291cmNlcyI6WyJwbGF0Zm9ybXMvbGludXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsd0RBQXdCO0FBQ3hCLDJCQUFzRTtBQUN0RSwwREFBZ0M7QUFDaEMsbURBQXVEO0FBQ3ZELHFDQUFtRTtBQUNuRSxvQ0FBK0I7QUFFL0IsK0VBQW1DO0FBR25DLE1BQU0sS0FBSyxHQUFHLGVBQVcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBRXJEO0lBQUE7UUFFVSxvQkFBZSxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUNwRSxtQkFBYyxHQUFHLGNBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDM0QscUJBQWdCLEdBQUcsa0JBQWtCLENBQUM7UUFDdEMsb0JBQWUsR0FBRyx3QkFBd0IsQ0FBQztJQThFckQsQ0FBQztJQTVFQzs7Ozs7Ozs7T0FRRztJQUNHLGdCQUFnQixDQUFDLGVBQXVCLEVBQUUsVUFBbUIsRUFBRTs7WUFFbkUsS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7WUFDbEUsa0VBQWtFO1lBQ2xFLFdBQUcsQ0FBQyxXQUFZLGVBQWdCLCtDQUErQyxDQUFDLENBQUM7WUFDakYsd0ZBQXdGO1lBQ3hGLFdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1lBRW5DLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7Z0JBQzdCLFVBQVU7Z0JBQ1YsS0FBSyxDQUFDLHVGQUF1RixDQUFDLENBQUM7Z0JBQy9GLElBQUksQ0FBQyxxQkFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUM5QixJQUFJLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRTt3QkFDL0IsS0FBSyxDQUFDLDZIQUE2SCxDQUFDLENBQUM7d0JBQ3JJLHdCQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztxQkFDbkM7eUJBQU07d0JBQ0wsS0FBSyxDQUFDLDRGQUE0RixDQUFDLENBQUM7d0JBQ3BHLFdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO3dCQUN0QyxLQUFLLENBQUMsb0VBQW9FLENBQUMsQ0FBQzt3QkFDNUUsTUFBTSxxQkFBWSxFQUFFLENBQUM7d0JBQ3JCLE1BQU0sa0NBQXlCLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7cUJBQ3BGO2lCQUNGO2FBQ0Y7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7YUFDdEY7WUFFRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO2dCQUM1QixLQUFLLENBQUMsMkVBQTJFLENBQUMsQ0FBQztnQkFDbkYsSUFBSSxDQUFDLHFCQUFhLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQzlCLHdCQUFFLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQztpQkFDdkM7cUJBQU07b0JBQ0wsTUFBTSxxQkFBWSxFQUFFLENBQUM7b0JBQ3JCLE1BQU0sa0NBQXlCLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQ25GO2FBQ0Y7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLDJFQUEyRSxDQUFDLENBQUM7YUFDcEY7UUFDSCxDQUFDO0tBQUE7SUFFSyw0QkFBNEIsQ0FBQyxNQUFjOztZQUMvQywySEFBMkg7WUFDM0gsV0FBRyxDQUFDLFNBQVMsT0FBTyxDQUFDLFFBQVEsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLG1CQUFtQixNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3BHLENBQUM7S0FBQTtJQUVLLGlCQUFpQixDQUFDLFFBQWdCOztZQUN0QyxPQUFPLENBQUMsTUFBTSxXQUFHLENBQUMsWUFBWSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0QsQ0FBQztLQUFBO0lBRUssa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjs7WUFDekQsSUFBSSxlQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3BCLE1BQU0sV0FBRyxDQUFDLFlBQVksUUFBUSxHQUFHLENBQUMsQ0FBQzthQUNwQztZQUNELGtCQUFTLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLE1BQU0sV0FBRyxDQUFDLGlCQUFpQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sV0FBRyxDQUFDLG1CQUFtQixRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLENBQUM7S0FBQTtJQUdPLGtCQUFrQjtRQUN4QixPQUFPLGVBQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU8saUJBQWlCO1FBQ3ZCLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBRUY7QUFuRkQsZ0NBbUZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGlzdHNTeW5jIGFzIGV4aXN0cywgd3JpdGVGaWxlU3luYyBhcyB3cml0ZUZpbGUgfSBmcm9tICdmcyc7XG5pbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IHsgc3luYyBhcyBjb21tYW5kRXhpc3RzIH0gZnJvbSAnY29tbWFuZC1leGlzdHMnO1xuaW1wb3J0IHsgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQiwgY2xvc2VGaXJlZm94IH0gZnJvbSAnLi9zaGFyZWQnO1xuaW1wb3J0IHsgcnVuIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4uL2luZGV4JztcbmltcG9ydCBVSSBmcm9tICcuLi91c2VyLWludGVyZmFjZSc7XG5pbXBvcnQgeyBQbGF0Zm9ybSB9IGZyb20gJy4nO1xuXG5jb25zdCBkZWJ1ZyA9IGNyZWF0ZURlYnVnKCdkZXZjZXJ0OnBsYXRmb3JtczpsaW51eCcpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW51eFBsYXRmb3JtIGltcGxlbWVudHMgUGxhdGZvcm0ge1xuXG4gIHByaXZhdGUgRklSRUZPWF9OU1NfRElSID0gcGF0aC5qb2luKHByb2Nlc3MuZW52LkhPTUUsICcubW96aWxsYS9maXJlZm94LyonKTtcbiAgcHJpdmF0ZSBDSFJPTUVfTlNTX0RJUiA9IHBhdGguam9pbihwcm9jZXNzLmVudi5IT01FLCAnLnBraS9uc3NkYicpO1xuICBwcml2YXRlIEZJUkVGT1hfQklOX1BBVEggPSAnL3Vzci9iaW4vZmlyZWZveCc7XG4gIHByaXZhdGUgQ0hST01FX0JJTl9QQVRIID0gJy91c3IvYmluL2dvb2dsZS1jaHJvbWUnO1xuXG4gIC8qKlxuICAgKiBMaW51eCBpcyBzdXJwcmlzaW5nbHkgZGlmZmljdWx0LiBUaGVyZSBzZWVtcyB0byBiZSBtdWx0aXBsZSBzeXN0ZW0td2lkZVxuICAgKiByZXBvc2l0b3JpZXMgZm9yIGNlcnRzLCBzbyB3ZSBjb3B5IG91cnMgdG8gZWFjaC4gSG93ZXZlciwgRmlyZWZveCBkb2VzIGl0J3NcbiAgICogdXN1YWwgc2VwYXJhdGUgdHJ1c3Qgc3RvcmUuIFBsdXMgQ2hyb21lIHJlbGllcyBvbiB0aGUgTlNTIHRvb2xpbmcgKGxpa2VcbiAgICogRmlyZWZveCksIGJ1dCB1c2VzIHRoZSB1c2VyJ3MgTlNTIGRhdGFiYXNlLCB1bmxpa2UgRmlyZWZveCAod2hpY2ggdXNlcyBhXG4gICAqIHNlcGFyYXRlIE1vemlsbGEgb25lKS4gQW5kIHNpbmNlIENocm9tZSBkb2Vzbid0IHByb21wdCB0aGUgdXNlciB3aXRoIGEgR1VJXG4gICAqIGZsb3cgd2hlbiBvcGVuaW5nIGNlcnRzLCBpZiB3ZSBjYW4ndCB1c2UgY2VydHV0aWwgdG8gaW5zdGFsbCBvdXIgY2VydGlmaWNhdGVcbiAgICogaW50byB0aGUgdXNlcidzIE5TUyBkYXRhYmFzZSwgd2UncmUgb3V0IG9mIGx1Y2suXG4gICAqL1xuICBhc3luYyBhZGRUb1RydXN0U3RvcmVzKGNlcnRpZmljYXRlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIGRlYnVnKCdBZGRpbmcgZGV2Y2VydCByb290IENBIHRvIExpbnV4IHN5c3RlbS13aWRlIHRydXN0IHN0b3JlcycpO1xuICAgIC8vIHJ1bihgc3VkbyBjcCAkeyBjZXJ0aWZpY2F0ZVBhdGggfSAvZXRjL3NzbC9jZXJ0cy9kZXZjZXJ0LmNydGApO1xuICAgIHJ1bihgc3VkbyBjcCAkeyBjZXJ0aWZpY2F0ZVBhdGggfSAvdXNyL2xvY2FsL3NoYXJlL2NhLWNlcnRpZmljYXRlcy9kZXZjZXJ0LmNydGApO1xuICAgIC8vIHJ1bihgc3VkbyBiYXNoIC1jIFwiY2F0ICR7IGNlcnRpZmljYXRlUGF0aCB9ID4+IC9ldGMvc3NsL2NlcnRzL2NhLWNlcnRpZmljYXRlcy5jcnRcImApO1xuICAgIHJ1bihgc3VkbyB1cGRhdGUtY2EtY2VydGlmaWNhdGVzYCk7XG5cbiAgICBpZiAodGhpcy5pc0ZpcmVmb3hJbnN0YWxsZWQoKSkge1xuICAgICAgLy8gRmlyZWZveFxuICAgICAgZGVidWcoJ0ZpcmVmb3ggaW5zdGFsbCBkZXRlY3RlZDogYWRkaW5nIGRldmNlcnQgcm9vdCBDQSB0byBGaXJlZm94LXNwZWNpZmljIHRydXN0IHN0b3JlcyAuLi4nKTtcbiAgICAgIGlmICghY29tbWFuZEV4aXN0cygnY2VydHV0aWwnKSkge1xuICAgICAgICBpZiAob3B0aW9ucy5za2lwQ2VydHV0aWxJbnN0YWxsKSB7XG4gICAgICAgICAgZGVidWcoJ05TUyB0b29saW5nIGlzIG5vdCBhbHJlYWR5IGluc3RhbGxlZCwgYW5kIGBza2lwQ2VydHV0aWxgIGlzIHRydWUsIHNvIGZhbGxpbmcgYmFjayB0byBtYW51YWwgY2VydGlmaWNhdGUgaW5zdGFsbCBmb3IgRmlyZWZveCcpO1xuICAgICAgICAgIFVJLndhcm5GaXJlZm94VW5hYmxlVG9Db25maWd1cmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWJ1ZygnTlNTIHRvb2xpbmcgaXMgbm90IGFscmVhZHkgaW5zdGFsbGVkLiBUcnlpbmcgdG8gaW5zdGFsbCBOU1MgdG9vbGluZyBub3cgd2l0aCBgYXB0IGluc3RhbGxgJyk7XG4gICAgICAgICAgcnVuKCdzdWRvIGFwdCBpbnN0YWxsIGxpYm5zczMtdG9vbHMnKTtcbiAgICAgICAgICBkZWJ1ZygnSW5zdGFsbGluZyBjZXJ0aWZpY2F0ZSBpbnRvIEZpcmVmb3ggdHJ1c3Qgc3RvcmVzIHVzaW5nIE5TUyB0b29saW5nJyk7XG4gICAgICAgICAgYXdhaXQgY2xvc2VGaXJlZm94KCk7XG4gICAgICAgICAgYXdhaXQgYWRkQ2VydGlmaWNhdGVUb05TU0NlcnREQih0aGlzLkZJUkVGT1hfTlNTX0RJUiwgY2VydGlmaWNhdGVQYXRoLCAnY2VydHV0aWwnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZWJ1ZygnRmlyZWZveCBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgaW5zdGFsbGVkLCBza2lwcGluZyBGaXJlZm94LXNwZWNpZmljIHN0ZXBzLi4uJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWVJbnN0YWxsZWQoKSkge1xuICAgICAgZGVidWcoJ0Nocm9tZSBpbnN0YWxsIGRldGVjdGVkOiBhZGRpbmcgZGV2Y2VydCByb290IENBIHRvIENocm9tZSB0cnVzdCBzdG9yZSAuLi4nKTtcbiAgICAgIGlmICghY29tbWFuZEV4aXN0cygnY2VydHV0aWwnKSkge1xuICAgICAgICBVSS53YXJuQ2hyb21lT25MaW51eFdpdGhvdXRDZXJ0dXRpbCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgY2xvc2VGaXJlZm94KCk7XG4gICAgICAgIGF3YWl0IGFkZENlcnRpZmljYXRlVG9OU1NDZXJ0REIodGhpcy5DSFJPTUVfTlNTX0RJUiwgY2VydGlmaWNhdGVQYXRoLCAnY2VydHV0aWwnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ0Nocm9tZSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgaW5zdGFsbGVkLCBza2lwcGluZyBDaHJvbWUtc3BlY2lmaWMgc3RlcHMuLi4nKTtcbiAgICB9XG4gIH1cbiAgXG4gIGFzeW5jIGFkZERvbWFpblRvSG9zdEZpbGVJZk1pc3NpbmcoZG9tYWluOiBzdHJpbmcpIHtcbiAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGlmIHRoZSBkb21haW4gaXMgcHJlc2VudCwgYXMgaG9zdGlsZSB3aWxsIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSB0aGUgZG9tYWluIGlzIGFscmVhZHkgaW4gdGhlIGhvc3QgZmlsZS5cbiAgICBydW4oYHN1ZG8gXCIke3Byb2Nlc3MuZXhlY1BhdGh9XCIgXCIke3JlcXVpcmUucmVzb2x2ZSgnaG9zdGlsZS9iaW4vY21kJyl9XCIgc2V0IDEyNy4wLjAuMSAke2RvbWFpbn1gKTtcbiAgfVxuICBcbiAgYXN5bmMgcmVhZFByb3RlY3RlZEZpbGUoZmlsZXBhdGg6IHN0cmluZykge1xuICAgIHJldHVybiAoYXdhaXQgcnVuKGBzdWRvIGNhdCAke2ZpbGVwYXRofWApKS50b1N0cmluZygpLnRyaW0oKTtcbiAgfVxuXG4gIGFzeW5jIHdyaXRlUHJvdGVjdGVkRmlsZShmaWxlcGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKSB7XG4gICAgaWYgKGV4aXN0cyhmaWxlcGF0aCkpIHtcbiAgICAgIGF3YWl0IHJ1bihgc3VkbyBybSBcIiR7ZmlsZXBhdGh9XCJgKTtcbiAgICB9XG4gICAgd3JpdGVGaWxlKGZpbGVwYXRoLCBjb250ZW50cyk7XG4gICAgYXdhaXQgcnVuKGBzdWRvIGNob3duIDAgXCIke2ZpbGVwYXRofVwiYCk7XG4gICAgYXdhaXQgcnVuKGBzdWRvIGNobW9kIDYwMCBcIiR7ZmlsZXBhdGh9XCJgKTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBpc0ZpcmVmb3hJbnN0YWxsZWQoKSB7XG4gICAgcmV0dXJuIGV4aXN0cyh0aGlzLkZJUkVGT1hfQklOX1BBVEgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0Nocm9tZUluc3RhbGxlZCgpIHtcbiAgICByZXR1cm4gZXhpc3RzKHRoaXMuQ0hST01FX0JJTl9QQVRIKTtcbiAgfVxuXG59Il19