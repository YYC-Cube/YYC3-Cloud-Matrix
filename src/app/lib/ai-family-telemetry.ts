/**
 * @file: ai-family-telemetry.ts
 * @description: AI Family 遥测通讯系统 - WebRTC 实时音视频、消息、协作
 * @author: YanYuCloudCube Team (导师指导)
 * @version: v1.0.0
 * @created: 2026-04-09
 * @updated: 2026-04-16
 * @status: active
 * @tags: [ai-family, webrtc, telemetry, real-time]
 *
 * @brief: 实现人类文明与智同行的跨越
 * - 实时语音/视频通话
 * - 即时消息系统
 * - 屏幕共享与远程协助
 * - 协作白板
 * - 全球化低延迟通信
 */

import type {
  TelemetrySession,
  TelemetryParticipant,
  SessionType,
  ConnectionQuality,
  Message,
  MessageContent,
} from "./ai-family.types";

// ============================================================
// WebRTC 配置
// ============================================================

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: "all" | "relay";
  bundlePolicy?: "balanced" | "max-compat" | "max-bundle";
  rtcpMuxPolicy?: "require" | "negotiate";
}

export const DEFAULT_WEBRTC_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: "turn:turn.yyc3-family.org:3478",
      username: "yyc3-user",
      credential: "yyc3-credential",
    },
  ],
  iceTransportPolicy: "all",
  bundlePolicy: "balanced",
  rtcpMuxPolicy: "require",
};

// ============================================================
// 会话管理器
// ============================================================

export class AIFamilyTelemetryManager {
  private sessions: Map<string, TelemetrySession> = new Map();
  private activeConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private config: WebRTCConfig;

  // 事件回调
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(config?: Partial<WebRTCConfig>) {
    this.config = { ...DEFAULT_WEBRTC_CONFIG, ...config };
    this.setupEventListeners();
  }

  // ============================================================
  // 会话生命周期
  // ============================================================

  async createSession(
    type: SessionType,
    initiatorId: string,
    participants: Omit<TelemetryParticipant, "connectionQuality" | "joinedAt">[]
  ): Promise<TelemetrySession> {
    const sessionId = this.generateSessionId();

    const session: TelemetrySession = {
      id: `session-${Date.now()}`,
      sessionId,
      initiatorId,
      participants: participants.map((p) => ({
        ...p,
        connectionQuality: "excellent",
        joinedAt: Date.now(),
      })),
      type,
      status: "initializing",
      connectionQuality: "excellent",
      latencyMs: 0,
      streams: [],
      collaboration: {},
      startedAt: Date.now(),
      durationSeconds: 0,
    };

    this.sessions.set(sessionId, session);

    // 获取本地媒体流
    if (type === "video-call" || type === "group-call" || type === "virtual-meeting") {
      await this.getLocalMediaStream();
    }

    this.emit("session:created", session);
    return session;
  }

