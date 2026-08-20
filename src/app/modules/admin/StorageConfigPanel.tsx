/**
 * @file: StorageConfigPanel.tsx
 * @description: StorageConfigPanel.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Slider } from "../../components/ui/slider";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { DatabaseConnectionPanel } from "../ops/DatabaseConnectionPanel";
import { useI18n } from "../../hooks/useI18n";
import type { StorageConfig, StorageType } from "../../types/storage";
import type { DatabaseConfig } from "../../../database/types";

interface StorageConfigPanelProps {
  config: StorageConfig;
  onConfigChange: (config: StorageConfig) => void;
  onSave: () => void;
  isSaving?: boolean;
  error?: string;
}

export function StorageConfigPanel({ 
  config, 
  onConfigChange, 
  onSave, 
  isSaving = false, 
  error 
}: StorageConfigPanelProps) {
  const { t } = useI18n();
  const [localConfig, setLocalConfig] = useState<StorageConfig>(config);
  const [_databaseConfig, setDatabaseConfig] = useState<DatabaseConfig | undefined>(config.database);

  useEffect(() => {
    setLocalConfig(config);
    setDatabaseConfig(config.database);
  }, [config]);

  const handleStorageTypeChange = (value: StorageType) => {
    setLocalConfig(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSyncIntervalChange = (value: number[]) => {
    setLocalConfig(prev => ({
      ...prev,
      syncInterval: value[0]
    }));
  };

  const handleAutoSyncChange = (checked: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      autoSync: checked
    }));
  };

  const handleOfflineModeChange = (checked: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      offlineMode: checked
    }));
  };

  const handleConflictResolutionChange = (value: "local" | "remote" | "merge") => {
    setLocalConfig(prev => ({
      ...prev,
      conflictResolution: value
    }));
  };

  const _handleDatabaseConfigChange = (dbConfig: DatabaseConfig) => {
    setDatabaseConfig(dbConfig);
    setLocalConfig(prev => ({
      ...prev,
      database: dbConfig
    }));
  };

  const handleSave = () => {
    onConfigChange(localConfig);
    onSave();
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{t("storage.config.title")}</CardTitle>
        <CardDescription>
          {t("storage.config.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* 存储类型选择 */}
          <div className="space-y-2">
            <Label htmlFor="storage-type">{t("storage.config.storageType")}</Label>
            <Select 
              value={localConfig.type} 
              onValueChange={handleStorageTypeChange as (value: string) => void}
            >
              <SelectTrigger id="storage-type">
                <SelectValue placeholder={t("storage.config.selectStorageType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="localStorage">{t("storage.config.localStorage")}</SelectItem>
                <SelectItem value="database">{t("storage.config.database")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 数据库配置 */}
          {localConfig.type === "database" && (
            <div className="space-y-4">
              <Label>{t("storage.config.databaseConfig")}</Label>
              <DatabaseConnectionPanel />
            </div>
          )}

          {/* 同步设置 */}
          <div className="space-y-4">
            <Label>{t("storage.config.syncSettings")}</Label>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="sync-interval">{t("storage.config.syncInterval")}</Label>
                <span className="text-sm text-muted-foreground">
                  {localConfig.syncInterval}s
                </span>
              </div>
              <Slider 
                id="sync-interval"
                min={5} 
                max={300} 
                step={5}
                value={[localConfig.syncInterval]}
                onValueChange={handleSyncIntervalChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-sync" 
                checked={localConfig.autoSync}
                onCheckedChange={handleAutoSyncChange}
              />
              <Label htmlFor="auto-sync">{t("storage.config.autoSync")}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="offline-mode" 
                checked={localConfig.offlineMode}
                onCheckedChange={handleOfflineModeChange}
              />
              <Label htmlFor="offline-mode">{t("storage.config.offlineMode")}</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conflict-resolution">{t("storage.config.conflictResolution")}</Label>
              <Select 
                value={localConfig.conflictResolution} 
                onValueChange={handleConflictResolutionChange as (value: string) => void}
              >
                <SelectTrigger id="conflict-resolution">
                  <SelectValue placeholder={t("storage.config.selectConflictResolution")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">{t("storage.config.localWins")}</SelectItem>
                  <SelectItem value="remote">{t("storage.config.remoteWins")}</SelectItem>
                  <SelectItem value="merge">{t("storage.config.merge")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSaving ? t("common.saving") : t("common.save")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
