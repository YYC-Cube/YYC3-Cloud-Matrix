/**
 * @file: PageConfigEditor.tsx
 * @description: PageConfigEditor.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState, useEffect } from "react";
import { usePageConfig, usePageConfigById } from "../../hooks/usePageConfig";
import type { PageConfig } from "../../config";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { RotateCcw, Save, Eye, Code } from "lucide-react";

interface PageConfigEditorProps {
  pageId?: string;
  onSave?: (config: PageConfig) => void;
  onReset?: () => void;
}

export function PageConfigEditor({ pageId, onSave, onReset }: PageConfigEditorProps) {
  const routeConfig = usePageConfig();
  const pageConfig = usePageConfigById(pageId || "");
  
  const { config, updateConfig, resetConfig, isEditable, storageKeys } = pageId 
    ? pageConfig 
    : routeConfig;
  const [localConfig, setLocalConfig] = useState<Partial<PageConfig>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig({});
      setHasChanges(false);
    }
  }, [config]);

  const handleUpdate = (key: keyof PageConfig, value: unknown) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (config && hasChanges) {
      updateConfig(localConfig);
      onSave?.({ ...config, ...localConfig });
      setHasChanges(false);
      setLocalConfig({});
    }
  };

  const handleReset = () => {
    resetConfig();
    onReset?.();
    setLocalConfig({});
    setHasChanges(false);
  };

  const handleExportConfig = () => {
    if (config) {
      const data = JSON.stringify(config, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${config.id}-config.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!config) {
    return (
      <Card className="bg-card/50 backdrop-blur-md border-border/50">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">请选择一个页面进行配置</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-md border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium text-foreground">
                {config.title}
                {hasChanges && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    未保存
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {config.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {config.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                v{config.version}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="layout">布局</TabsTrigger>
              <TabsTrigger value="header">头部</TabsTrigger>
              <TabsTrigger value="sidebar">导航</TabsTrigger>
              <TabsTrigger value="storage">存储</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">显示头部</Label>
                  <Switch
                    checked={localConfig.layout?.showHeader ?? config.layout.showHeader}
                    onCheckedChange={(checked) =>
                      handleUpdate("layout", { ...config.layout, showHeader: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">显示侧边栏</Label>
                  <Switch
                    checked={localConfig.layout?.showSidebar ?? config.layout.showSidebar}
                    onCheckedChange={(checked) =>
                      handleUpdate("layout", { ...config.layout, showSidebar: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">最大宽度</Label>
                  <Select
                    value={localConfig.layout?.maxWidth ?? config.layout.maxWidth}
                    onValueChange={(value) =>
                      handleUpdate("layout", { ...config.layout, maxWidth: value as PageConfig["layout"]["maxWidth"] })
                    }
                    disabled={!isEditable}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">小 (sm)</SelectItem>
                      <SelectItem value="md">中 (md)</SelectItem>
                      <SelectItem value="lg">大 (lg)</SelectItem>
                      <SelectItem value="xl">超大 (xl)</SelectItem>
                      <SelectItem value="2xl">极大 (2xl)</SelectItem>
                      <SelectItem value="full">全宽 (full)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">内边距</Label>
                  <Select
                    value={localConfig.layout?.padding ?? config.layout.padding}
                    onValueChange={(value) =>
                      handleUpdate("layout", { ...config.layout, padding: value as PageConfig["layout"]["padding"] })
                    }
                    disabled={!isEditable}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">无</SelectItem>
                      <SelectItem value="sm">小</SelectItem>
                      <SelectItem value="md">中</SelectItem>
                      <SelectItem value="lg">大</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">可滚动</Label>
                  <Switch
                    checked={localConfig.layout?.scrollable ?? config.layout.scrollable}
                    onCheckedChange={(checked) =>
                      handleUpdate("layout", { ...config.layout, scrollable: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">显示底部导航</Label>
                  <Switch
                    checked={localConfig.layout?.showBottomNav ?? config.layout.showBottomNav}
                    onCheckedChange={(checked) =>
                      handleUpdate("layout", { ...config.layout, showBottomNav: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="header" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">显示标题</Label>
                  <Switch
                    checked={localConfig.header?.showTitle ?? config.header.showTitle}
                    onCheckedChange={(checked) =>
                      handleUpdate("header", { ...config.header, showTitle: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">显示返回按钮</Label>
                  <Switch
                    checked={localConfig.header?.showBackButton ?? config.header.showBackButton}
                    onCheckedChange={(checked) =>
                      handleUpdate("header", { ...config.header, showBackButton: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">显示操作按钮</Label>
                  <Switch
                    checked={localConfig.header?.showActions ?? config.header.showActions}
                    onCheckedChange={(checked) =>
                      handleUpdate("header", { ...config.header, showActions: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">粘性头部</Label>
                  <Switch
                    checked={localConfig.header?.sticky ?? config.header.sticky}
                    onCheckedChange={(checked) =>
                      handleUpdate("header", { ...config.header, sticky: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">标题字号</Label>
                  <Select
                    value={localConfig.header?.fontSize ?? config.header.fontSize}
                    onValueChange={(value) =>
                      handleUpdate("header", { ...config.header, fontSize: value as PageConfig["header"]["fontSize"] })
                    }
                    disabled={!isEditable}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">小</SelectItem>
                      <SelectItem value="md">中</SelectItem>
                      <SelectItem value="lg">大</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sidebar" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">显示在导航</Label>
                  <Switch
                    checked={localConfig.sidebar?.showInNav ?? config.sidebar.showInNav}
                    onCheckedChange={(checked) =>
                      handleUpdate("sidebar", { ...config.sidebar, showInNav: checked })
                    }
                    disabled={!isEditable}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">导航顺序</Label>
                  <Input
                    type="number"
                    value={localConfig.sidebar?.navOrder ?? config.sidebar.navOrder}
                    onChange={(e) =>
                      handleUpdate("sidebar", { ...config.sidebar, navOrder: parseInt(e.target.value) || 0 })
                    }
                    disabled={!isEditable}
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label className="text-sm text-muted-foreground">导航分组</Label>
                  <Input
                    value={localConfig.sidebar?.navGroup ?? config.sidebar.navGroup}
                    onChange={(e) =>
                      handleUpdate("sidebar", { ...config.sidebar, navGroup: e.target.value })
                    }
                    disabled={!isEditable}
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label className="text-sm text-muted-foreground">徽章文本</Label>
                  <Input
                    value={localConfig.sidebar?.badge ?? config.sidebar.badge ?? ""}
                    onChange={(e) =>
                      handleUpdate("sidebar", { ...config.sidebar, badge: e.target.value || undefined })
                    }
                    disabled={!isEditable}
                    placeholder="可选"
                    className="bg-input-background"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="storage" className="space-y-4 mt-4">
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">存储键</Label>
                {storageKeys.length > 0 ? (
                  <div className="space-y-2">
                    {storageKeys.map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/30"
                      >
                        <code className="text-xs text-muted-foreground">{key}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const value = localStorage.getItem(key);
                            if (value) {
                              console.info(`${key}:`, JSON.parse(value));
                            }
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">此页面无存储键</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!isEditable}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                重置
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportConfig}
              >
                <Code className="h-4 w-4 mr-2" />
                导出
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || !isEditable}
            >
              <Save className="h-4 w-4 mr-2" />
              保存更改
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PageConfigEditor;
