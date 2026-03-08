/**
 * 云函数调用封装
 * Alpha 阶段使用本地 mock，后续切换为真实 CloudBase 调用
 */

interface CloudResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

export async function callCloud<T = any>(
  name: string,
  data: Record<string, any> = {},
): Promise<CloudResult<T>> {
  try {
    // TODO: 替换为腾讯云 CloudBase 调用
    // const res = await wx.cloud.callFunction({ name, data })
    // return { success: true, data: res.result as T }

    console.log(`[Cloud] 调用 ${name}`, data)

    // Alpha 阶段: 本地 mock 路由
    const handler = mockHandlers[name]
    if (handler) {
      const result = await handler(data)
      return { success: true, data: result as T }
    }

    return { success: false, error: `未知云函数: ${name}` }
  } catch (err: any) {
    console.error(`[Cloud] ${name} 失败`, err)
    return { success: false, error: err.message || '调用失败' }
  }
}

// Alpha mock handlers
const mockHandlers: Record<string, (data: any) => Promise<any>> = {}

export function registerMockHandler(name: string, handler: (data: any) => Promise<any>) {
  mockHandlers[name] = handler
}
