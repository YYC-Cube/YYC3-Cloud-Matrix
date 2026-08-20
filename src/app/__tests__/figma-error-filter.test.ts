/**
 * @file: figma-error-filter.test.ts
 * @description: figma-error-filter模块单元测试
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-05
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */

import { describe, it, expect } from "vitest";
import { isFigmaPlatformError } from "../lib/figma-error-filter";

describe("figma-error-filter", () => {
  describe("isFigmaPlatformError()", () => {
    describe("error name matching", () => {
      it("should return true for IframeMessageAbortError", () => {
        expect(isFigmaPlatformError("IframeMessageAbortError", "")).toBe(true);
      });

      it("should return true for IframeMessageError", () => {
        expect(isFigmaPlatformError("IframeMessageError", "")).toBe(true);
      });

      it("should return true for IframeMessageTimeoutError", () => {
        expect(isFigmaPlatformError("IframeMessageTimeoutError", "")).toBe(true);
      });

      it("should return true for AbortError with message keyword", () => {
        expect(isFigmaPlatformError("AbortError", "message aborted")).toBe(true);
      });

      it("should return true for AbortError with port keyword", () => {
        expect(isFigmaPlatformError("AbortError", "port was destroyed")).toBe(true);
      });

      it("should return true for AbortError with port in stack", () => {
        expect(
          isFigmaPlatformError("AbortError", "", undefined, "Error: port closed")
        ).toBe(true);
      });

      it("should return false for AbortError without message/port context", () => {
        expect(isFigmaPlatformError("AbortError", "some other error")).toBe(false);
      });
    });

    describe("message content matching", () => {
      it("should return true for 'message aborted'", () => {
        expect(isFigmaPlatformError("Error", "message aborted")).toBe(true);
      });

      it("should return true for 'message port was destroyed'", () => {
        expect(isFigmaPlatformError("Error", "message port was destroyed")).toBe(true);
      });

      it("should return true for 'iframemessage' in message", () => {
        expect(isFigmaPlatformError("Error", "iframemessage error")).toBe(true);
      });

      it("should return true for 'message port closed'", () => {
        expect(isFigmaPlatformError("Error", "message port closed")).toBe(true);
      });

      it("should return true for 'setImmediate$'", () => {
        expect(isFigmaPlatformError("Error", "setImmediate$ error")).toBe(true);
      });

      it("should return true for 'port was destroyed'", () => {
        expect(isFigmaPlatformError("Error", "port was destroyed")).toBe(true);
      });

      it("should return true for 'message channel'", () => {
        expect(isFigmaPlatformError("Error", "message channel error")).toBe(true);
      });

      it("should return true for 'the message port'", () => {
        expect(isFigmaPlatformError("Error", "the message port is closed")).toBe(true);
      });

      it("should return true for 'user aborted'", () => {
        expect(isFigmaPlatformError("Error", "user aborted request")).toBe(true);
      });

      it("should return false for unrelated error message", () => {
        expect(isFigmaPlatformError("Error", "network timeout")).toBe(false);
      });
    });

    describe("source file matching", () => {
      it("should return true for figma.com source", () => {
        expect(isFigmaPlatformError("Error", "", "https://figma.com/app.js")).toBe(true);
      });

      it("should return true for webpack-artifacts source", () => {
        expect(
          isFigmaPlatformError("Error", "", "webpack-artifacts/bundle.js")
        ).toBe(true);
      });

      it("should return true for figma_app source", () => {
        expect(isFigmaPlatformError("Error", "", "figma_app/main.js")).toBe(true);
      });

      it("should return true for figma- prefix source", () => {
        expect(isFigmaPlatformError("Error", "", "figma-components.js")).toBe(true);
      });

      it("should return true for /figma/ path source", () => {
        expect(isFigmaPlatformError("Error", "", "/figma/runtime.js")).toBe(true);
      });

      it("should return true for figma_infra source", () => {
        expect(isFigmaPlatformError("Error", "", "figma_infra/util.js")).toBe(true);
      });

      it("should return true for Figma chunk pattern", () => {
        expect(
          isFigmaPlatformError("Error", "", "1741-0091e26ad4c06e70.min.js")
        ).toBe(true);
      });

      it("should return false for unrelated source", () => {
        expect(isFigmaPlatformError("Error", "", "https://example.com/app.js")).toBe(
          false
        );
      });
    });

    describe("stack trace matching", () => {
      it("should return true for figma.com in stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "at https://figma.com/app.js:1:1")
        ).toBe(true);
      });

      it("should return true for webpack-artifacts in stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "at webpack-artifacts/bundle.js:1:1")
        ).toBe(true);
      });

      it("should return true for figma_app in stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "at figma_app/main.js:1:1")
        ).toBe(true);
      });

      it("should return true for setupMessageChannel in stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "at setupMessageChannel ()")
        ).toBe(true);
      });

      it("should return true for iframemessage in stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "at iframemessage.js:1:1")
        ).toBe(true);
      });

      it("should return true for figma_infra in stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "at figma_infra/util.js:1:1")
        ).toBe(true);
      });

      it("should return false for unrelated stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "at https://example.com/app.js:1:1")
        ).toBe(false);
      });
    });

    describe("combined heuristic matching", () => {
      it("should return true for abort + port in message", () => {
        expect(isFigmaPlatformError("abort", "port closed")).toBe(true);
      });

      it("should return true for abort + message in message", () => {
        expect(isFigmaPlatformError("abort", "message failed")).toBe(true);
      });

      it("should return true for abort + port in stack", () => {
        expect(isFigmaPlatformError("abort", "", undefined, "port error")).toBe(true);
      });

      it("should return false for abort without port/message", () => {
        expect(isFigmaPlatformError("abort", "timeout")).toBe(false);
      });
    });

    describe("case insensitivity", () => {
      it("should be case insensitive for error name", () => {
        expect(isFigmaPlatformError("IFRAMEMESSAGEERROR", "")).toBe(true);
      });

      it("should be case insensitive for message", () => {
        expect(isFigmaPlatformError("Error", "MESSAGE ABORTED")).toBe(true);
      });

      it("should be case insensitive for source", () => {
        expect(isFigmaPlatformError("Error", "", "FIGMA.COM")).toBe(true);
      });

      it("should be case insensitive for stack", () => {
        expect(
          isFigmaPlatformError("Error", "", undefined, "FIGMA.COM")
        ).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should return false for empty inputs", () => {
        expect(isFigmaPlatformError("", "")).toBe(false);
      });

      it("should handle undefined source and stack", () => {
        expect(isFigmaPlatformError("Error", "message aborted")).toBe(true);
      });

      it("should handle null-like values", () => {
        expect(isFigmaPlatformError("null", "null")).toBe(false);
      });

      it("should handle special characters in message", () => {
        expect(
          isFigmaPlatformError("Error", "message aborted! @#$%^&*()")
        ).toBe(true);
      });
    });
  });
});
