#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::path;

#[tauri::command]
fn save_file(filename: String, content: String, dest: String) -> Result<String, String> {
    let dir = match dest.as_str() {
        "documents" => path::document_dir(),
        "desktop"   => path::desktop_dir(),
        _           => path::download_dir(),
    }.ok_or_else(|| format!("无法获取目录: {}", dest))?;

    let full_path = dir.join(&filename);
    std::fs::write(&full_path, content.as_bytes())
        .map_err(|e| format!("写文件失败: {}", e))?;
    Ok(full_path.to_string_lossy().to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
