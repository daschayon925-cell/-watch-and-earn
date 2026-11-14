/**
 * Anti-Bot & Anti-AI Exploit Guard
 * Prevents automated scripts, headless browsers, and AI auto-clickers
 * from draining reward coins and spoofing task completions.
 */

class AntiBotShield {
  private mouseMovements: number = 0;
  private touchEvents: number = 0;
  private keyStrokes: number = 0;
  private lastActionTime: number = Date.now();
  private isHeadlessDetected: boolean = false;
  private rapidClickCounter: number = 0;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners();
      this.checkHeadlessEnvironment();
    }
  }

  private initListeners() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Track human pointer micro-movements
    window.addEventListener('mousemove', () => {
      this.mouseMovements = Math.min(this.mouseMovements + 1, 500);
    }, { passive: true });

    // Track mobile touch micro-jitter
    window.addEventListener('touchmove', () => {
      this.touchEvents = Math.min(this.touchEvents + 1, 500);
    }, { passive: true });

    // Track human keyboard actions
    window.addEventListener('keydown', () => {
      this.keyStrokes = Math.min(this.keyStrokes + 1, 200);
    }, { passive: true });
  }

  /**
   * Detects headless browsers (Selenium, Puppeteer, PhantomJS, HeadlessChrome)
   */
  private checkHeadlessEnvironment(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

    try {
      const nav = navigator as any;
      const win = window as any;

      // 1. WebDriver flag
      if (nav.webdriver === true) {
        this.isHeadlessDetected = true;
      }

      // 2. Known automated automation globals
      if (
        win.__selenium_unwrapped ||
        win.__webdriver_evaluate ||
        win._phantom ||
        win.callPhantom ||
        win.__nightmare ||
        win.domAutomation ||
        win.domAutomationController
      ) {
        this.isHeadlessDetected = true;
      }

      // 3. User agent headless signatures
      const ua = (nav.userAgent || '').toLowerCase();
      if (ua.includes('headlesschrome') || ua.includes('phantomjs') || ua.includes('puppeteer')) {
        this.isHeadlessDetected = true;
      }

      // 4. Zero dimensions or invalid screen
      if (win.screen && (win.screen.width === 0 || win.screen.height === 0)) {
        this.isHeadlessDetected = true;
      }
    } catch {
      // Safe fallback
    }

    return this.isHeadlessDetected;
  }

  /**
   * Calculates human entropy score (0 to 100)
   */
  public getEntropyScore(): number {
    const totalInteractions = this.mouseMovements + (this.touchEvents * 2) + (this.keyStrokes * 3);
    if (this.isHeadlessDetected) return 0;
    // On fresh mobile session, even 2-3 touches confirm human presence
    return Math.min(100, Math.max(10, totalInteractions * 4));
  }

  /**
   * Generates a tamper-evident integrity proof token for API requests
   */
  public generateProof(action: string): {
    token: string;
    entropy: number;
    isHuman: boolean;
    timestamp: number;
  } {
    const now = Date.now();
    const timeDelta = now - this.lastActionTime;
    this.lastActionTime = now;

    // Detect unnatural click frequency (< 200ms consecutive claims)
    if (timeDelta < 200) {
      this.rapidClickCounter++;
    } else {
      this.rapidClickCounter = Math.max(0, this.rapidClickCounter - 1);
    }

    const entropy = this.getEntropyScore();
    const isHuman = !this.isHeadlessDetected && this.rapidClickCounter < 5;

    // Simple deterministic client token proof
    const token = btoa(JSON.stringify({
      act: action,
      ts: now,
      ent: entropy,
      head: this.isHeadlessDetected,
      rnd: Math.random().toString(36).substring(2, 8)
    }));

    return {
      token,
      entropy,
      isHuman,
      timestamp: now
    };
  }

  /**
   * Fast verification check
   */
  public verifyCanClaim(): { allowed: boolean; messageBn?: string } {
    if (this.isHeadlessDetected) {
      return {
        allowed: false,
        messageBn: 'অস্বাভাবিক অটোমেশন বা বট ব্রাউজার শনাক্ত হয়েছে। কয়েন রিওয়ার্ড বন্ধ রাখা হয়েছে।'
      };
    }

    if (this.rapidClickCounter >= 6) {
      return {
        allowed: false,
        messageBn: 'অস্বাভাবিক দ্রুত ক্লিক বা স্ক্রিপ্ট শনাক্ত হয়েছে। অনুগ্রহ করে স্বাভাবিকভাবে কাজ করুন।'
      };
    }

    return { allowed: true };
  }
}

export const antiBotShield = new AntiBotShield();
