/**
 * 云函数调用封装
 * 统一错误处理、重试、Loading 提示
 */
/** 调用云函数（带自动重试和 Loading） */
export async function callCloud(name, data = {}, options = {}) {
    const { showLoading = false, loadingText = '加载中…', retries = 1 } = options;
    if (showLoading) {
        wx.showLoading({ title: loadingText, mask: true });
    }
    let lastError = null;
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await wx.cloud.callFunction({ name, data });
            if (showLoading)
                wx.hideLoading();
            return res.result;
        }
        catch (e) {
            lastError = e;
            console.warn(`[Cloud] ${name} attempt ${i + 1} failed:`, e);
            // 短暂等待后重试
            if (i < retries) {
                await new Promise(r => setTimeout(r, 500 * (i + 1)));
            }
        }
    }
    if (showLoading)
        wx.hideLoading();
    throw lastError;
}
/** 批量写入云数据库（退出/切后台时调用） */
export async function batchSync(collection, docId, data) {
    const db = wx.cloud.database();
    try {
        await db.collection(collection).doc(docId).update({ data });
    }
    catch (_a) {
        await db.collection(collection).add({ data: Object.assign({ _id: docId }, data) });
    }
}
