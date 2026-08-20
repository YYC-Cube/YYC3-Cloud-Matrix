/**
 * @file: useClock.ts
 * @description: 实时时钟 Hook — 每秒更新的 Date 对象
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-20
 * @updated: 2026-04-20
 * @status: active
 * @tags: [hook],[clock]
 */

import { useEffect, useState } from "react";

export function useClock(): Date {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const msUntilNextSecond = 1000 - Date.now() % 1000;
    const initTimer = setTimeout(() => {
      update();
      const timer = setInterval(update, 1000);
      return () => clearInterval(timer);
    }, msUntilNextSecond);
    return () => clearTimeout(initTimer);
  }, []);
  return now;
}

export function useClockMinutes(): Date {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
    const initTimer = setTimeout(() => {
      update();
      const timer = setInterval(update, 60000);
      return () => clearInterval(timer);
    }, msUntilNextMinute);
    return () => clearTimeout(initTimer);
  }, []);
  return now;
}
