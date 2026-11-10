/**
 * @file: ws-codec.d.mts
 * @description: ws-codec.mjs 的类型声明（与实现同目录，供 TS 模块解析自动匹配）
 */

export const WS_OPCODES: Readonly<{
  CONTINUATION: number;
  TEXT: number;
  BINARY: number;
  CLOSE: number;
  PING: number;
  PONG: number;
}>;

export function computeAcceptKey(secKey: string): string;
export function encodeTextFrame(text: string): Buffer;
export function encodePongFrame(payload?: Buffer): Buffer;
export function encodeCloseFrame(code?: number): Buffer;
export function createFrameDecoder(): (
  chunk: Buffer
) => Array<{ fin: boolean; opcode: number; payload: Buffer }>;
