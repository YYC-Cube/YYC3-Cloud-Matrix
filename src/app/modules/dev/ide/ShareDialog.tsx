/**
 * @file: ShareDialog.tsx
 * @description: ShareDialog.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import * as React from "react";
import { useState } from "react";
import { X, Share2, Copy, Check, Eye, Edit3, Shield } from "lucide-react";
import { useI18n } from "../../../hooks/useI18n";
import { useCopyFeedback } from "../../../hooks/useCopyFeedback";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type SharePermission = "readonly" | "readwrite" | "admin";

export function ShareDialog({ isOpen, onClose }: ShareDialogProps) {
  const { t } = useI18n();
  const [permission, setPermission] = useState<SharePermission>("readonly");
  const [copied, copyToClipboard] = useCopyFeedback<boolean>();

  if (!isOpen) {return null;}

  const shareUrl = "https://yyc3.cloud/ide/share/proj-abc123";

  const permOptions: { value: SharePermission; label: string; icon: React.ElementType; desc: string }[] = [
    { value: "readonly", label: t("ide.shareReadOnly"), icon: Eye, desc: "View only" },
    { value: "readwrite", label: t("ide.shareReadWrite"), icon: Edit3, desc: "Edit files" },
    { value: "admin", label: t("ide.shareAdmin"), icon: Shield, desc: "Full access" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 rounded-lg overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "420px",
          background: "rgba(8,20,45,0.97)",
          border: "1px solid rgba(0,180,255,0.2)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(0,180,255,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-[#e0f0ff]" style={{ fontSize: "0.82rem" }}>
              {t("ide.shareTitle")}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.08)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-4">
          {/* Share link */}
          <div>
            <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>
              {t("ide.shareLink")}
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <div
                className="flex-1 px-3 py-2 rounded-md font-mono truncate"
                style={{
                  background: "rgba(0,10,25,0.6)",
                  border: "1px solid rgba(0,180,255,0.1)",
                  fontSize: "0.68rem",
                  color: "#c0dcf0",
                }}
              >
                {shareUrl}
              </div>
              <button
                onClick={() => copyToClipboard(shareUrl, true)}
                className={`p-2 rounded-md transition-all ${
                  copied
                    ? "bg-[rgba(0,255,136,0.12)] text-[#00ff88] border border-[rgba(0,255,136,0.3)]"
                    : "bg-[rgba(0,40,80,0.3)] text-[#00d4ff] border border-[rgba(0,180,255,0.15)] hover:border-[rgba(0,212,255,0.3)]"
                }`}
                title={t("ide.shareCopyLink")}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-[#00ff88] mt-1" style={{ fontSize: "0.55rem" }}>
                {t("ide.shareCopied")}
              </p>
            )}
          </div>

          {/* Permission */}
          <div>
            <span className="text-[rgba(0,212,255,0.5)]" style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>
              {t("ide.sharePermission")}
            </span>
            <div className="flex gap-2 mt-1.5">
              {permOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPermission(opt.value)}
                    className={`flex-1 py-2 rounded-md border transition-all text-center ${
                      permission === opt.value
                        ? "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.1)]"
                        : "border-[rgba(0,180,255,0.08)] bg-[rgba(0,40,80,0.2)] hover:border-[rgba(0,212,255,0.15)]"
                    }`}
                  >
                    <Icon
                      className="w-3.5 h-3.5 mx-auto mb-1"
                      style={{ color: permission === opt.value ? "#00d4ff" : "rgba(0,212,255,0.3)" }}
                    />
                    <span
                      className="block"
                      style={{ fontSize: "0.6rem", color: permission === opt.value ? "#e0f0ff" : "rgba(0,212,255,0.4)" }}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