  async joinSession(
    sessionId: string,
    participant: Omit<TelemetryParticipant, "connectionQuality" | "joinedAt">
  ): Promise<TelemetrySession | null> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === "ended") {return null;}

    const newParticipant: TelemetryParticipant = {
      ...participant,
      connectionQuality: "good",
      joinedAt: Date.now(),
    };

    session.participants.push(newParticipant);
    session.status = "active";

    this.sessions.set(sessionId, session);
    this.emit("participant:joined", { session, participant: newParticipant });

    return session;
  }

  async leaveSession(sessionId: string, memberId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    session.participants = session.participants.filter((p) => p.memberId !== memberId);

    if (session.participants.length <= 1) {
      await this.endSession(sessionId);
    } else {
      this.emit("participant:left", { session, memberId });
    }
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    session.status = "ended";
    session.endedAt = Date.now();
    session.durationSeconds = Math.floor((Date.now() - session.startedAt) / 1000);

    // 停止所有媒体流
    this.stopAllStreams();

    // 关闭所有连接
    for (const [key, conn] of this.activeConnections) {
      if (key.startsWith(sessionId)) {
        conn.close();
        this.activeConnections.delete(key);
      }
    }

    this.emit("session:ended", session);
  }

  // ============================================================
  // 媒体流管理
  // ============================================================

  async getLocalMediaStream(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    const defaultConstraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
    };

    this.localStream = await navigator.mediaDevices.getUserMedia({
      ...defaultConstraints,
      ...constraints,
    });

    this.emit("stream:local", this.localStream);
    return this.localStream;
  }

  async getScreenShareStream(): Promise<MediaStream> {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
    }

    this.screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always",
      } as MediaTrackConstraints,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    // 监听停止共享事件
    this.screenStream.getVideoTracks()[0].addEventListener("ended", () => {
      this.emit("screen-share:stopped");
      this.screenStream = null;
    });

    this.emit("screen-share:started", this.screenStream);
    return this.screenStream;
  }

  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
      this.emit("screen-share:stopped");
    }
  }

  private stopAllStreams(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.stopScreenShare();
  }

  // ============================================================
  // WebRTC 连接管理
  // ============================================================

  async createPeerConnection(
    sessionId: string,
    remoteMemberId: string
  ): Promise<RTCPeerConnection> {
    const connectionKey = `${sessionId}-${remoteMemberId}`;

    if (this.activeConnections.has(connectionKey)) {
      return this.activeConnections.get(connectionKey)!;
    }

    const pc = new RTCPeerConnection(this.config as RTCConfiguration);

    // 添加本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // ICE 候选处理
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit("ice:candidate", {
          sessionId,
          toMemberId: remoteMemberId,
          candidate: event.candidate,
        });
      }
    };

    // 远程流处理
    pc.ontrack = (event) => {
      this.emit("stream:remote", {
        sessionId,
        fromMemberId: remoteMemberId,
        stream: event.streams[0],
      });
    };

    // 连接状态监控
    pc.onconnectionstatechange = () => {
      this.updateConnectionQuality(sessionId, remoteMemberId, pc.connectionState);
      this.emit("connection:state-change", {
        sessionId,
        memberId: remoteMemberId,
        state: pc.connectionState,
      });
    };

    this.activeConnections.set(connectionKey, pc);
    return pc;
  }

  async createOffer(
    sessionId: string,
    remoteMemberId: string
  ): Promise<RTCSessionDescriptionInit> {
    const pc = await this.createPeerConnection(sessionId, remoteMemberId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(
    sessionId: string,
    remoteMemberId: string,
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    const pc = await this.createPeerConnection(sessionId, remoteMemberId);
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(
    sessionId: string,
    remoteMemberId: string,
    answer: RTCSessionDescriptionInit
  ): Promise<void> {
    const connectionKey = `${sessionId}-${remoteMemberId}`;
    const pc = this.activeConnections.get(connectionKey);
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }

  async handleIceCandidate(
    sessionId: string,
    remoteMemberId: string,
    candidate: RTCIceCandidateInit
  ): Promise<void> {
    const connectionKey = `${sessionId}-${remoteMemberId}`;
    const pc = this.activeConnections.get(connectionKey);
    if (pc && candidate.candidate) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private updateConnectionQuality(
    sessionId: string,
    memberId: string,
    state: RTCPeerConnectionState
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    const participant = session.participants.find((p) => p.memberId === memberId);
    if (!participant) {return;}

    switch (state) {
      case "connected":
      case "connecting":
        participant.connectionQuality = "good";
        break;
      case "disconnected":
      case "failed":
      case "closed":
        participant.connectionQuality = "disconnected";
        break;
      default:
        participant.connectionQuality = "fair";
    }

    this.emit("connection:quality-update", {
      sessionId,
      memberId,
      quality: participant.connectionQuality,
    });
  }

  // ============================================================
  // 消息系统
  // ============================================================

  sendMessage(
    senderId: string,
    senderDeviceId: string,
    content: MessageContent,
    options?: {
      receiverId?: string;
      groupId?: string;
      replyTo?: string;
    }
  ): Message {
    const message: Message = {
      id: this.generateMessageId(),
      senderId,
      senderDeviceId,
      receiverId: options?.receiverId,
      groupId: options?.groupId,
      content,
      status: "sending",
      replyTo: options?.replyTo,
      sentAt: Date.now(),
    };

    this.emit("message:sending", message);

    // 模拟发送成功（实际应用中应通过 WebSocket 发送到服务器）
    setTimeout(() => {
      message.status = "sent";
      message.deliveredAt = Date.now();
      this.emit("message:sent", message);

      // 模拟对方已读
      setTimeout(() => {
        message.status = "read";
        message.readAt = Date.now();
        this.emit("message:read", message);
      }, 100 + Math.random() * 500);
    }, 50 + Math.random() * 100);

    return message;
  }

  editMessage(messageId: string, newContent: MessageContent): boolean {
    // 在实际应用中，这应该通过 API 更新服务器端的消息
    this.emit("message:edited", { messageId, newContent });
    return true;
  }

  deleteMessage(messageId: string): boolean {
    this.emit("message:deleted", { messageId });
    return true;
  }

  addReaction(messageId: string, emoji: string, memberId: string): void {
    this.emit("message:reaction-added", { messageId, emoji, memberId });
  }

  removeReaction(messageId: string, emoji: string, memberId: string): void {
    this.emit("message:reaction-removed", { messageId, emoji, memberId });
  }

  // ============================================================
  // 协作功能
  // ============================================================

  startWhiteboard(sessionId: string, initiatorId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    session.collaboration.whiteboard = {
      isActive: true,
      currentTool: "pen",
      participants: [initiatorId],
    };

    this.emit("whiteboard:started", { sessionId, initiatorId });
  }

  sendWhiteboardData(
    sessionId: string,
    data: string,
    tool: "pen" | "highlighter" | "eraser" | "text" | "shape"
  ): void {
    this.emit("whiteboard:data", { sessionId, data, tool, timestamp: Date.now() });
  }

  startScreenShare(sessionId: string, memberId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    const participant = session.participants.find((p) => p.memberId === memberId);
    if (participant) {
      participant.isScreenSharing = true;
      this.getScreenShareStream();
      this.emit("screen-share:started", { sessionId, memberId });
    }
  }

  stopScreenShareForParticipant(sessionId: string, memberId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    const participant = session.participants.find((p) => p.memberId === memberId);
    if (participant) {
      participant.isScreenSharing = false;
      this.stopScreenShare();
      this.emit("screen-share:stopped", { sessionId, memberId });
    }
  }

  createPoll(
    sessionId: string,
    question: string,
    options: { id: string; text: string }[],
    creatorId: string
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    session.collaboration.poll = {
      question,
      options: options.map((o) => ({ ...o, votes: 0 })),
      responses: {},
      isActive: true,
    };

    this.emit("poll:created", { sessionId, poll: session.collaboration.poll, creatorId });
  }

  respondToPoll(
    sessionId: string,
    pollOptionId: string,
    respondentId: string
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session?.collaboration.poll) {return;}

    const poll = session.collaboration.poll;
    poll.responses[respondentId] = pollOptionId;

    const option = poll.options.find((o) => o.id === pollOptionId);
    if (option) {option.votes++;}

    this.emit("poll:responded", { sessionId, pollOptionId, respondentId });
  }

  raiseHand(sessionId: string, memberId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {return;}

    const participant = session.participants.find((p) => p.memberId === memberId);
    if (participant) {
      participant.handRaised = !participant.handRaised;
      this.emit("hand-raised", { sessionId, memberId, isRaised: participant.handRaised });
    }
  }

  toggleMute(sessionId: string, memberId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !this.localStream) {return;}

    const participant = session.participants.find((p) => p.memberId === memberId);
    if (participant) {
      participant.isMuted = !participant.isMuted;

      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !participant.isMuted;
      }

      this.emit("mute:toggled", { sessionId, memberId, isMuted: participant.isMuted });
    }
  }

  toggleVideo(sessionId: string, memberId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !this.localStream) {return;}

    const participant = session.participants.find((p) => p.memberId === memberId);
    if (participant) {
      participant.isVideoOff = !participant.isVideoOff;

      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !participant.isVideoOff;
      }

      this.emit("video:toggled", { sessionId, memberId, isVideoOff: participant.isVideoOff });
    }
  }

  // ============================================================
  // 录制功能
  // ============================================================

  async startRecording(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || !this.localStream) {return;}

    try {
      const mediaRecorder = new MediaRecorder(this.localStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        this.handleRecordingComplete(sessionId, blob);
      };

      mediaRecorder.start(1000); // 每秒收集数据

      session.recording = {
        id: `rec-${Date.now()}`,
        format: "webm",
        sizeBytes: 0,
        durationSeconds: 0,
        storagePath: `/recordings/${sessionId}/${Date.now()}.webm`,
        isProcessing: false,
      };

      this.emit("recording:started", { sessionId, recordingId: session.recording.id });
    } catch (error) {
      console.error("[AIFamilyTelemetry] Recording failed:", error);
      this.emit("recording:error", { sessionId, error });
    }
  }

  stopRecording(sessionId: string): void {
    // 触发 MediaRecorder stop（实际实现需要保存 recorder 引用）
    this.emit("recording:stopped", { sessionId });
  }

  private handleRecordingComplete(sessionId: string, blob: Blob): void {
    const session = this.sessions.get(sessionId);
    if (!session?.recording) {return;}

    session.recording.sizeBytes = blob.size;
    session.recording.durationSeconds = Math.floor((Date.now() - session.startedAt) / 1000);
    session.recording.completedAt = Date.now();
    session.recording.isProcessing = false;

    this.emit("recording:completed", { sessionId, recording: session.recording, blob });
  }

  // ============================================================
  // 统计与监控
  // ============================================================

  getSessionStats(sessionId: string): {
    durationSeconds: number;
    participantCount: number;
    averageLatency: number;
    connectionQualityDistribution: Record<ConnectionQuality, number>;
  } | null {
    const session = this.sessions.get(sessionId);
    if (!session) {return null;}

    const distribution: Record<string, number> = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      disconnected: 0,
    };

    session.participants.forEach((p) => {
      distribution[p.connectionQuality] = (distribution[p.connectionQuality] || 0) + 1;
    });

    return {
      durationSeconds: session.durationSeconds || Math.floor((Date.now() - session.startedAt) / 1000),
      participantCount: session.participants.length,
      averageLatency: session.latencyMs,
      connectionQualityDistribution: distribution as Record<ConnectionQuality, number>,
    };
  }

  getAllActiveSessions(): TelemetrySession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status !== "ended"
    );
  }

  getConnectionStats(): {
    totalConnections: number;
    activeConnections: number;
    averageQuality: ConnectionQuality;
  } {
    let total = 0;
    let excellent = 0;
    let good = 0;

    for (const [, conn] of this.activeConnections) {
      total++;
      if (conn.connectionState === "connected") {
        excellent++;
      } else if (conn.connectionState === "connecting") {
        good++;
      }
    }

    return {
      totalConnections: total,
      activeConnections: excellent + good,
      averageQuality: excellent > total * 0.7 ? "excellent" : good > total * 0.5 ? "good" : "fair",
    };
  }

  // ============================================================
  // 事件系统
  // ============================================================

  on(event: string, callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, data?: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[AIFamilyTelemetry] Event handler error for ${event}:`, error);
        }
      });
    }
  }

  private setupEventListeners(): void {
    // 全局错误处理
    window.addEventListener("unhandledrejection", (event) => {
      console.error("[AIFamilyTelemetry] Unhandled promise rejection:", event.reason);
      this.emit("error", event.reason);
    });
  }

  // ============================================================
  // 工具方法
  // ============================================================

  private generateSessionId(): string {
    return `sess-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  destroy(): void {
    // 结束所有活跃会话
    for (const [sessionId] of this.sessions) {
      if (this.sessions.get(sessionId)?.status !== "ended") {
        this.endSession(sessionId);
      }
    }

    // 清理资源
    this.stopAllStreams();
    this.activeConnections.clear();
    this.sessions.clear();
    this.eventListeners.clear();

    this.emit("destroyed");
  }
}

