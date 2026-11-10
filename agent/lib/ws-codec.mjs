// ============================================================
// YYC³（YanYuCloudCube™ · 注册商标）
// 言启象限 | 语枢未来 · Words Initiate Quadrants, Language Serves as Core for Future
// 万象归元于云枢 | 深栈智启新纪元
// All things converge in cloud pivot; Deep stacks ignite a new era of intelligence
// ============================================================
// Copyright (c) 2026 YanYuCloudCube™（YYC³）| admin@0379.email
// ============================================================

/**
 * @file: ws-codec.mjs
 * @description: RFC6455 WebSocket 编解码 — 零依赖服务端实现（握手 / 帧编解码 / 分片缓冲）
 * @author: YYC³ Team
 * @version: v1.0.0
 * @created: 2026-11-10
 * @status: active
 * @tags: [agent],[websocket],[codec]
 *
 * @brief: 仅实现 yyc3-agent 所需的服务端侧子集：
 * - Sec-WebSocket-Accept 握手应答
 * - 服务端→客户端 文本/关闭/pong 帧编码（不掩码，RFC 6455 §5.1）
 * - 客户端→服务端 帧解码（必须掩码，支持 16/64 位扩展长度与跨 TCP 分片）
 * - 控制帧：ping → pong、close 正常关闭
 *
 * @exports: computeAcceptKey, encodeTextFrame, encodePongFrame, encodeCloseFrame,
 *           createFrameDecoder, WS_OPCODES
 */

import { createHash } from "node:crypto";

/** RFC6455 §1.3 固定 GUID */
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

export const WS_OPCODES = Object.freeze({
  CONTINUATION: 0x0,
  TEXT: 0x1,
  BINARY: 0x2,
  CLOSE: 0x8,
  PING: 0x9,
  PONG: 0xa,
});

/**
 * 计算 Sec-WebSocket-Accept 应答值
 * @param {string} secKey 客户端 Sec-WebSocket-Key
 * @returns {string} base64 编码的 SHA-1 摘要
 */
export function computeAcceptKey(secKey) {
  return createHash("sha1").update(secKey + WS_GUID).digest("base64");
}

/**
 * 编码服务端帧（不掩码）
 * @param {number} opcode
 * @param {Buffer} payload
 * @returns {Buffer}
 */
function encodeFrame(opcode, payload) {
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.from([0x80 | opcode, len]);
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

/** 编码文本帧（服务端→客户端） */
export function encodeTextFrame(text) {
  return encodeFrame(WS_OPCODES.TEXT, Buffer.from(text, "utf8"));
}

/** 编码 Pong 帧 */
export function encodePongFrame(payload = Buffer.alloc(0)) {
  return encodeFrame(WS_OPCODES.PONG, payload);
}

/** 编码 Close 帧 */
export function encodeCloseFrame(code = 1000) {
  const payload = Buffer.alloc(2);
  payload.writeUInt16BE(code, 0);
  return encodeFrame(WS_OPCODES.CLOSE, payload);
}

/**
 * 创建增量帧解码器（处理 TCP 分片与粘包）
 * 返回函数：喂入 Buffer → 吐出完整帧数组 [{ opcode, payload }]
 * 客户端帧必须带掩码（RFC 6455 §5.3），无掩码帧直接抛错
 */
export function createFrameDecoder() {
  let buffer = Buffer.alloc(0);

  return function decode(chunk) {
    buffer = buffer.length === 0 ? chunk : Buffer.concat([buffer, chunk]);
    const frames = [];

    while (true) {
      if (buffer.length < 2) { break; }
      const fin = (buffer[0] & 0x80) !== 0;
      const opcode = buffer[0] & 0x0f;
      const masked = (buffer[1] & 0x80) !== 0;
      let len = buffer[1] & 0x7f;
      let offset = 2;

      if (len === 126) {
        if (buffer.length < offset + 2) { break; }
        len = buffer.readUInt16BE(offset);
        offset += 2;
      } else if (len === 127) {
        if (buffer.length < offset + 8) { break; }
        const big = buffer.readBigUInt64BE(offset);
        if (big > BigInt(Number.MAX_SAFE_INTEGER)) {
          throw new Error("WS frame too large");
        }
        len = Number(big);
        offset += 8;
      }

      const maskLen = masked ? 4 : 0;
      if (buffer.length < offset + maskLen + len) { break; }

      if (!masked) {
        throw new Error("Client frame must be masked (RFC 6455 §5.3)");
      }

      const mask = buffer.subarray(offset, offset + 4);
      offset += 4;
      const payload = Buffer.from(buffer.subarray(offset, offset + len));
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= mask[i % 4];
      }
      offset += len;
      buffer = buffer.subarray(offset);

      // 本项目消息均为单帧文本；分片帧按到达顺序原样上报，由上层决定
      frames.push({ fin, opcode, payload });
    }

    return frames;
  };
}
