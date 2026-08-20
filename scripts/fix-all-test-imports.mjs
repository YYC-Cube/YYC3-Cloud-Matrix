import fs from 'fs';
import path from 'path';

const testDir = '/Users/my/YYC3-CloudPivot Intelli-Matrix/src/app/__tests__';

// Module → components mapping
const moduleMap: Record<string, string[]> = {
  'shared': ['AIAssistant', 'CommandPalette', 'OfflineIndicator', 'ConnectionStatus', 'QuickActionGrid', 'GlassCard', 'ErrorBoundary', 'NotFound', 'LanguageSwitcher', 'Login', 'Sidebar', 'TopBar', 'BottomNav', 'YYC3Logo', 'YYC3LogoSvg'],
  'admin': ['OperationAudit', 'UserManagement', 'SystemSettings', 'UnifiedSettingsPanel', 'SecurityMonitor', 'PWAStatusPanel', 'PWAInstallPrompt', 'DataEditorPanel', 'InlineEditableTable', 'PerformanceMonitor', 'EnvConfigEditor', 'StorageManager', 'StorageConfigPanel', 'StorageSyncStatus', 'ConfigCenter', 'VariableCenter', 'PageConfigEditor', 'NetworkConfig'],
  'monitor': ['DataMonitoring', 'Dashboard', 'FollowUpPanel', 'FollowUpManager', 'FollowUpCard', 'FollowUpDrawer', 'FollowUpEditDialog', 'PatrolDashboard', 'PatrolReport', 'PatrolScheduler', 'PatrolHistory', 'AlertBanner', 'AlertRulesPanel', 'CreateRuleModal', 'AISuggestionPanel', 'ActionRecommender', 'PatternAnalyzer', 'SDKChatPanel', 'QuickActionGroup', 'NodeDetailModal', 'UnifiedModelSelector'],
  'ops': ['OperationCenter', 'OperationChain', 'OperationCategory', 'OperationLogStream', 'OperationTemplate', 'LocalFileManager', 'FileBrowser', 'HostFileManager', 'DatabaseManager', 'DatabaseConnectionPanel', 'ServiceLoopPanel', 'LoopStageCard', 'ServiceConnectionTest', 'ReportExporter', 'ReportGenerator', 'ConfigExportCenter', 'ConnectionMonitorPanel', 'LogViewer'],
  'ai': ['AIDiagnostics', 'ModelProviderPanel', 'AddModelModal', 'ProviderEditorModal'],
  'ai-family': ['AIFamilyPage', 'AIFamilyRouter', 'FamilyHome', 'FamilyChat', 'FamilyMusic', 'FamilyModelSettings', 'FamilyUISettings', 'FamilyVoiceSystem', 'FamilyGrowth', 'FamilyDataHub', 'EmotionVisualizer', 'VinylPhotoPlayer', 'CreationStudio', 'AIFamilyCenterPage', 'LyricsGeneratorPanel', 'CoverFlow', 'FamilyCluster', 'AIFamilyDesignDoc'],
  'dev': ['DesignSystemPage', 'DevGuidePage', 'ThemeCustomizer', 'CLITerminal', 'IntegratedTerminal', 'IDEPanel', 'IDELayout', 'IDETopBar', 'IDEStatusBar', 'IDESettingsPanel', 'RefactoringReport', 'ArchitectureAudit', 'FileExplorer', 'Workspace', 'TabBar', 'Panel', 'PanelContainer', 'PanelContent', 'PanelToolbar', 'CodeEditor', 'ColorSwatch', 'ColorPicker', 'DesignTokens', 'DataFlowDiagram', 'ComponentShowcase', 'StageReview', 'GitPanel'],
  'business': ['HotelDashboard', 'CommStationPanel'],
};

// Build reverse map: component → module
const componentToModule: Record<string, string> = {};
for (const [mod, components] of Object.entries(moduleMap)) {
  for (const comp of components) {
    componentToModule[comp] = mod;
  }
}

// Scan all test files recursively
function scanFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanFiles(fp));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fp);
    }
  }
  return files;
}

const allFiles = scanFiles(testDir);
let totalFixed = 0;
let totalReplacements = 0;

for (const fp of allFiles) {
  let content = fs.readFileSync(fp, 'utf8');
  let changed = false;

  // Replace ../components/XXX with ../modules/{module}/XXX
  for (const [comp, mod] of Object.entries(componentToModule)) {
    const oldPattern = `../components/${comp}`;
    const newPattern = `../modules/${mod}/${comp}`;
    if (content.includes(oldPattern)) {
      content = content.split(oldPattern).join(newPattern);
      changed = true;
      totalReplacements++;
    }
  }

  if (changed) {
    fs.writeFileSync(fp, content);
    totalFixed++;
    console.log(`Fixed: ${path.relative(testDir, fp)}`);
  }
}

console.log(`\nTotal: ${totalFixed} files fixed, ${totalReplacements} replacements`);