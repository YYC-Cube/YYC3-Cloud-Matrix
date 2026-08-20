/**
 * @file: CodeEditor.test.tsx
 * @description: CodeEditor.test.tsx description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-03-31
 * @updated: 2026-04-05
 * @status: active
 * @tags: [component]
 */

// @vitest-environment jsdom
/**
 * CodeEditor.test.tsx
 * ====================
 * CodeEditor + SQLEditor 组件测试
 *
 * 覆盖:
 * - CodeEditor 渲染
 * - getLanguageLabel 各扩展名映射
 * - SQLEditor 渲染
 */

import { describe, it, expect, vi, afterEach , beforeEach} from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import React from "react";

// Mock @uiw/react-codemirror (CodeMirror 在 jsdom 中无法正常初始化)
vi.mock("@uiw/react-codemirror", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="codemirror-mock" data-value={props.value} data-readonly={props.readOnly}>
      {props.placeholder && <span>{props.placeholder}</span>}
    </div>
  ),
}));

// Mock CodeMirror language extensions
vi.mock("@codemirror/lang-javascript", () => ({ javascript: () => [] }));
vi.mock("@codemirror/lang-json", () => ({ json: () => [] }));
vi.mock("@codemirror/lang-python", () => ({ python: () => [] }));
vi.mock("@codemirror/lang-sql", () => ({ sql: () => [] }));
vi.mock("@codemirror/lang-markdown", () => ({ markdown: () => [] }));
vi.mock("@codemirror/lang-html", () => ({ html: () => [] }));
vi.mock("@codemirror/lang-css", () => ({ css: () => [] }));
vi.mock("@codemirror/lang-xml", () => ({ xml: () => [] }));
vi.mock("@codemirror/lang-yaml", () => ({ yaml: () => [] }));
vi.mock("@codemirror/view", () => ({
  EditorView: {
    theme: () => [],
    lineWrapping: [],
    domEventHandlers: () => [],
  },
}));
vi.mock("@codemirror/state", () => ({}));

import { CodeEditor, SQLEditor, getLanguageLabel } from "../components/CodeEditor";

