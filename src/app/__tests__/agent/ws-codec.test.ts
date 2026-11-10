/**
 * @file: ws-codec.test.ts
 * @description: RFC6455 WebSocket 编解码单测 — 握手应答 / 帧编解码 / 掩码校验 / TCP 分片
 */

import { describe, it, expect } from "vitest";
import {
  computeAcceptKey,
  encodeTextFrame,
  encodePongFrame,
  encodeCloseFrame,
  createFrameDecoder,
  WS_OPCODES,
} from "../../../../agent/lib/ws-codec.mjs";

/** 构造一个合法的掩码客户端帧（模拟浏览器行为） */
function maskedClientFrame(opcode: number, payload: Buffer): Buffer {
  const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
  const len = payload.length;
  let header: Buffer;
  if (len < 126) {
    header = Buffer.from([0x80 | opcode, 0x80 | len]);
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 0x80 | 126;
    header.writeUInt16BE(len, 2);
  }
  const masked = Buffer.from(payload);
  for (let i = 0; i < masked.length; i++) {
    masked[i] ^= mask[i % 4];
  }
  return Buffer.concat([header, mask, masked]);
}

describe("computeAcceptKey", () => {
  it("符合 RFC6455 §1.3 官方测试向量", () => {
    // RFC 6455 官方示例：key → accept
    expect(computeAcceptKey("dGhlIHNhbXBsZSBub25jZQ==")).toBe(
      "s3pPLMBiTxaQ9kYGzzhZRbK+xOo="
    );
  });

  it("输出为 28 字符 base64（SHA-1 摘要）", () => {
    expect(computeAcceptKey("x3JJHMbDL1EzLkh9GBhXDw==")).toMatch(
      /^[A-Za-z0-9+/]{27}=$/
    );
  });
});

describe("帧编码（服务端→客户端，不掩码）", () => {
  it("短文本帧（<126 字节）使用 2 字节头", () => {
    const frame = encodeTextFrame("hello");
    expect(frame[0]).toBe(0x80 | WS_OPCODES.TEXT);
    expect(frame[1]).toBe(5);
    expect(frame.subarray(2).toString("utf8")).toBe("hello");
  });

  it("中文文本按 UTF-8 字节长度编码", () => {
    const frame = encodeTextFrame("言语云枢");
    expect(frame[1]).toBe(12); // 4 字 × 3 字节
    expect(frame.subarray(2).toString("utf8")).toBe("言语云枢");
  });

  it("126–65535 字节使用 16 位扩展长度", () => {
    const frame = encodeTextFrame("x".repeat(300));
    expect(frame[1]).toBe(126);
    expect(frame.readUInt16BE(2)).toBe(300);
  });

  it(">65535 字节使用 64 位扩展长度", () => {
    const frame = encodeTextFrame("x".repeat(70000));
    expect(frame[1]).toBe(127);
    expect(Number(frame.readBigUInt64BE(2))).toBe(70000);
  });

  it("Close 帧携带状态码", () => {
    const frame = encodeCloseFrame(1000);
    expect(frame[0]).toBe(0x80 | WS_OPCODES.CLOSE);
    expect(frame.readUInt16BE(2)).toBe(1000);
  });

  it("Pong 帧默认空载荷", () => {
    const frame = encodePongFrame();
    expect(frame[0]).toBe(0x80 | WS_OPCODES.PONG);
    expect(frame[1]).toBe(0);
  });
});

describe("帧解码（客户端→服务端，必须掩码）", () => {
  it("解码掩码文本帧 roundtrip", () => {
    const decode = createFrameDecoder();
    const frames = decode(
      maskedClientFrame(WS_OPCODES.TEXT, Buffer.from("hello", "utf8"))
    );
    expect(frames).toHaveLength(1);
    expect(frames[0].opcode).toBe(WS_OPCODES.TEXT);
    expect(frames[0].payload.toString("utf8")).toBe("hello");
  });

  it("无掩码客户端帧直接抛错（RFC 6455 §5.3）", () => {
    const decode = createFrameDecoder();
    const raw = Buffer.from([0x81, 0x02, 0x68, 0x69]); // 未掩码 "hi"
    expect(() => decode(raw)).toThrow(/masked/);
  });

  it("处理 TCP 分片：半帧到达不产出，补全后产出", () => {
    const decode = createFrameDecoder();
    const full = maskedClientFrame(WS_OPCODES.TEXT, Buffer.from("websocket-分片"));
    const part1 = full.subarray(0, 5);
    const part2 = full.subarray(5);
    expect(decode(part1)).toHaveLength(0);
    const frames = decode(part2);
    expect(frames).toHaveLength(1);
    expect(frames[0].payload.toString("utf8")).toBe("websocket-分片");
  });

  it("处理粘包：一次到达两帧全部解出", () => {
    const decode = createFrameDecoder();
    const f1 = maskedClientFrame(WS_OPCODES.TEXT, Buffer.from("A"));
    const f2 = maskedClientFrame(WS_OPCODES.PING, Buffer.alloc(0));
    const frames = decode(Buffer.concat([f1, f2]));
    expect(frames).toHaveLength(2);
    expect(frames[0].opcode).toBe(WS_OPCODES.TEXT);
    expect(frames[1].opcode).toBe(WS_OPCODES.PING);
  });

  it("解码 16 位扩展长度的掩码帧", () => {
    const decode = createFrameDecoder();
    const payload = Buffer.alloc(200, 0x61);
    const frames = decode(maskedClientFrame(WS_OPCODES.TEXT, payload));
    expect(frames).toHaveLength(1);
    expect(frames[0].payload.length).toBe(200);
  });
});
