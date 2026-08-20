/**
 * @file: DesignSystemEditor.tsx
 * @description: DesignSystemEditor.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState } from "react";
import { useDesignSystem } from "../hooks/useDesignSystem";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Palette, RotateCcw, Save, Download, Upload } from "lucide-react";

export function DesignSystemEditor() {
  const {
    colors,
    typography,
    spacing,
    shadows,
    animation,
    getColor,
    applyOverrides,
    reset,
    currentOverrides,
  } = useDesignSystem();

  const [localColors, setLocalColors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const handleColorChange = (name: string, value: string) => {
    setLocalColors((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (hasChanges) {
      applyOverrides({
        colors: localColors,
        updatedAt: Date.now(),
      });
      setHasChanges(false);
      setLocalColors({});
    }
  };

  const handleReset = () => {
    reset();
    setLocalColors({});
    setHasChanges(false);
  };

  const handleExport = () => {
    const data = {
      colors: Object.fromEntries(colors.map((c) => [c.name, getColor(c.cssVar)])),
      overrides: currentOverrides,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yyc3-design-system.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.colors) {
              setLocalColors(data.colors);
              setHasChanges(true);
            }
          } catch {
            console.error("Failed to parse design system file");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-md border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Palette className="h-5 w-5" />
                设计系统
                {hasChanges && (
                  <Badge variant="outline" className="text-xs">
                    未保存
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                统一管理颜色、字体、间距等设计变量
              </CardDescription>
            </div>
            {currentOverrides && (
              <Badge variant="secondary" className="text-xs">
                已自定义
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="colors">颜色</TabsTrigger>
              <TabsTrigger value="typography">字体</TabsTrigger>
              <TabsTrigger value="spacing">间距</TabsTrigger>
              <TabsTrigger value="shadows">阴影</TabsTrigger>
              <TabsTrigger value="animation">动效</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colors.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">{color.name}</Label>
                      <code className="text-xs text-muted-foreground/60">{color.cssVar}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border border-border/50"
                        style={{ backgroundColor: localColors[color.name] || color.value }}
                      />
                      <Input
                        value={localColors[color.name] || color.value}
                        onChange={(e) => handleColorChange(color.name, e.target.value)}
                        className="bg-input-background font-mono text-xs"
                        placeholder={color.value}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground/60">{color.usage}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4 mt-4">
              <div className="space-y-4">
                {typography.map((token) => (
                  <div
                    key={token.name}
                    className="p-3 rounded-md bg-muted/30 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">{token.name}</Label>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{token.family}</span>
                        <span>·</span>
                        <span>{token.weight}</span>
                        <span>·</span>
                        <span>{token.size}</span>
                      </div>
                    </div>
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontFamily: `'${token.family}', sans-serif`,
                        fontWeight: token.weight.includes("-") ? 500 : parseInt(token.weight),
                        fontSize: token.size,
                      }}
                    >
                      {token.usage}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {spacing.map((token) => (
                  <div key={token.name} className="space-y-2 text-center">
                    <Label className="text-sm text-muted-foreground">{token.name}</Label>
                    <div className="flex justify-center">
                      <div
                        className="bg-primary/30 border border-primary/50 rounded"
                        style={{ width: token.px * 2, height: token.px * 2 }}
                      />
                    </div>
                    <code className="text-xs text-muted-foreground">
                      {token.value} ({token.px}px)
                    </code>
                    <p className="text-xs text-muted-foreground/60 truncate">{token.usage}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shadows" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shadows.map((shadow) => (
                  <div key={shadow.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground">{shadow.name}</Label>
                    </div>
                    <div
                      className="h-16 rounded-lg bg-card border border-border/30"
                      style={{ boxShadow: shadow.value }}
                    />
                    <p className="text-xs text-muted-foreground/60">{shadow.usage}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="animation" className="space-y-4 mt-4">
              <div className="space-y-4">
                {animation.map((token) => (
                  <div
                    key={token.name}
                    className="p-3 rounded-md bg-muted/30 border border-border/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">{token.name}</Label>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{token.duration}</span>
                        <span>·</span>
                        <span>{token.easing}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{token.usage}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                重置
              </Button>
              <Button variant="outline" size="sm" onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              保存更改
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DesignSystemEditor;