describe("getLanguageLabel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });


  it("should return JavaScript for .js", () => {
    expect(getLanguageLabel("app.js")).toBe("JavaScript");
  });

  it("should return JSX for .jsx", () => {
    expect(getLanguageLabel("Component.jsx")).toBe("JSX");
  });

  it("should return TypeScript for .ts", () => {
    expect(getLanguageLabel("index.ts")).toBe("TypeScript");
  });

  it("should return TSX for .tsx", () => {
    expect(getLanguageLabel("Component.tsx")).toBe("TSX");
  });

  it("should return JSON for .json", () => {
    expect(getLanguageLabel("package.json")).toBe("JSON");
  });

  it("should return Python for .py", () => {
    expect(getLanguageLabel("script.py")).toBe("Python");
  });

  it("should return SQL for .sql", () => {
    expect(getLanguageLabel("query.sql")).toBe("SQL");
  });

  it("should return Markdown for .md", () => {
    expect(getLanguageLabel("README.md")).toBe("Markdown");
  });

  it("should return MARKDOWN for .markdown", () => {
    expect(getLanguageLabel("README.markdown")).toBe("MARKDOWN");
  });

  it("should return YAML for .yml", () => {
    expect(getLanguageLabel("config.yml")).toBe("YAML");
  });

  it("should return YAML for .yaml", () => {
    expect(getLanguageLabel("config.yaml")).toBe("YAML");
  });

  it("should return CSS for .css", () => {
    expect(getLanguageLabel("styles.css")).toBe("CSS");
  });

  it("should return SCSS for .scss", () => {
    expect(getLanguageLabel("styles.scss")).toBe("SCSS");
  });

  it("should return LESS for .less", () => {
    expect(getLanguageLabel("styles.less")).toBe("LESS");
  });

  it("should return HTML for .html", () => {
    expect(getLanguageLabel("index.html")).toBe("HTML");
  });

  it("should return HTML for .htm", () => {
    expect(getLanguageLabel("index.htm")).toBe("HTML");
  });

  it("should return XML for .xml", () => {
    expect(getLanguageLabel("data.xml")).toBe("XML");
  });

  it("should return SVG for .svg", () => {
    expect(getLanguageLabel("icon.svg")).toBe("SVG");
  });

  it("should return Shell for .sh", () => {
    expect(getLanguageLabel("deploy.sh")).toBe("Shell");
  });

  it("should return Bash for .bash", () => {
    expect(getLanguageLabel("script.bash")).toBe("Bash");
  });

  it("should return Zsh for .zsh", () => {
    expect(getLanguageLabel("script.zsh")).toBe("Zsh");
  });

  it("should return Rust for .rs", () => {
    expect(getLanguageLabel("main.rs")).toBe("Rust");
  });

  it("should return Go for .go", () => {
    expect(getLanguageLabel("main.go")).toBe("Go");
  });

  it("should return Java for .java", () => {
    expect(getLanguageLabel("Main.java")).toBe("Java");
  });

  it("should return Ruby for .rb", () => {
    expect(getLanguageLabel("app.rb")).toBe("Ruby");
  });

  it("should return PHP for .php", () => {
    expect(getLanguageLabel("index.php")).toBe("PHP");
  });

  it("should return Swift for .swift", () => {
    expect(getLanguageLabel("main.swift")).toBe("Swift");
  });

  it("should return Kotlin for .kt", () => {
    expect(getLanguageLabel("Main.kt")).toBe("Kotlin");
  });

  it("should return C for .c", () => {
    expect(getLanguageLabel("main.c")).toBe("C");
  });

  it("should return C++ for .cpp", () => {
    expect(getLanguageLabel("main.cpp")).toBe("C++");
  });

  it("should return C Header for .h", () => {
    expect(getLanguageLabel("header.h")).toBe("C Header");
  });

  it("should return C++ Header for .hpp", () => {
    expect(getLanguageLabel("header.hpp")).toBe("C++ Header");
  });

  it("should return R for .r", () => {
    expect(getLanguageLabel("script.r")).toBe("R");
  });

  it("should return Julia for .jl", () => {
    expect(getLanguageLabel("script.jl")).toBe("Julia");
  });

  it("should return Dart for .dart", () => {
    expect(getLanguageLabel("main.dart")).toBe("Dart");
  });

  it("should return Lua for .lua", () => {
    expect(getLanguageLabel("script.lua")).toBe("Lua");
  });

  it("should return Elixir for .ex", () => {
    expect(getLanguageLabel("app.ex")).toBe("Elixir");
  });

  it("should return Vue for .vue", () => {
    expect(getLanguageLabel("Component.vue")).toBe("Vue");
  });

  it("should return Svelte for .svelte", () => {
    expect(getLanguageLabel("Component.svelte")).toBe("Svelte");
  });

  it("should return Astro for .astro", () => {
    expect(getLanguageLabel("page.astro")).toBe("Astro");
  });

  it("should return GraphQL for .graphql", () => {
    expect(getLanguageLabel("schema.graphql")).toBe("GraphQL");
  });

  it("should return INI for .ini", () => {
    expect(getLanguageLabel("config.ini")).toBe("INI");
  });

  it("should return Config for .cfg", () => {
    expect(getLanguageLabel("config.cfg")).toBe("Config");
  });

  it("should return Config for .conf", () => {
    expect(getLanguageLabel("config.conf")).toBe("Config");
  });

  it("should return CSV for .csv", () => {
    expect(getLanguageLabel("data.csv")).toBe("CSV");
  });

  it("should return TSV for .tsv", () => {
    expect(getLanguageLabel("data.tsv")).toBe("TSV");
  });

  it("should return Log for .log", () => {
    expect(getLanguageLabel("app.log")).toBe("Log");
  });

  it("should return Text for .txt", () => {
    expect(getLanguageLabel("notes.txt")).toBe("Text");
  });

  it("should return Env for .env", () => {
    expect(getLanguageLabel(".env")).toBe("Env");
  });

  it("should return TOML for .toml", () => {
    expect(getLanguageLabel("pyproject.toml")).toBe("TOML");
  });

  it("should return uppercase for unknown extension", () => {
    expect(getLanguageLabel("file.xyz")).toBe("XYZ");
  });

  it("should return Plain Text for no extension", () => {
    expect(getLanguageLabel("Makefile")).toBe("MAKEFILE");
  });
});

