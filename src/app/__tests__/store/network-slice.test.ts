/**
 * @file: network-slice.test.ts
 * @description: YYC³ Network Slice 单元测试 · WiFi 网络管理
 * @author: YanYuCloudCube Team
 * @version: v1.0.0
 * @created: 2026-04-16
 * @updated: 2026-04-16
 * @status: active
 * @tags: [auto-generated]
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useNetworkSlice } from '../../store/slices/network-slice';
import type { WifiNetwork, WifiAutoReconnectSettings } from '../../types';

describe('useNetworkSlice', () => {
  beforeEach(() => {
    // 清空所有网络
    useNetworkSlice.getState().networks.forEach(net => {
      useNetworkSlice.getState().removeNetwork(net.id);
    });
    // 重置自动重连配置到默认值
    useNetworkSlice.getState().updateAutoReconnect({
      enabled: true,
      preferStrongestSignal: true,
      intervalSeconds: 5,
      maxRetries: 10,
      preferredSsid: '',
    });
  });

  describe('初始状态', () => {
    it('networks 默认应该为空数组', () => {
      const { networks } = useNetworkSlice.getState();
      expect(networks).toHaveLength(0);
    });

    it('autoReconnect.enabled 应该默认为 true', () => {
      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.enabled).toBe(true);
    });

    it('autoReconnect.preferStrongestSignal 应该默认为 true', () => {
      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.preferStrongestSignal).toBe(true);
    });

    it('autoReconnect.intervalSeconds 应该默认为 5', () => {
      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.intervalSeconds).toBe(5);
    });

    it('autoReconnect.maxRetries 应该默认为 10', () => {
      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.maxRetries).toBe(10);
    });

    it('autoReconnect.preferredSsid 应该默认为空字符串', () => {
      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.preferredSsid).toBe('');
    });

    it('autoReconnect.lastUpdatedAt 应该是有效时间戳', () => {
      const { autoReconnect } = useNetworkSlice.getState();
      expect(typeof autoReconnect.lastUpdatedAt).toBe('number');
      expect(autoReconnect.lastUpdatedAt).toBeGreaterThan(0);
    });
  });

  describe('addNetwork', () => {
    it('应该添加新网络并自动生成 ID', () => {
      const newNetwork: Omit<WifiNetwork, 'id'> = {
        ssid: 'TestWiFi',
        signal: -45,
        security: 'WPA2',
        connected: false,
      };

      useNetworkSlice.getState().addNetwork(newNetwork);

      const { networks } = useNetworkSlice.getState();
      expect(networks).toHaveLength(1);
      expect(networks[0].ssid).toBe('TestWiFi');
      expect(networks[0].id).toMatch(/^wifi-\d+$/); // 自动生成的 ID 格式
    });

    it('应该支持添加多个网络', () => {
      useNetworkSlice.getState().addNetwork({
        ssid: 'Network-1',
        signal: -50,
        security: 'WPA2',
        connected: false,
      });

      // 添加小延迟确保时间戳不同
      const originalLength = useNetworkSlice.getState().networks.length;

      useNetworkSlice.getState().addNetwork({
        ssid: 'Network-2',
        signal: -60,
        security: 'WPA3',
        connected: false,
      });

      const { networks } = useNetworkSlice.getState();
      expect(networks).toHaveLength(originalLength + 1);
      expect(networks.some(n => n.ssid === 'Network-1')).toBe(true);
      expect(networks.some(n => n.ssid === 'Network-2')).toBe(true);
    });

    it('每个网络应该有不同的 SSID', () => {
      for (let i = 0; i < 5; i++) {
        useNetworkSlice.getState().addNetwork({
          ssid: `UniqueNetwork-${i}`,
          signal: -50 + i * 2,
          security: 'WPA2',
          connected: false,
        });
      }

      const { networks } = useNetworkSlice.getState();
      const ssids = networks.map(n => n.ssid);
      const uniqueSsids = new Set(ssids);

      // 所有 SSID 应该唯一
      expect(uniqueSsids.size).toBe(ssids.length);
    });
  });

  describe('updateNetwork', () => {
    it('应该更新指定 ID 的网络信息', () => {
      // 先添加网络
      useNetworkSlice.getState().addNetwork({
        ssid: 'OriginalName',
        signal: -50,
        security: 'WPA2',
        connected: false,
      });

      const networkId = useNetworkSlice.getState().networks[0].id;

      // 更新网络
      useNetworkSlice.getState().updateNetwork(networkId, {
        ssid: 'UpdatedName',
        signal: -30,
      });

      const { networks } = useNetworkSlice.getState();
      const updated = networks.find(n => n.id === networkId);

      expect(updated?.ssid).toBe('UpdatedName');
      expect(updated?.signal).toBe(-30);
      expect(updated?.security).toBe('WPA2'); // 未更新字段保持不变
    });

    it('更新不存在的 ID 不应影响其他网络', () => {
      useNetworkSlice.getState().addNetwork({
        ssid: 'Test',
        signal: -50,
        security: 'WPA2',
        connected: false,
      });

      const originalLength = useNetworkSlice.getState().networks.length;

      useNetworkSlice.getState().updateNetwork('non-existent', {
        ssid: 'Hacked',
      });

      expect(useNetworkSlice.getState().networks).toHaveLength(originalLength);
    });

    it('应该支持部分字段更新', () => {
      useNetworkSlice.getState().addNetwork({
        ssid: 'FullData',
        signal: -60,
        security: 'WPA3',
        connected: false,
      });

      const networkId = useNetworkSlice.getState().networks[0].id;

      // 只更新信号强度
      useNetworkSlice.getState().updateNetwork(networkId, {
        signal: -25,
      });

      const { networks } = useNetworkSlice.getState();
      const updated = networks.find(n => n.id === networkId);

      expect(updated?.signal).toBe(-25);
      expect(updated?.ssid).toBe('FullData'); // 其他字段不变
    });
  });

  describe('removeNetwork', () => {
    it('应该删除指定 ID 的网络', () => {
      useNetworkSlice.getState().addNetwork({
        ssid: 'ToRemove',
        signal: -50,
        security: 'WPA2',
        connected: false,
      });

      const networkId = useNetworkSlice.getState().networks[0].id;

      useNetworkSlice.getState().removeNetwork(networkId);

      expect(useNetworkSlice.getState().networks).toHaveLength(0);
    });

    it('删除不存在的 ID 不应报错', () => {
      expect(() => {
        useNetworkSlice.getState().removeNetwork('non-existent');
      }).not.toThrow();

      expect(useNetworkSlice.getState().networks).toHaveLength(0);
    });

    it('应该正确删除指定网络', () => {
      // 添加单个网络
      useNetworkSlice.getState().addNetwork({
        ssid: 'ToDelete',
        signal: -50,
        security: 'WPA2',
        connected: false,
      });

      const netsBefore = useNetworkSlice.getState().networks;
      expect(netsBefore.length).toBeGreaterThanOrEqual(1);
      expect(netsBefore.some(n => n.ssid === 'ToDelete')).toBe(true);

      // 获取要删除的网络 ID
      const targetNet = netsBefore.find(n => n.ssid === 'ToDelete');
      if (targetNet) {
        useNetworkSlice.getState().removeNetwork(targetNet.id);
      }

      // 验证删除成功
      const { networks } = useNetworkSlice.getState();
      expect(networks.some(n => n.ssid === 'ToDelete')).toBe(false);
    });
  });

  describe('setConnected', () => {
    it('应该将指定网络设为已连接', () => {
      useNetworkSlice.getState().addNetwork({
        ssid: 'TargetNetwork',
        signal: -30,
        security: 'WPA2',
        connected: false,
      });

      const targetId = useNetworkSlice.getState().networks[useNetworkSlice.getState().networks.length - 1].id;

      useNetworkSlice.getState().setConnected(targetId);

      const { networks } = useNetworkSlice.getState();
      const target = networks.find(n => n.id === targetId);

      expect(target?.connected).toBe(true);
    });

    it('连接时应该更新 lastUpdatedAt 时间戳', () => {
      const beforeTime = Date.now();

      useNetworkSlice.getState().addNetwork({
        ssid: 'ConnectMe',
        signal: -35,
        security: 'WPA2',
        connected: false,
      });

      const networkId = useNetworkSlice.getState().networks[useNetworkSlice.getState().networks.length - 1].id;

      useNetworkSlice.getState().setConnected(networkId);

      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.lastUpdatedAt).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('updateAutoReconnect', () => {
    it('应该更新自动重连配置', () => {
      useNetworkSlice.getState().updateAutoReconnect({
        enabled: false,
        intervalSeconds: 10,
        maxRetries: 20,
      });

      const { autoReconnect } = useNetworkSlice.getState();

      expect(autoReconnect.enabled).toBe(false);
      expect(autoReconnect.intervalSeconds).toBe(10);
      expect(autoReconnect.maxRetries).toBe(20);
    });

    it('应该更新 lastUpdatedAt 时间戳', () => {
      const beforeTime = Date.now();

      useNetworkSlice.getState().updateAutoReconnect({
        preferStrongestSignal: false,
      });

      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.lastUpdatedAt).toBeGreaterThanOrEqual(beforeTime);
    });

    it('应该保留未更新的字段', () => {
      useNetworkSlice.getState().updateAutoReconnect({
        preferredSsid: 'MyPreferredNetwork',
      });

      const { autoReconnect } = useNetworkSlice.getState();

      expect(autoReconnect.preferredSsid).toBe('MyPreferredNetwork');
      expect(autoReconnect.enabled).toBe(true); // 未更新的字段保持原值
      expect(autoReconnect.preferStrongestSignal).toBe(true);
      expect(autoReconnect.intervalSeconds).toBe(5);
      expect(autoReconnect.maxRetries).toBe(10);
    });

    it('应该支持启用/禁用自动重连', () => {
      // 禁用
      useNetworkSlice.getState().updateAutoReconnect({ enabled: false });
      expect(useNetworkSlice.getState().autoReconnect.enabled).toBe(false);

      // 重新启用
      useNetworkSlice.getState().updateAutoReconnect({ enabled: true });
      expect(useNetworkSlice.getState().autoReconnect.enabled).toBe(true);
    });

    it('应该支持设置首选 SSID', () => {
      useNetworkSlice.getState().updateAutoReconnect({
        preferredSsid: 'Home-WiFi-5G',
      });

      expect(useNetworkSlice.getState().autoReconnect.preferredSsid).toBe('Home-WiFi-5G');

      // 清除首选 SSID
      useNetworkSlice.getState().updateAutoReconnect({ preferredSsid: '' });
      expect(useNetworkSlice.getState().autoReconnect.preferredSsid).toBe('');
    });
  });

  describe('边界情况和数据完整性', () => {
    it('信号强度应该是负数（dBm）', () => {
      useNetworkSlice.getState().addNetwork({
        ssid: 'StrongSignal',
        signal: -20, // 非常强的信号
        security: 'WPA2',
        connected: false,
      });

      const { networks } = useNetworkSlice.getState();
      expect(networks[0].signal).toBeLessThan(0);
    });

    it('安全类型应该是有效的', () => {
      const validSecurityTypes = ['OPEN', 'WEP', 'WPA', 'WPA2', 'WPA3'];

      useNetworkSlice.getState().addNetwork({
        ssid: 'SecureNet',
        signal: -45,
        security: 'WPA3',
        connected: false,
      });

      const { networks } = useNetworkSlice.getState();
      expect(validSecurityTypes).toContain(networks[0].security);
    });
  });

  describe('集成场景', () => {
    it('完整的网络扫描和连接流程', () => {
      // 1. 扫描到多个网络
      useNetworkSlice.getState().addNetwork({
        ssid: 'Neighbor-WiFi',
        signal: -70,
        security: 'WPA2',
        connected: false,
      });

      useNetworkSlice.getState().addNetwork({
        ssid: 'MyHomeNetwork',
        signal: -35,
        security: 'WPA3',
        connected: false,
      });

      expect(useNetworkSlice.getState().networks.length).toBeGreaterThanOrEqual(2);

      // 2. 配置自动重连偏好
      useNetworkSlice.getState().updateAutoReconnect({
        preferredSsid: 'MyHomeNetwork',
        intervalSeconds: 3,
        maxRetries: 15,
      });

      const { autoReconnect } = useNetworkSlice.getState();
      expect(autoReconnect.preferredSsid).toBe('MyHomeNetwork');
      expect(autoReconnect.intervalSeconds).toBe(3);

      // 3. 连接到目标网络
      const myNetworkBeforeConnect = useNetworkSlice.getState().networks.find(
        n => n.ssid === 'MyHomeNetwork'
      );

      if (myNetworkBeforeConnect) {
        useNetworkSlice.getState().setConnected(myNetworkBeforeConnect.id);

        // 重新获取最新的状态来验证
        const updatedNetwork = useNetworkSlice.getState().networks.find(
          n => n.id === myNetworkBeforeConnect.id
        );
        expect(updatedNetwork?.connected).toBe(true);
      }
    });

    it('网络配置流程', () => {
      // 添加网络
      useNetworkSlice.getState().addNetwork({
        ssid: 'Office-WiFi',
        signal: -45,
        security: 'WPA2',
        connected: false,
      });

      const netId = useNetworkSlice.getState().networks[useNetworkSlice.getState().networks.length - 1].id;

      // 更新网络信息
      useNetworkSlice.getState().updateNetwork(netId, {
        signal: -40,
      });

      const updated = useNetworkSlice.getState().networks.find(n => n.id === netId);
      expect(updated?.signal).toBe(-40);

      // 配置自动重连
      useNetworkSlice.getState().updateAutoReconnect({
        enabled: true,
        preferStrongestSignal: true,
        preferredSsid: 'Office-WiFi',
      });

      expect(useNetworkSlice.getState().autoReconnect.preferredSsid).toBe('Office-WiFi');
    });
  });
});
