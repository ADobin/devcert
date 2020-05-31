export interface UserInterface {
    getWindowsEncryptionPassword(): Promise<string>;
    warnChromeOnLinuxWithoutCertutil(): Promise<void>;
    closeFirefoxBeforeContinuing(): Promise<void>;
    warnFirefoxUnableToConfigure(): void;
}
declare const DefaultUI: UserInterface;
export default DefaultUI;
