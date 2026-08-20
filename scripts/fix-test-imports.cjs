const fs = require("fs");
const path = require("path");

const testDir = "/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/__tests__";

const moduleMap = {
  shared: ["AIAssistant","CommandPalette","OfflineIndicator","ConnectionStatus","QuickActionGrid","GlassCard","ErrorBoundary","NotFound","LanguageSwitcher","Login","Sidebar","TopBar","BottomNav","YYC3Logo","YYC3LogoSvg"],
  admin: ["OperationAudit","UserManagement","SystemSettings","UnifiedSettingsPanel","SecurityMonitor","PWAStatusPanel","PWAInstallPrompt","DataEditorPanel","InlineEditableTable","PerformanceMonitor","EnvConfigEditor","StorageManager","StorageConfigPanel","StorageSyncStatus","ConfigCenter","VariableCenter","PageConfigEditor","NetworkConfig"],
  monitor: ["DataMonitoring","Dashboard","FollowUpPanel","FollowUpManager","FollowUpCard","FollowUpDrawer","FollowUpEditDialog","PatrolDashboard","PatrolReport","PatrolScheduler","PatrolHistory","AlertBanner","AlertRulesPanel","CreateRuleModal","AISuggestionPanel","ActionRecommender","PatternAnalyzer","SDKChatPanel","QuickActionGroup","NodeDetailModal","UnifiedModelSelector"],
  ops: ["OperationCenter","OperationChain","OperationCategory","OperationLogStream","OperationTemplate","LocalFileManager","FileBrowser","HostFileManager","DatabaseManager","DatabaseConnectionPanel","ServiceLoopPanel","LoopStageCard","ServiceConnectionTest","ReportExporter","ReportGenerator","ConfigExportCenter","ConnectionMonitorPanel","LogViewer"],
  ai: ["AIDiagnostics","ModelProviderPanel","AddModelModal","ProviderEditorModal"],
  dev: ["DesignSystemPage","DevGuidePage","ThemeCustomizer","CLITerminal","IntegratedTerminal","IDEPanel","IDELayout","IDETopBar","IDEStatusBar","IDESettingsPanel","RefactoringReport","ArchitectureAudit","FileExplorer","Workspace","TabBar","Panel","PanelContainer","PanelContent","PanelToolbar","CodeEditor","ColorSwatch","ColorPicker","DesignTokens","DataFlowDiagram","ComponentShowcase","StageReview","GitPanel"],
  business: ["HotelDashboard","CommStationPanel"],
};

var componentToModule = {};
for (var mod in moduleMap) {
  var comps = moduleMap[mod];
  for (var i = 0; i < comps.length; i++) {
    componentToModule[comps[i]] = mod;
  }
}

function scanFiles(dir) {
  var files = [];
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanFiles(fp));
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fp);
    }
  }
  return files;
}

var allFiles = scanFiles(testDir);
var totalFixed = 0;
var totalReplacements = 0;

for (var i = 0; i < allFiles.length; i++) {
  var fp = allFiles[i];
  var content = fs.readFileSync(fp, "utf8");
  var changed = false;

  for (var comp in componentToModule) {
    var mod = componentToModule[comp];
    var oldPattern = "../components/" + comp;
    var newPattern = "../modules/" + mod + "/" + comp;
    if (content.includes(oldPattern)) {
      content = content.split(oldPattern).join(newPattern);
      changed = true;
      totalReplacements++;
    }
  }

  if (changed) {
    fs.writeFileSync(fp, content);
    totalFixed++;
    console.log("Fixed:", path.relative(testDir, fp));
  }
}

console.log("Total:", totalFixed, "files fixed,", totalReplacements, "replacements");