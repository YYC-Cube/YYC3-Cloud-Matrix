/**
 * @file: xss-protection.ts
 * @description: Enhanced XSS Protection Module
 * @author: YanYuCloudCube Team
 * @version: v2.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

// @ts-ignore - Optional dependency
import DOMPurify from 'dompurify';

export class XSSProtection {
  private static instance: XSSProtection;
  private sanitizer: unknown = null;
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): XSSProtection {
    if (!XSSProtection.instance) {
      XSSProtection.instance = new XSSProtection();
    }
    return XSSProtection.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {return;}

    try {
      // @ts-ignore - Optional dependency
      const DOMPurifyModule = await import('dompurify');
      this.sanitizer = DOMPurifyModule.default as unknown as DOMPurify;
      this.isInitialized = true;
    } catch {
      console.warn('DOMPurify not available, using fallback sanitization');
      this.isInitialized = true;
    }
  }

  sanitize(input: string): string {
    if (!input) {return '';}

    if (this.sanitizer) {
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        ADD_ATTR: ['target'],
      });
    }

    return this.fallbackSanitize(input);
  }

  private fallbackSanitize(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  escapeHtml(input: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
    };

    return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
  }

  escapeJsString(input: string): string {
    return input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      // eslint-disable-next-line no-control-regex
      .replace(/\x00/g, '\\0');
  }

  escapeCss(input: string): string {
    return input
      .replace(/[^\w-]/g, (match) => `\\${match.charCodeAt(0).toString(16)} `)
      .trim();
  }

  escapeUrl(input: string): string {
    try {
      const url = new URL(input, window.location.origin);
      if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) {
        return url.toString();
      }
      return '';
    } catch {
      return '';
    }
  }

  validateInput(input: string, options: {
    maxLength?: number;
    allowedChars?: RegExp;
    pattern?: RegExp;
  } = {}): { valid: boolean; sanitized: string; error?: string } {
    const {
      maxLength = 1000,
      allowedChars = /^[\p{L}\p{N}\s\-_.@]*$/u,
      pattern,
    } = options;

    let sanitized = input.trim();

    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    if (!allowedChars.test(sanitized)) {
      sanitized = this.sanitize(sanitized);
    }

    if (pattern && !pattern.test(sanitized)) {
      return {
        valid: false,
        sanitized,
        error: 'Input does not match required pattern',
      };
    }

    return { valid: true, sanitized };
  }

  createSafeElement(tagName: string, textContent: string, attributes: Record<string, string> = {}): HTMLElement {
    const element = document.createElement(tagName);
    element.textContent = this.escapeHtml(textContent);

    Object.entries(attributes).forEach(([key, value]) => {
      if (this.isSafeAttribute(key, value)) {
        element.setAttribute(key, value);
      }
    });

    return element;
  }

  private isSafeAttribute(attrName: string, value: string): boolean {
    const safeAttrs = new Set([
      'class', 'id', 'title', 'alt', 'aria-label',
      'data-*', 'role', 'tabindex'
    ]);

    const dangerousPatterns = [
      /javascript:/i,
      /vbscript:/i,
      /on\w+/i,
      /data:\s*text\/html/i,
    ];

    if (!safeAttrs.has(attrName) && !attrName.startsWith('data-')) {
      return false;
    }

    return !dangerousPatterns.some(pattern => pattern.test(value));
  }

  setSafeInnerHTML(element: Element, html: string): void {
    if (this.sanitizer) {
      element.innerHTML = (this.sanitizer as { sanitize: (html: string) => string }).sanitize(html);
    } else {
      element.textContent = html;
    }
  }
}

export const xssProtection = XSSProtection.getInstance();
