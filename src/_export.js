/**
 * 创作套件 — 文件导出 v7
 * 使用 Tauri 内置的系统原生保存对话框（macOS Finder / Windows 资源管理器）
 * 需要 tauri.conf.json: build.withGlobalTauri=true, dialog.all=true, fs.all=true
 *
 * v7 修复: 返回 Promise，让调用方自行处理 toast
 */
window.SuiteExport = (function () {

  /**
   * 保存文件到用户选择的位置
   * @param {string} filename - 默认文件名
   * @param {string} content - 文件内容
   * @returns {Promise<{success: boolean, path?: string, error?: string}>}
   */
  async function save(filename, content) {
    const T = window.__TAURI__;
    if (!T) {
      // 非 Tauri 环境降级到浏览器下载
      _browserDownload(filename, content);
      return { success: true, path: 'browser-download' };
    }

    try {
      // 弹出系统原生保存对话框，用户自己选位置和文件名
      const savePath = await T.dialog.save({
        defaultPath: filename,
        filters: [{
          name: '数据文件',
          extensions: [filename.split('.').pop()]
        }]
      });

      if (!savePath) {
        return { success: false, error: 'cancelled' }; // 用户点了取消
      }

      await T.fs.writeTextFile(savePath, content);
      return { success: true, path: savePath };

    } catch (e) {
      console.error('导出失败:', e);
      // 降级到浏览器下载
      _browserDownload(filename, content);
      return { success: true, path: 'browser-download', fallback: true };
    }
  }

  function _browserDownload(filename, content) {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  return { save };
})();