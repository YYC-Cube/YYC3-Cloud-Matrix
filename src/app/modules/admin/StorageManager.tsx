/**
 * @file: StorageManager.tsx
 * @description: StorageManager.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import { useState } from "react";
import { PageHeader } from "../../components/ui/page-header";
import { StorageConfigPanel } from "./StorageConfigPanel";
import { StorageSyncStatus } from "./StorageSyncStatus";
import { useI18n } from "../../hooks/useI18n";
import { storageManager } from "../../services/storageManager";
import type { StorageConfig } from "../../types/storage";

export function StorageManager() {
  const { t } = useI18n();
  const [config, setConfig] = useState<StorageConfig>(storageManager.getConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleConfigChange = (newConfig: StorageConfig) => {
    setConfig(newConfig);
    setError(undefined);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(undefined);
    
    try {
      storageManager.saveConfig(config);
      // 手动触发一次同步
      await storageManager.triggerSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("storage.manager.title")}
        description={t("storage.manager.description")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 同步状态 */}
        <div className="lg:col-span-1">
          <StorageSyncStatus />
        </div>

        {/* 存储配置 */}
        <div className="lg:col-span-2">
          <StorageConfigPanel 
            config={config}
            onConfigChange={handleConfigChange}
            onSave={handleSave}
            isSaving={isSaving}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
