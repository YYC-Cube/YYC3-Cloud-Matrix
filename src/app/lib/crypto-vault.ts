/**
 * @file: crypto-vault.ts
 * @description: YYC³ 敏感数据加密库 · Web Crypto API 本地加密存储
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [lib],[security],[crypto]
 *
 * @brief: 基于 Web Crypto API 的本地敏感数据加密/解密
 *
 * @details:
 * - 使用 AES-GCM 256 位加密
 * - 密钥派生自设备指纹 + 应用盐值
 * - 适配"一人一端"安全模型
 * - 零外部依赖，纯浏览器原生 API
 *
 * @security-model:
 * - 加密密钥从不存储，每次从设备特征重新派生
 * - 同一设备同一浏览器才能解密
 * - 不同设备或不同浏览器无法读取加密数据
 */

// ============================================================
// 常量
// ============================================================

const SALT = new TextEncoder().encode("YYC3-CloudIntelli-Matrix-vault-salt-2026");
const KEY_USAGE: KeyUsage[] = ["encrypt", "decrypt"];

// ============================================================
// 设备指纹生成
// ============================================================

/**
 * 生成轻量级设备指纹
 * 基于浏览器可用的硬件/软件特征，无需额外权限
 */
async function getDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // 用户代理
  components.push(navigator.userAgent);

  // 屏幕分辨率
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 时区
  components.push(String(Intl.DateTimeFormat().resolvedOptions().timeZone));

  // 语言
  components.push(navigator.language);

  // 平台
  if (navigator.platform) {
    components.push(navigator.platform);
  }

  // 硬件并发数
  if (navigator.hardwareConcurrency) {
    components.push(String(navigator.hardwareConcurrency));
  }

  // 设备内存 (可能不可用)
  const nav = navigator as { deviceMemory?: number };
  if (nav.deviceMemory) {
    components.push(String(nav.deviceMemory));
  }

  return components.join("|");
}

// ============================================================
// 密钥派生
// ============================================================

/**
 * 从设备指纹 + 盐值派生 AES-256-GCM 密钥
 */
async function deriveKey(): Promise<CryptoKey> {
  const fingerprint = await getDeviceFingerprint();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(fingerprint),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    KEY_USAGE
  );
}

// ============================================================
// 公共 API
// ============================================================

/**
 * 加密明文字符串，返回 Base64 编码的密文（含 IV 前缀）
 *
 * @param plaintext 明文
 * @returns Base64 密文 (格式: iv[12字节] + ciphertext)
 * @throws 浏览器不支持 Web Crypto API 时抛出
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!crypto?.subtle) {
    throw new Error("[CryptoVault] Web Crypto API not available");
  }

  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM 推荐 IV 长度
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  // 拼接 iv + ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * 解密 Base64 密文，返回明文字符串
 *
 * @param encoded Base64 密文 (iv + ciphertext)
 * @returns 明文
 * @throws 密钥不匹配或数据损坏时抛出
 */
export async function decrypt(encoded: string): Promise<string> {
  if (!crypto?.subtle) {
    throw new Error("[CryptoVault] Web Crypto API not available");
  }

  const key = await deriveKey();
  const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * 检查 Web Crypto API 是否可用
 */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== "undefined" && typeof crypto.subtle !== "undefined";
}

/**
 * 安全存储 API — 封装加密 + localStorage 的读写
 */
export const secureStorage = {
  /**
   * 加密后存储到 localStorage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encrypt(value);
      localStorage.setItem(`vault:${key}`, encrypted);
    } catch (e) {
      // 降级: 直接存储 (比丢失数据好)
      console.warn(`[CryptoVault] Encryption failed for ${key}, storing as plain:`, e);
      localStorage.setItem(key, value);
    }
  },

  /**
   * 从 localStorage 读取并解密
   */
  async getItem(key: string): Promise<string | null> {
    // 优先尝试读取加密版本
    const encrypted = localStorage.getItem(`vault:${key}`);
    if (encrypted) {
      try {
        return await decrypt(encrypted);
      } catch {
        // 解密失败（设备变更等），回退到明文
        console.warn(`[CryptoVault] Decryption failed for ${key}, trying plain fallback`);
      }
    }

    // 回退到明文版本
    return localStorage.getItem(key);
  },

  /**
   * 移除存储项（加密版和明文版都清理）
   */
  removeItem(key: string): void {
    localStorage.removeItem(`vault:${key}`);
    localStorage.removeItem(key);
  },
};
