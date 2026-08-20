/**
 * @file: page-header.tsx
 * @description: PageHeader.tsx
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-08
 * @updated: 2026-04-08
 * @status: active
 * @tags: [component]
 */

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-[rgba(0,180,255,0.06)] pb-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#e0f0ff] text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-[rgba(224,240,255,0.4)] mt-1 text-sm">
              {description}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
}
