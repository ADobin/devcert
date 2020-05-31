"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const fs_1 = require("fs");
const utils_1 = require("../utils");
const user_interface_1 = tslib_1.__importDefault(require("../user-interface"));
const debug = debug_1.default('devcert:platforms:windows');
let encryptionKey;
class WindowsPlatform {
    /**
     * Windows is at least simple. Like macOS, most applications will delegate to
     * the system trust store, which is updated with the confusingly named
     * `certutil` exe (not the same as the NSS/Mozilla certutil). Firefox does it's
     * own thing as usual, and getting a copy of NSS certutil onto the Windows
     * machine to try updating the Firefox store is basically a nightmare, so we
     * don't even try it - we just bail out to the GUI.
     */
    addToTrustStores(certificatePath, options = {}) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // IE, Chrome, system utils
            debug('adding devcert root to Windows OS trust store');
            try {
                utils_1.run(`certutil -addstore -user root ${certificatePath}`);
            }
            catch (e) {
                e.output.map((buffer) => {
                    if (buffer) {
                        console.log(buffer.toString());
                    }
                });
            }
            debug('adding devcert root to Firefox trust store');
            // Firefox (don't even try NSS certutil, no easy install for Windows)
            user_interface_1.default.warnFirefoxUnableToConfigure();
        });
    }
    addDomainToHostFileIfMissing(domain) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield utils_1.sudo(`"${process.execPath}" "${require.resolve('hostile/bin/cmd')}" set 127.0.0.1 ${domain}`);
        });
    }
    readProtectedFile(filepath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!encryptionKey) {
                encryptionKey = yield user_interface_1.default.getWindowsEncryptionPassword();
            }
            // Try to decrypt the file
            try {
                return this.decrypt(fs_1.readFileSync(filepath, 'utf8'), encryptionKey);
            }
            catch (e) {
                // If it's a bad password, clear the cached copy and retry
                if (e.message.indexOf('bad decrypt') >= -1) {
                    encryptionKey = null;
                    return yield this.readProtectedFile(filepath);
                }
                throw e;
            }
        });
    }
    writeProtectedFile(filepath, contents) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!encryptionKey) {
                encryptionKey = yield user_interface_1.default.getWindowsEncryptionPassword();
            }
            let encryptedContents = this.encrypt(contents, encryptionKey);
            fs_1.writeFileSync(filepath, encryptedContents);
        });
    }
    encrypt(text, key) {
        let cipher = crypto_1.default.createCipher('aes256', new Buffer(key));
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    }
    decrypt(encrypted, key) {
        let decipher = crypto_1.default.createDecipher('aes256', new Buffer(key));
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    }
}
exports.default = WindowsPlatform;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luMzIuanMiLCJzb3VyY2VSb290IjoiL1VzZXJzL2RsYW5ub3llL3Byb2plY3RzL2RldmNlcnQvIiwic291cmNlcyI6WyJwbGF0Zm9ybXMvd2luMzIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMERBQWdDO0FBQ2hDLDREQUE0QjtBQUM1QiwyQkFBa0U7QUFHbEUsb0NBQXFDO0FBQ3JDLCtFQUFtQztBQUVuQyxNQUFNLEtBQUssR0FBRyxlQUFXLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUV2RCxJQUFJLGFBQXFCLENBQUM7QUFFMUI7SUFFRTs7Ozs7OztPQU9HO0lBQ0csZ0JBQWdCLENBQUMsZUFBdUIsRUFBRSxVQUFtQixFQUFFOztZQUNuRSwyQkFBMkI7WUFDM0IsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUE7WUFDdEQsSUFBSTtnQkFDRixXQUFHLENBQUMsaUNBQWtDLGVBQWdCLEVBQUUsQ0FBQyxDQUFDO2FBQzNEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRTtvQkFDOUIsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztxQkFDaEM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7YUFDSjtZQUNELEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFBO1lBQ25ELHFFQUFxRTtZQUVyRSx3QkFBRSxDQUFDLDRCQUE0QixFQUFFLENBQUM7UUFDcEMsQ0FBQztLQUFBO0lBRUssNEJBQTRCLENBQUMsTUFBYzs7WUFDN0MsTUFBTSxZQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDeEcsQ0FBQztLQUFBO0lBRUssaUJBQWlCLENBQUMsUUFBZ0I7O1lBQ3RDLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ2xCLGFBQWEsR0FBRyxNQUFNLHdCQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQzthQUN6RDtZQUNELDBCQUEwQjtZQUMxQixJQUFJO2dCQUNGLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUM1RDtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLDBEQUEwRDtnQkFDMUQsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtvQkFDMUMsYUFBYSxHQUFHLElBQUksQ0FBQztvQkFDckIsT0FBTyxNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDL0M7Z0JBQ0QsTUFBTSxDQUFDLENBQUM7YUFDVDtRQUNILENBQUM7S0FBQTtJQUVLLGtCQUFrQixDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7O1lBQ3pELElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ2xCLGFBQWEsR0FBRyxNQUFNLHdCQUFFLENBQUMsNEJBQTRCLEVBQUUsQ0FBQzthQUN6RDtZQUNELElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDOUQsa0JBQUssQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNyQyxDQUFDO0tBQUE7SUFFTyxPQUFPLENBQUMsSUFBWSxFQUFFLEdBQVc7UUFDdkMsSUFBSSxNQUFNLEdBQUcsZ0JBQU0sQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRU8sT0FBTyxDQUFDLFNBQWlCLEVBQUUsR0FBVztRQUM1QyxJQUFJLFFBQVEsR0FBRyxnQkFBTSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoRSxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVFLENBQUM7Q0FFRjtBQW5FRCxrQ0FtRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY3JlYXRlRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luYyBhcyB3cml0ZSwgcmVhZEZpbGVTeW5jIGFzIHJlYWQgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IHsgUGxhdGZvcm0gfSBmcm9tICcuJztcbmltcG9ydCB7IHJ1biwgc3VkbyB9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCBVSSBmcm9tICcuLi91c2VyLWludGVyZmFjZSc7XG5cbmNvbnN0IGRlYnVnID0gY3JlYXRlRGVidWcoJ2RldmNlcnQ6cGxhdGZvcm1zOndpbmRvd3MnKTtcblxubGV0IGVuY3J5cHRpb25LZXk6IHN0cmluZztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2luZG93c1BsYXRmb3JtIGltcGxlbWVudHMgUGxhdGZvcm0ge1xuXG4gIC8qKlxuICAgKiBXaW5kb3dzIGlzIGF0IGxlYXN0IHNpbXBsZS4gTGlrZSBtYWNPUywgbW9zdCBhcHBsaWNhdGlvbnMgd2lsbCBkZWxlZ2F0ZSB0b1xuICAgKiB0aGUgc3lzdGVtIHRydXN0IHN0b3JlLCB3aGljaCBpcyB1cGRhdGVkIHdpdGggdGhlIGNvbmZ1c2luZ2x5IG5hbWVkXG4gICAqIGBjZXJ0dXRpbGAgZXhlIChub3QgdGhlIHNhbWUgYXMgdGhlIE5TUy9Nb3ppbGxhIGNlcnR1dGlsKS4gRmlyZWZveCBkb2VzIGl0J3NcbiAgICogb3duIHRoaW5nIGFzIHVzdWFsLCBhbmQgZ2V0dGluZyBhIGNvcHkgb2YgTlNTIGNlcnR1dGlsIG9udG8gdGhlIFdpbmRvd3NcbiAgICogbWFjaGluZSB0byB0cnkgdXBkYXRpbmcgdGhlIEZpcmVmb3ggc3RvcmUgaXMgYmFzaWNhbGx5IGEgbmlnaHRtYXJlLCBzbyB3ZVxuICAgKiBkb24ndCBldmVuIHRyeSBpdCAtIHdlIGp1c3QgYmFpbCBvdXQgdG8gdGhlIEdVSS5cbiAgICovXG4gIGFzeW5jIGFkZFRvVHJ1c3RTdG9yZXMoY2VydGlmaWNhdGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIElFLCBDaHJvbWUsIHN5c3RlbSB1dGlsc1xuICAgIGRlYnVnKCdhZGRpbmcgZGV2Y2VydCByb290IHRvIFdpbmRvd3MgT1MgdHJ1c3Qgc3RvcmUnKVxuICAgIHRyeSB7XG4gICAgICBydW4oYGNlcnR1dGlsIC1hZGRzdG9yZSAtdXNlciByb290ICR7IGNlcnRpZmljYXRlUGF0aCB9YCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5vdXRwdXQubWFwKChidWZmZXI6IEJ1ZmZlcikgPT4ge1xuICAgICAgICBpZiAoYnVmZmVyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYnVmZmVyLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgZGVidWcoJ2FkZGluZyBkZXZjZXJ0IHJvb3QgdG8gRmlyZWZveCB0cnVzdCBzdG9yZScpXG4gICAgLy8gRmlyZWZveCAoZG9uJ3QgZXZlbiB0cnkgTlNTIGNlcnR1dGlsLCBubyBlYXN5IGluc3RhbGwgZm9yIFdpbmRvd3MpXG4gICAgXG4gICAgVUkud2FybkZpcmVmb3hVbmFibGVUb0NvbmZpZ3VyZSgpO1xuICB9XG5cbiAgYXN5bmMgYWRkRG9tYWluVG9Ib3N0RmlsZUlmTWlzc2luZyhkb21haW46IHN0cmluZykge1xuICAgICAgYXdhaXQgc3VkbyhgXCIke3Byb2Nlc3MuZXhlY1BhdGh9XCIgXCIke3JlcXVpcmUucmVzb2x2ZSgnaG9zdGlsZS9iaW4vY21kJyl9XCIgc2V0IDEyNy4wLjAuMSAke2RvbWFpbn1gKTtcbiAgfVxuXG4gIGFzeW5jIHJlYWRQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmICghZW5jcnlwdGlvbktleSkge1xuICAgICAgZW5jcnlwdGlvbktleSA9IGF3YWl0IFVJLmdldFdpbmRvd3NFbmNyeXB0aW9uUGFzc3dvcmQoKTtcbiAgICB9XG4gICAgLy8gVHJ5IHRvIGRlY3J5cHQgdGhlIGZpbGVcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVjcnlwdChyZWFkKGZpbGVwYXRoLCAndXRmOCcpLCBlbmNyeXB0aW9uS2V5KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJZiBpdCdzIGEgYmFkIHBhc3N3b3JkLCBjbGVhciB0aGUgY2FjaGVkIGNvcHkgYW5kIHJldHJ5XG4gICAgICBpZiAoZS5tZXNzYWdlLmluZGV4T2YoJ2JhZCBkZWNyeXB0JykgPj0gLTEpIHtcbiAgICAgICAgZW5jcnlwdGlvbktleSA9IG51bGw7XG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJlYWRQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgd3JpdGVQcm90ZWN0ZWRGaWxlKGZpbGVwYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpIHtcbiAgICBpZiAoIWVuY3J5cHRpb25LZXkpIHtcbiAgICAgIGVuY3J5cHRpb25LZXkgPSBhd2FpdCBVSS5nZXRXaW5kb3dzRW5jcnlwdGlvblBhc3N3b3JkKCk7XG4gICAgfVxuICAgIGxldCBlbmNyeXB0ZWRDb250ZW50cyA9IHRoaXMuZW5jcnlwdChjb250ZW50cywgZW5jcnlwdGlvbktleSk7XG4gICAgd3JpdGUoZmlsZXBhdGgsIGVuY3J5cHRlZENvbnRlbnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgZW5jcnlwdCh0ZXh0OiBzdHJpbmcsIGtleTogc3RyaW5nKSB7XG4gICAgbGV0IGNpcGhlciA9IGNyeXB0by5jcmVhdGVDaXBoZXIoJ2FlczI1NicsIG5ldyBCdWZmZXIoa2V5KSk7XG4gICAgcmV0dXJuIGNpcGhlci51cGRhdGUodGV4dCwgJ3V0ZjgnLCAnaGV4JykgKyBjaXBoZXIuZmluYWwoJ2hleCcpO1xuICB9XG5cbiAgcHJpdmF0ZSBkZWNyeXB0KGVuY3J5cHRlZDogc3RyaW5nLCBrZXk6IHN0cmluZykge1xuICAgIGxldCBkZWNpcGhlciA9IGNyeXB0by5jcmVhdGVEZWNpcGhlcignYWVzMjU2JywgbmV3IEJ1ZmZlcihrZXkpKTtcbiAgICByZXR1cm4gZGVjaXBoZXIudXBkYXRlKGVuY3J5cHRlZCwgJ2hleCcsICd1dGY4JykgKyBkZWNpcGhlci5maW5hbCgndXRmOCcpO1xuICB9XG5cbn0iXX0=