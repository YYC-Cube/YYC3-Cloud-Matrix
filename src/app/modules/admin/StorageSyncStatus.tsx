/**
 * @file: StorageSyncStatus.tsx
 * @description: StorageSyncStatus.tsx
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
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Clock, RefreshCw, CheckCircle2, XCircle, Database, HardDrive, Wifi, WifiOff } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { storageManager } from "../../services/storageManager";
import type { StorageStatus, StorageEvent } from "../../types/storage";

interface StorageSyncStatusProps {
  showDetails?: boolean;
}

export function StorageSyncStatus({ showDetails = true }: StorageSyncStatusProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<StorageStatus>(storageManager.getStatus());
  const [syncHistory, setSyncHistory] = useState<Array<{ time: number; status: "success" | "error"; message: string }>>([]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueProcessing, setOfflineQueueProcessing] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(storageManager.getStatus());
    };

    const handleEvent = (event: StorageEvent) => {
      updateStatus();

      switch (event.type) {
        case "syncStart":
          setSyncProgress(0);
          break;
        case "syncComplete":
          setSyncProgress(100);
          setSyncHistory(prev => [
            { time: Date.now(), status: "success", message: t("storage.sync.completed") },
            ...prev.slice(0, 9)
          ]);
          break;
        case "syncError":
          setSyncProgress(0);
          setSyncHistory(prev => [
            { 
              time: Date.now(), 
              status: "error", 
              message: event.error || t("storage.sync.failed") 
            },
            ...prev.slice(0, 9)
          ]);
          break;
        case "online":
          setIsOnline(true);
          setSyncHistory(prev => [
            { time: Date.now(), status: "success", message: t("storage.network.online") },
            ...prev.slice(0, 9)
          ]);
          break;
        case "offline":
          setIsOnline(false);
          setSyncHistory(prev => [
            { time: Date.now(), status: "error", message: t("storage.network.offline") },
            ...prev.slice(0, 9)
          ]);
          break;
        case "offlineOperationAdded":
          setSyncHistory(prev => [
            { time: Date.now(), status: "success", message: t("storage.offline.operationAdded") },
            ...prev.slice(0, 9)
          ]);
          break;
        case "offlineQueueProcessed":
          setOfflineQueueProcessing(false);
          setSyncHistory(prev => [
            { time: Date.now(), status: "success", message: t("storage.offline.queueProcessed") },
            ...prev.slice(0, 9)
          ]);
          break;
      }
    };

    // 模拟同步进度
    const progressInterval = setInterval(() => {
      if (status.syncing && syncProgress < 100) {
        setSyncProgress(prev => Math.min(prev + 5, 100));
      }
    }, 200);

    // 监听网络状态
    const handleOnline = () => {
      setIsOnline(true);
      if (storageManager.getConfig().offlineMode && status.pendingChanges > 0) {
        setOfflineQueueProcessing(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    storageManager.onEvent(handleEvent);
    updateStatus();

    return () => {
      storageManager.offEvent(handleEvent);
      clearInterval(progressInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status.syncing, syncProgress, status.pendingChanges, t]);

  const handleSync = async () => {
    await storageManager.triggerSync();
  };

  const getStatusIcon = () => {
    if (!status.connected) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (status.syncing) {
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (!status.connected) {
      return t("storage.status.disconnected");
    }
    if (status.syncing) {
      return t("storage.status.syncing");
    }
    if (status.lastSync) {
      return t("storage.status.synced");
    }
    return t("storage.status.ready");
  };

  const getStorageIcon = () => {
    const config = storageManager.getConfig();
    if (config.type === "database") {
      return <Database className="h-4 w-4" />;
    }
    return <HardDrive className="h-4 w-4" />;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStorageIcon()}
          {t("storage.sync.status")}
        </CardTitle>
        <CardDescription>
          {t("storage.sync.statusDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 状态概览 */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h3 className="font-medium">{getStatusText()}</h3>
                {status.lastSync && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t("storage.sync.lastSync", { time: formatTime(status.lastSync) })}
                  </p>
                )}
                {status.error && (
                  <p className="text-sm text-red-500">{status.error}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 网络状态指示 */}
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-background">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">{t("storage.network.online")}</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-red-500">{t("storage.network.offline")}</span>
                  </>
                )}
              </div>
              <Button 
                onClick={handleSync} 
                disabled={status.syncing || !isOnline}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("storage.sync.manual")}
              </Button>
            </div>
          </div>

          {/* 同步进度 */}
          {status.syncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("storage.sync.inProgress")}</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}

          {/* 离线队列处理进度 */}
          {offlineQueueProcessing && (
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertTitle>{t("storage.offline.processingQueue")}</AlertTitle>
              <AlertDescription>
                {t("storage.offline.processingDescription", { count: status.pendingChanges })}
              </AlertDescription>
            </Alert>
          )}

          {/* 离线模式提示 */}
          {!isOnline && storageManager.getConfig().offlineMode && status.pendingChanges > 0 && (
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertTitle>{t("storage.offline.modeActive")}</AlertTitle>
              <AlertDescription>
                {t("storage.offline.pendingChanges", { count: status.pendingChanges })}
              </AlertDescription>
            </Alert>
          )}

          {/* 详细信息 */}
          {showDetails && (
            <Tabs defaultValue="history">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">{t("storage.sync.history")}</TabsTrigger>
                <TabsTrigger value="details">{t("storage.sync.details")}</TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <div className="space-y-2">
                  {syncHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("storage.sync.noHistory")}
                    </p>
                  ) : (
                    syncHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-2">
                          {item.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{item.message}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(item.time)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="details">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">{t("storage.sync.pendingChanges")}</span>
                    <Badge variant={status.pendingChanges > 0 ? "destructive" : "default"}>
                      {status.pendingChanges}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("storage.sync.storageType")}</span>
                    <span className="text-sm font-medium">
                      {storageManager.getConfig().type === "database" 
                        ? t("storage.config.database") 
                        : t("storage.config.localStorage")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("storage.sync.syncInterval")}</span>
                    <span className="text-sm font-medium">
                      {storageManager.getConfig().syncInterval}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("storage.sync.autoSync")}</span>
                    <Badge variant={storageManager.getConfig().autoSync ? "default" : "secondary"}>
                      {storageManager.getConfig().autoSync ? t("common.enabled") : t("common.disabled")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t("storage.sync.offlineMode")}</span>
                    <Badge variant={storageManager.getConfig().offlineMode ? "default" : "secondary"}>
                      {storageManager.getConfig().offlineMode ? t("common.enabled") : t("common.disabled")}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