// ============================================================
// 导出单例和工具函数
// ============================================================

let telemetryInstance: AIFamilyTelemetryManager | null = null;

export function getTelemetryInstance(config?: Partial<WebRTCConfig>): AIFamilyTelemetryManager {
  if (!telemetryInstance) {
    telemetryInstance = new AIFamilyTelemetryManager(config);
  }
  return telemetryInstance;
}

export function destroyTelemetryInstance(): void {
  if (telemetryInstance) {
    telemetryInstance.destroy();
    telemetryInstance = null;
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function getConnectionQualityColor(quality: ConnectionQuality): string {
  switch (quality) {
    case "excellent":
      return "#10B981"; // green
    case "good":
      return "#3B82F6"; // blue
    case "fair":
      return "#F59E0B"; // yellow
    case "poor":
      return "#EF4444"; // red
    case "disconnected":
      return "#9CA3AF"; // gray
    default:
      return "#6B7280";
  }
}

export function estimateBandwidth(quality: ConnectionQuality): {
  downloadKbps: number;
  uploadKbps: number;
  recommendedResolution: string;
} {
  switch (quality) {
    case "excellent":
      return {
        downloadKbps: 5000,
        uploadKbps: 2500,
        recommendedResolution: "1080p",
      };
    case "good":
      return {
        downloadKbps: 2500,
        uploadKbps: 1200,
        recommendedResolution: "720p",
      };
    case "fair":
      return {
        downloadKbps: 1000,
        uploadKbps: 500,
        recommendedResolution: "480p",
      };
    case "poor":
      return {
        downloadKbps: 500,
        uploadKbps: 250,
        recommendedResolution: "360p",
      };
    default:
      return {
        downloadKbps: 0,
        uploadKbps: 0,
        recommendedResolution: "audio-only",
      };
  }
}
