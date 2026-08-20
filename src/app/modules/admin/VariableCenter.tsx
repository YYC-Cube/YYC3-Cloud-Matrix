/**
 * @file: VariableCenter.tsx
 * @description: VariableCenter.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-06
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState, useEffect, useMemo } from "react";
import {
  VARIABLE_DEFINITIONS,
  getVariablesByCategory,
  getGroupsByCategory,
  getVariableValue,
  setVariableValue,
  resetVariableValue,
  resetAllVariableValues,
  validateVariable,
  exportVariables,
  importVariables,
  getAllCategories,
  type VariableCategory,
  type VariableDefinition,
  type VariableValue,
  type VariableExport,
} from "../../config/variable-center";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Server,
  User,
  Key,
  Box,
  Settings,
  Globe,
  Save,
  RotateCcw,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

const CATEGORY_ICONS: Record<VariableCategory, React.ElementType> = {
  device: Server,
  user: User,
  secret: Key,
  model: Box,
  system: Settings,
  env: Globe,
};

const CATEGORY_LABELS: Record<VariableCategory, string> = {
  device: "设备变量",
  user: "人员变量",
  secret: "密钥变量",
  model: "模型配置",
  system: "系统配置",
  env: "环境变量",
};

export function VariableCenter() {
  const [activeCategory, setActiveCategory] = useState<VariableCategory>("device");
  const [values, setValues] = useState<Record<string, VariableValue>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadValues();
  }, []);

  const loadValues = () => {
    const loadedValues: Record<string, VariableValue> = {};
    for (const def of VARIABLE_DEFINITIONS) {
      loadedValues[def.key] = getVariableValue(def.key);
    }
    setValues(loadedValues);
    setHasChanges(false);
  };

  const categories = getAllCategories();
  const currentGroups = useMemo(() => getGroupsByCategory(activeCategory), [activeCategory]);
  const currentVariables = useMemo(() => {
    let vars = getVariablesByCategory(activeCategory);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      vars = vars.filter(
        (v) =>
          v.key.toLowerCase().includes(query) ||
          v.label.toLowerCase().includes(query) ||
          v.labelCn.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
      );
    }
    return vars;
  }, [activeCategory, searchQuery]);

  const groupedVariables = useMemo(() => {
    const groups: Record<string, VariableDefinition[]> = {};
    for (const v of currentVariables) {
      if (!groups[v.group]) {
        groups[v.group] = [];
      }
      groups[v.group].push(v);
    }
    return groups;
  }, [currentVariables]);

  const handleValueChange = (key: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
        source: "user",
        updatedAt: Date.now(),
      },
    }));
    setHasChanges(true);

    const validation = validateVariable(key, value);
    setValidationErrors((prev) => ({
      ...prev,
      [key]: validation.valid ? [] : validation.errors,
    }));
  };

  const handleSave = () => {
    for (const [key, val] of Object.entries(values)) {
      if (val.source === "user") {
        setVariableValue(key, val.value, "user");
      }
    }
    setHasChanges(false);
  };

  const handleReset = (key: string) => {
    resetVariableValue(key);
    const def = VARIABLE_DEFINITIONS.find((v) => v.key === key);
    if (def) {
      setValues((prev) => ({
        ...prev,
        [key]: {
          key,
          value: def.defaultValue,
          source: "default",
          updatedAt: Date.now(),
        },
      }));
    }
    setHasChanges(true);
  };

  const handleResetAll = () => {
    if (confirm("确定要重置所有变量吗？此操作不可撤销。")) {
      resetAllVariableValues();
      loadValues();
    }
  };

  const handleExport = () => {
    const data = exportVariables(true);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yyc3-variables-${new Date().toISOString().split("T")[0]}.json`;
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
            const data = JSON.parse(event.target?.result as string) as VariableExport;
            const result = importVariables(data, true);
            alert(`导入完成: ${result.imported} 个变量已导入, ${result.skipped} 个跳过`);
            loadValues();
          } catch {
            alert("导入失败: 文件格式不正确");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderVariableInput = (def: VariableDefinition) => {
    const currentValue = values[def.key]?.value ?? def.defaultValue;
    const showPassword = showPasswords[def.key];
    const errors = validationErrors[def.key] || [];

    const inputClassName = `bg-input-background ${errors.length > 0 ? "border-destructive" : ""}`;

    switch (def.type) {
      case "boolean":
        return (
          <Switch
            checked={currentValue as boolean}
            onCheckedChange={(checked) => handleValueChange(def.key, checked)}
            disabled={!def.editable}
          />
        );

      case "select":
        return (
          <Select
            value={String(currentValue)}
            onValueChange={(value) => handleValueChange(def.key, value)}
            disabled={!def.editable}
          >
            <SelectTrigger className={inputClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {def.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            type="number"
            value={String(currentValue ?? "")}
            onChange={(e) => handleValueChange(def.key, parseFloat(e.target.value) || 0)}
            placeholder={def.placeholder}
            disabled={!def.editable}
            className={inputClassName}
            min={def.validation?.min}
            max={def.validation?.max}
          />
        );

      case "password":
        return (
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={String(currentValue ?? "")}
              onChange={(e) => handleValueChange(def.key, e.target.value)}
              placeholder={def.placeholder}
              disabled={!def.editable}
              className={`${inputClassName} pr-10`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility(def.key)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        );

      case "url":
        return (
          <Input
            type="url"
            value={String(currentValue ?? "")}
            onChange={(e) => handleValueChange(def.key, e.target.value)}
            placeholder={def.placeholder}
            disabled={!def.editable}
            className={inputClassName}
          />
        );

      case "json":
        return (
          <textarea
            value={typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleValueChange(def.key, parsed);
              } catch {
                // Keep as string if invalid JSON
              }
            }}
            placeholder={def.placeholder}
            disabled={!def.editable}
            className={`${inputClassName} w-full min-h-[100px] rounded-md border border-border bg-input-background p-2 text-sm font-mono`}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={String(currentValue ?? "")}
            onChange={(e) => handleValueChange(def.key, e.target.value)}
            placeholder={def.placeholder}
            disabled={!def.editable}
            className={inputClassName}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div>
          <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6" />
            变量中心
            {hasChanges && (
              <Badge variant="outline" className="text-xs">
                未保存
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">统一管理设备、人员、密钥、模型、系统等所有变量</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索变量..."
              className="pl-8 w-48 bg-input-background"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetAll}>
            <RotateCcw className="h-4 w-4 mr-2" />
            重置全部
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-48 border-r border-border/30 flex flex-col">
          <div className="p-3 border-b border-border/30">
            <h3 className="text-sm font-medium text-muted-foreground">变量分类</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                const count = getVariablesByCategory(cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{CATEGORY_LABELS[cat]}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {currentGroups.map((group) => {
            const groupVars = groupedVariables[group.id] || [];
            if (groupVars.length === 0) {return null;}

            return (
              <Card key={group.id} className="mb-4 bg-card/50 backdrop-blur-md border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">{group.nameCn}</CardTitle>
                  <CardDescription className="text-sm">{group.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {groupVars.map((def) => {
                      const _currentValue = values[def.key]?.value ?? def.defaultValue;
                      const errors = validationErrors[def.key] || [];
                      const hasError = errors.length > 0;

                      return (
                        <div key={def.key} className="grid grid-cols-[1fr_2fr_auto] gap-4 items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium">{def.labelCn}</Label>
                              {def.required && (
                                <Badge variant="outline" className="text-xs">
                                  必填
                                </Badge>
                              )}
                              {def.sensitive && (
                                <Badge variant="secondary" className="text-xs">
                                  敏感
                                </Badge>
                              )}
                              {!def.editable && (
                                <Badge variant="outline" className="text-xs">
                                  只读
                                </Badge>
                              )}
                            </div>
                            <code className="text-xs text-muted-foreground/60">{def.key}</code>
                            <p className="text-xs text-muted-foreground">{def.description}</p>
                          </div>

                          <div className="space-y-1">
                            {renderVariableInput(def)}
                            {hasError && (
                              <div className="flex items-center gap-1 text-destructive text-xs">
                                <AlertCircle className="h-3 w-3" />
                                {errors[0]}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {values[def.key]?.source !== "default" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReset(def.key)}
                                disabled={!def.editable}
                                title="重置为默认值"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                            {values[def.key]?.source === "user" && (
                              <div title="已修改">
                                <CheckCircle className="h-4 w-4 text-success" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {currentVariables.length === 0 && (
            <Card className="bg-card/50 backdrop-blur-md border-border/50">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">未找到变量</h3>
                <p className="text-sm text-muted-foreground/60 mt-2">
                  {searchQuery ? "尝试其他搜索词" : "该分类下暂无变量"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default VariableCenter;
