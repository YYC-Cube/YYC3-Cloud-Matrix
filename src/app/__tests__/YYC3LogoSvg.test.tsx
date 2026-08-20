// @vitest-environment jsdom
/**
 * YYC3LogoSvg.test.tsx
 * ====================
 * YYC3LogoSvg 组件测试
 *
 * 覆盖范围:
 * - 基础渲染（logo 图片、alt 文本）
 * - 文本显示/隐藏
 * - 自定义 className 和 style
 * - 默认尺寸与自定义尺寸
 * - pickLogo 尺寸范围覆盖
 * - draggable 属性
 * - object-contain class
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { YYC3LogoSvg } from "../modules/shared/YYC3LogoSvg";

describe("YYC3LogoSvg", () => {
  // ----------------------------------------------------------
  // 基础渲染
  // ----------------------------------------------------------

  describe("基础渲染", () => {
    it("应渲染 logo 图片并带有正确的 alt 文本", () => {
      render(<YYC3LogoSvg />);
      const img = screen.getByAltText("YYC³ Logo");
      expect(img).toBeInTheDocument();
      expect(img.tagName).toBe("IMG");
    });

    it("当 showText 为 true 时应渲染 YYC³ 文本", () => {
      render(<YYC3LogoSvg showText={true} />);
      expect(screen.getByText("YYC³")).toBeInTheDocument();
    });

    it("当 showText 为 false 时不应渲染文本", () => {
      render(<YYC3LogoSvg showText={false} />);
      expect(screen.queryByText("YYC³")).not.toBeInTheDocument();
    });

    it("showText 默认应为 true", () => {
      render(<YYC3LogoSvg />);
      expect(screen.getByText("YYC³")).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------
  // 样式与类名
  // ----------------------------------------------------------

  describe("样式与类名", () => {
    it("应应用自定义 className", () => {
      const { container } = render(<YYC3LogoSvg className="custom-logo-class" />);
      const div = container.firstChild as HTMLElement;
      expect(div.className).toContain("custom-logo-class");
    });

    it("应应用自定义 style", () => {
      const { container } = render(
        <YYC3LogoSvg style={{ marginTop: "20px", opacity: 0.5 }} />
      );
      const div = container.firstChild as HTMLElement;
      expect(div.style.marginTop).toBe("20px");
      expect(div.style.opacity).toBe("0.5");
    });
  });

  // ----------------------------------------------------------
  // 尺寸
  // ----------------------------------------------------------

  describe("尺寸", () => {
    it("默认 size 应为 40", () => {
      render(<YYC3LogoSvg />);
      const img = screen.getByAltText("YYC³ Logo");
      expect(img.getAttribute("width")).toBe("40");
      expect(img.getAttribute("height")).toBe("40");
    });

    it("应使用自定义 size", () => {
      render(<YYC3LogoSvg size={128} />);
      const img = screen.getByAltText("YYC³ Logo");
      expect(img.getAttribute("width")).toBe("128");
      expect(img.getAttribute("height")).toBe("128");
    });
  });

  // ----------------------------------------------------------
  // pickLogo 尺寸范围
  // ----------------------------------------------------------

  describe("pickLogo 尺寸范围", () => {
    const logoTestCases = [
      { size: 16, desc: "size=16" },
      { size: 32, desc: "size=32" },
      { size: 48, desc: "size=48" },
      { size: 64, desc: "size=64" },
      { size: 96, desc: "size=96" },
      { size: 128, desc: "size=128" },
      { size: 192, desc: "size=192" },
      { size: 256, desc: "size=256" },
      { size: 512, desc: "size=512" },
    ];

    logoTestCases.forEach(({ size, desc }) => {
      it(`应在 ${desc} 时正确渲染`, () => {
        render(<YYC3LogoSvg size={size} />);
        const img = screen.getByAltText("YYC³ Logo");
        expect(img).toBeInTheDocument();
        expect(img.getAttribute("width")).toBe(String(size));
        expect(img.getAttribute("height")).toBe(String(size));
      });
    });
  });

  // ----------------------------------------------------------
  // 图片属性
  // ----------------------------------------------------------

  describe("图片属性", () => {
    it("图片应设置 draggable={false}", () => {
      render(<YYC3LogoSvg />);
      const img = screen.getByAltText("YYC³ Logo");
      expect(img.getAttribute("draggable")).toBe("false");
    });

    it("图片应有 object-contain class", () => {
      render(<YYC3LogoSvg />);
      const img = screen.getByAltText("YYC³ Logo");
      expect(img.className).toContain("object-contain");
    });
  });
});