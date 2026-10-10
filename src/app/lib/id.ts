let seq = 0;

/**
 * 生成带前缀的唯一 id。
 * 时间戳后附加单调递增序号，防止同毫秒内批量创建时 id 碰撞
 * （CI 高速执行或真实场景快速连续添加均会触发）。
 */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${(++seq).toString(36)}`;
}
