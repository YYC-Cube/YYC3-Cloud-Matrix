/**
 * @file: ipc-types.js
 * @description: ipc-types.js description
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [script]
 */

"use strict";
/**
 * @file: ipc-types.ts
 * @description: ipc-types.ts
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [module]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCChannel = void 0;
/**
 * IPC 通道名称
 */
var IPCChannel;
(function (IPCChannel) {
    // 文件系统操作
    IPCChannel["FILE_READ"] = "file:read";
    IPCChannel["FILE_WRITE"] = "file:write";
    IPCChannel["FILE_DELETE"] = "file:delete";
    IPCChannel["FILE_EXISTS"] = "file:exists";
    IPCChannel["FILE_LIST"] = "file:list";
    IPCChannel["FILE_STAT"] = "file:stat";
    IPCChannel["FILE_MKDIR"] = "file:mkdir";
    IPCChannel["FILE_COPY"] = "file:copy";
    IPCChannel["FILE_MOVE"] = "file:move";
    // 数据库文件操作
    IPCChannel["DB_EXECUTE"] = "db:execute";
    IPCChannel["DB_QUERY"] = "db:query";
    IPCChannel["DB_BACKUP"] = "db:backup";
    IPCChannel["DB_RESTORE"] = "db:restore";
    IPCChannel["DB_MIGRATE"] = "db:migrate";
    // 系统监控
    IPCChannel["SYSTEM_CPU"] = "system:cpu";
    IPCChannel["SYSTEM_MEMORY"] = "system:memory";
    IPCChannel["SYSTEM_DISK"] = "system:disk";
    IPCChannel["SYSTEM_NETWORK"] = "system:network";
    IPCChannel["SYSTEM_PROCESSES"] = "system:processes";
    // 应用控制
    IPCChannel["APP_VERSION"] = "app:version";
    IPCChannel["APP_PATH"] = "app:path";
    IPCChannel["APP_CONFIG"] = "app:config";
    IPCChannel["APP_RESTART"] = "app:restart";
    IPCChannel["APP_QUIT"] = "app:quit";
    // 对话框
    IPCChannel["DIALOG_OPEN"] = "dialog:open";
    IPCChannel["DIALOG_SAVE"] = "dialog:save";
    IPCChannel["DIALOG_MESSAGE"] = "dialog:message";
    // Shell 操作
    IPCChannel["SHELL_OPEN"] = "shell:open";
    IPCChannel["SHELL_EXECUTE"] = "shell:execute";
})(IPCChannel || (exports.IPCChannel = IPCChannel = {}));
//# sourceMappingURL=ipc-types.js.map