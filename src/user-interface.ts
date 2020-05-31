import passwordPrompt from 'password-prompt';

export interface UserInterface {
  getWindowsEncryptionPassword(): Promise<string>;
  warnChromeOnLinuxWithoutCertutil(): Promise<void>;
  closeFirefoxBeforeContinuing(): Promise<void>;
  warnFirefoxUnableToConfigure(): void;
  }

const DefaultUI: UserInterface = {
  async getWindowsEncryptionPassword() {
    return await passwordPrompt('devcert password (http://bit.ly/devcert-what-password?): ');
  },
  async warnChromeOnLinuxWithoutCertutil() {
    console.warn(`
WARNING: It looks like you have Chrome installed, but you specified
'skipCertutilInstall: true'. Unfortunately, without installing
certutil, it's impossible get Chrome to trust devcert's certificates
The certificates will work, but Chrome will continue to warn you that
they are untrusted.
    `);
  },
  async closeFirefoxBeforeContinuing() {
    console.log('Please close Firefox before continuing');
  },
  warnFirefoxUnableToConfigure() {
    console.warn(`WARNING: If Firefox is installed installed, devcert
was unable to get Firefox to trust the generated certificate.`);
  }
}

export default DefaultUI;