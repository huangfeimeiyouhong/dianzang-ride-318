/**
 * 云函数调用封装
 * 统一错误处理、重试、Loading 提示
 */

interface CallOptions {
  showLoading?: boolean;
  loadingText?: string;
  retries?: number;
}

/** 调用云函数（带自动重试和 Loading） */
export async function callCloud<T = any>(
  name: string,
  data: Record<string, any> = {},
  options: CallOptions = {}
): Promise<T> {
  const { showLoading = false, loadingText = '加载中…', retries = 1 } = options;

  if (showLoading) {
    wx.showLoading({ title: loadingText, mask: true });
  }

  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const res = await wx.cloud.callFunction({ name, data });
      if (showLoading) wx.hideLoading();
      return res.result as T;
    } catch (e) {
      lastError = e as Error;
      console.warn(`[Cloud] ${name} attempt ${i + 1} failed:`, e);
      // 短暂等待后重试
      if (i < retries) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
  }

  if (showLoading) wx.hideLoading();
  throw lastError;
}

/** 批量写入云数据库（退出/切后台时调用） */
export async function batchSync(collection: string, docId: string, data: Record<string, any>): Promise<void> {
  const db = wx.cloud.database();
  try {
    await db.collection(collection).doc(docId).update({ data });
  } catch {
    await db.collection(collection).add({ data: { _id: docId, ...data } });
  }
}
