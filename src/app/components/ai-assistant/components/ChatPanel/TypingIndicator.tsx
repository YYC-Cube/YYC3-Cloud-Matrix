/**
 * @file components/ChatPanel/TypingIndicator.tsx
 * @description 打字指示器组件
 * @author YanYuCloudCube Team
 * @version v1.0.0
 */

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-[rgba(0,40,80,0.3)] border border-[rgba(0,180,255,0.1)] rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-[#00d4ff] animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
