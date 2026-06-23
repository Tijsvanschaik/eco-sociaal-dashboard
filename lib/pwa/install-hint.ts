export const INSTALL_HINT_DISMISSED_KEY = "eco-pwa-install-dismissed";
export const INSTALL_HINT_VISIT_KEY = "eco-pwa-install-visits";
export const MIN_VISITS_BEFORE_HINT = 2;

export type InstallHintInput = {
  visitCount: number;
  dismissed: boolean;
  isStandalone: boolean;
  isMobile: boolean;
};

/** Whether the soft install banner may be shown. */
export function shouldShowInstallHint(input: InstallHintInput): boolean {
  if (input.isStandalone || input.dismissed || !input.isMobile) {
    return false;
  }

  return input.visitCount >= MIN_VISITS_BEFORE_HINT;
}

export function isIosSafari(userAgent: string): boolean {
  return /iphone|ipad|ipod/i.test(userAgent) && !/crios|fxios|edgios/i.test(userAgent);
}

export function isAndroidChrome(userAgent: string): boolean {
  return /android/i.test(userAgent) && /chrome/i.test(userAgent);
}
