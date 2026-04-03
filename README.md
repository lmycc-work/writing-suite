# 创作套件 — 桌面应用打包说明

整合了小说工坊、剧本工坊、读书记录三个工具的桌面应用。
基于 **Tauri** 打包，体积约 5–8 MB，内存占用 ~60 MB（比 Electron 少 80%）。

---

## 跨平台打包说明

**Tauri 必须在目标平台上打包**，无法跨系统交叉编译（Apple 的限制）：

| 要生成的包 | 必须在哪台电脑上运行 `npm run build` |
|-----------|--------------------------------------|
| Windows `.exe` / `.msi` | Windows 电脑 |
| macOS `.app` / `.dmg`   | Mac 电脑     |

所以你需要：
- 在 **Windows** 上 build 一次 → 得到 Windows 安装包
- 在 **Mac** 上 build 一次 → 得到 macOS 安装包

两台电脑上用的是同一套源码，数据文件（localStorage）各自独立存储，用导出/导入 JSON 互相迁移数据。

---

## 开发者工具（查看控制台）

打包后按 `F12`（Windows）或 `Cmd+Option+I`（macOS）打开 DevTools。
已在 `Cargo.toml` 的 features 里开启了 `devtools`，release 版本也可用。

---



打包后数据自动保存到系统 AppData 目录：

| 平台    | 路径                                              |
|---------|---------------------------------------------------|
| macOS   | `~/Library/Application Support/com.writingsuite.app/` |
| Windows | `C:\Users\你的用户名\AppData\Roaming\com.writingsuite.app\` |

三个数据文件：
- `novel_workshop_v1.json` — 小说工坊数据
- `screenplay_v5.json`     — 剧本工坊数据
- `rtrack2.json`           — 读书记录数据

**跨设备迁移**：把这三个 json 文件复制到新电脑对应目录即可，数据完全跟随。

---

## 环境准备（一次性）

### macOS

```bash
# 1. 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# 2. 安装 Xcode Command Line Tools（如未装）
xcode-select --install

# 3. 安装 Node.js（如未装，推荐用 homebrew）
brew install node
```

### Windows

1. 安装 **Rust**：https://win.rustup.rs （下载 rustup-init.exe 运行）
2. 安装 **Visual Studio Build Tools**：
   - 下载 https://aka.ms/vs/17/release/vs_BuildTools.exe
   - 勾选「使用 C++ 的桌面开发」工作负载
3. 安装 **WebView2**（Windows 11 已自带；Windows 10 需手动安装）：
   https://developer.microsoft.com/zh-cn/microsoft-edge/webview2/
4. 安装 **Node.js**：https://nodejs.org （选 LTS 版本）

---

## 构建步骤

```bash
# 进入项目目录
cd writing-suite

# 安装依赖（只需执行一次）
npm install

# ── 开发模式（直接打开窗口，修改 src/ 下文件即时生效）──
npm run dev

# ── 打包发布版 ──
npm run build
```

### 打包产物位置

```
src-tauri/target/release/bundle/
├── macos/
│   └── 创作套件.app          ← 直接拖入 /Applications 即可
├── dmg/
│   └── 创作套件_1.0.0_x64.dmg
└── msi/  (Windows)
    └── 创作套件_1.0.0_x64_en-US.msi
```

---

## 图标（可选）

在 `src-tauri/icons/` 目录下放以下文件可自定义图标：

| 文件名               | 尺寸           | 用途                    |
|----------------------|----------------|-------------------------|
| `32x32.png`          | 32×32 px       | Windows 系统图标        |
| `128x128.png`        | 128×128 px     | Linux / Windows        |
| `128x128@2x.png`     | 256×256 px     | 高分屏                  |
| `icon.icns`          | 多尺寸         | macOS 图标              |
| `icon.ico`           | 多尺寸         | Windows 图标            |

快速生成：准备一张 1024×1024 的 PNG，运行：
```bash
npx @tauri-apps/cli icon 你的图标.png
```
会自动生成所有格式。

---

## 首次构建较慢说明

Tauri 第一次 `npm run build` 需要编译 Rust 依赖，耗时约 **3–8 分钟**（取决于网速和 CPU）。
后续增量编译只需 **10–30 秒**。

---

## 常见问题

**Q：Windows 构建报错 `error: linker 'link.exe' not found`**
A：需要安装 Visual Studio Build Tools，见上方环境准备步骤 2。

**Q：macOS 打开提示"无法验证开发者"**
A：右键点击 .app → 打开 → 选择打开，或在「系统设置 → 隐私与安全性」中允许。

**Q：数据文件太大导致写入慢**
A：图片（封面、头像）以 base64 内嵌存储。如果书封面很多，可以考虑只存文件路径。
   目前设计下，几百本书 + 数十个头像的数据通常在 5 MB 以内，写入速度不受影响。
