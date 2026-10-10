/**
 * @file 音频可视化组件
 * @description 基于Web Audio API的频谱可视化
 * @author YYC³ Team
 * @version 1.0.0
 */

import React, { useRef, useEffect } from 'react';
import type { AudioAnalyzerData } from '../../lib/music/AudioPlayerService';

interface AudioVisualizerProps {
  analyzerData: AudioAnalyzerData | null;
  type?: 'bars' | 'wave' | 'circle' | 'particles';
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyzerData,
  type = 'bars',
  color = '#00d4ff',
  height = 100,
  width,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    const canvasWidth = width || canvas.offsetWidth;
    const canvasHeight = height;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const draw = () => {
      if (!analyzerData) {
        drawIdle(ctx, canvasWidth, canvasHeight, color);
        return;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      switch (type) {
        case 'bars':
          drawBars(ctx, analyzerData, canvasWidth, canvasHeight, color);
          break;
        case 'wave':
          drawWave(ctx, analyzerData, canvasWidth, canvasHeight, color);
          break;
        case 'circle':
          drawCircle(ctx, analyzerData, canvasWidth, canvasHeight, color);
          break;
        case 'particles':
          drawParticles(ctx, analyzerData, canvasWidth, canvasHeight, color);
          break;
      }
    };

    draw();
  }, [analyzerData, type, color, height, width]);

  return (
    <canvas
      ref={canvasRef}
      className={`audio-visualizer ${className}`}
      style={{ width: width || '100%', height }}
    />
  );
};

function drawIdle(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
) {
  const barCount = 32;
  const barWidth = width / barCount - 2;

  for (let i = 0; i < barCount; i++) {
    const barHeight = Math.random() * 10 + 5;
    const x = i * (barWidth + 2);
    const y = height - barHeight;

    const gradient = ctx.createLinearGradient(x, y, x, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}20`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
}

function drawBars(
  ctx: CanvasRenderingContext2D,
  data: AudioAnalyzerData,
  width: number,
  height: number,
  color: string
) {
  const barCount = 64;
  const barWidth = width / barCount - 1;
  const step = Math.floor(data.frequencyData.length / barCount);

  for (let i = 0; i < barCount; i++) {
    const value = data.frequencyData[i * step];
    const barHeight = (value / 255) * height * 0.9;
    const x = i * (barWidth + 1);
    const y = height - barHeight;

    const gradient = ctx.createLinearGradient(x, y, x, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, `${color}80`);
    gradient.addColorStop(1, `${color}20`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  data: AudioAnalyzerData,
  width: number,
  height: number,
  color: string
) {
  const sliceWidth = width / data.timeDomainData.length;
  const centerY = height / 2;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  let x = 0;
  for (let i = 0; i < data.timeDomainData.length; i++) {
    const v = data.timeDomainData[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(width, centerY);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = `${color}40`;
  ctx.lineWidth = 1;
  x = 0;

  for (let i = 0; i < data.timeDomainData.length; i++) {
    const v = data.timeDomainData[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, height - y);
    } else {
      ctx.lineTo(x, height - y);
    }

    x += sliceWidth;
  }

  ctx.stroke();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  data: AudioAnalyzerData,
  width: number,
  height: number,
  color: string
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  const bars = 64;
  const step = Math.floor(data.frequencyData.length / bars);

  for (let i = 0; i < bars; i++) {
    const value = data.frequencyData[i * step];
    const barHeight = (value / 255) * radius * 0.5;
    const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;

    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + barHeight);
    const y2 = centerY + Math.sin(angle) * (radius + barHeight);

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, `${color}80`);
    gradient.addColorStop(1, color);

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = `${color}20`;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

let particles: Array<{
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
}> = [];

function drawParticles(
  ctx: CanvasRenderingContext2D,
  data: AudioAnalyzerData,
  width: number,
  height: number,
  color: string
) {
  const avgFreq =
    Array.from(data.frequencyData.slice(0, 10)).reduce((a, b) => a + b, 0) / 10;

  if (avgFreq > 100 && particles.length < 100) {
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 100,
        y: height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 4 + 2,
        life: 1,
      });
    }
  }

  particles = particles.filter((p) => p.life > 0);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.02;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = `${color}${Math.floor(p.life * 255)
      .toString(16)
      .padStart(2, '0')}`;
    ctx.fill();

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }

  const sliceWidth = width / data.timeDomainData.length;

  ctx.beginPath();
  ctx.strokeStyle = `${color}40`;
  ctx.lineWidth = 1;

  for (let i = 0; i < data.timeDomainData.length; i++) {
    const v = data.timeDomainData[i] / 128.0;
    const y = (v * height) / 2;
    const x = i * sliceWidth;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.stroke();
}

export default AudioVisualizer;