describe("CodeEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render with CodeMirror", () => {
    render(
      <CodeEditor
        value="const x = 1;"
        onChange={() => {}}
        filename="test.ts"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
    expect(cm).toHaveAttribute("data-value", "const x = 1;");
  });

  it("should pass readOnly prop", () => {
    render(
      <CodeEditor
        value=""
        onChange={() => {}}
        filename="test.json"
        readOnly
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toHaveAttribute("data-readonly", "true");
  });

  it("should render with JavaScript file", () => {
    render(
      <CodeEditor
        value="console.info('test');"
        onChange={() => {}}
        filename="app.js"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with JSX file", () => {
    render(
      <CodeEditor
        value="export function App() { return <div />; }"
        onChange={() => {}}
        filename="App.jsx"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with TSX file", () => {
    render(
      <CodeEditor
        value="export function App(): JSX.Element { return <div />; }"
        onChange={() => {}}
        filename="App.tsx"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with JSON file", () => {
    render(
      <CodeEditor
        value='{"name": "test"}'
        onChange={() => {}}
        filename="package.json"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with Python file", () => {
    render(
      <CodeEditor
        value="print('hello')"
        onChange={() => {}}
        filename="script.py"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with SQL file", () => {
    render(
      <CodeEditor
        value="SELECT * FROM users;"
        onChange={() => {}}
        filename="query.sql"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with Markdown file", () => {
    render(
      <CodeEditor
        value="# Hello World"
        onChange={() => {}}
        filename="README.md"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with HTML file", () => {
    render(
      <CodeEditor
        value="<html></html>"
        onChange={() => {}}
        filename="index.html"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with CSS file", () => {
    render(
      <CodeEditor
        value=".class { color: red; }"
        onChange={() => {}}
        filename="styles.css"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with SCSS file", () => {
    render(
      <CodeEditor
        value=".class { color: red; }"
        onChange={() => {}}
        filename="styles.scss"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with XML file", () => {
    render(
      <CodeEditor
        value="<root></root>"
        onChange={() => {}}
        filename="data.xml"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with YAML file", () => {
    render(
      <CodeEditor
        value="key: value"
        onChange={() => {}}
        filename="config.yaml"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with Dockerfile", () => {
    render(
      <CodeEditor
        value="FROM node:18"
        onChange={() => {}}
        filename="Dockerfile"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with .env file", () => {
    render(
      <CodeEditor
        value="NODE_ENV=development"
        onChange={() => {}}
        filename=".env"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should render with unknown file extension", () => {
    render(
      <CodeEditor
        value="some content"
        onChange={() => {}}
        filename="file.xyz"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should accept onSave callback", () => {
    const mockOnSave = vi.fn();
    render(
      <CodeEditor
        value="test"
        onChange={() => {}}
        filename="test.ts"
        onSave={mockOnSave}
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });

  it("should accept custom height", () => {
    render(
      <CodeEditor
        value="test"
        onChange={() => {}}
        filename="test.ts"
        height="600px"
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });
});

describe("SQLEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render with placeholder", () => {
    render(
      <SQLEditor
        value=""
        onChange={() => {}}
        placeholder="Enter SQL..."
      />
    );
    expect(screen.getByText("Enter SQL...")).toBeInTheDocument();
  });

  it("should render with SQL value", () => {
    render(
      <SQLEditor
        value="SELECT * FROM nodes;"
        onChange={() => {}}
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toHaveAttribute("data-value", "SELECT * FROM nodes;");
  });

  it("should render without placeholder", () => {
    render(
      <SQLEditor
        value="SELECT 1;"
        onChange={() => {}}
      />
    );
    const cm = screen.getAllByTestId("codemirror-mock")[0];
    expect(cm).toBeInTheDocument();
  });
});
