mod tray;

use tauri::Manager;

#[tauri::command]
fn set_tray_status(app: tauri::AppHandle, status: String) {
    tray::update_tray_tooltip(&app, &status);
}

#[tauri::command]
fn open_main_window(app: tauri::AppHandle) {
    tray::open_main_window(&app);
}

#[tauri::command]
fn hide_tray_panel(app: tauri::AppHandle) {
    if let Some(panel) = app.get_webview_window("tray-panel") {
        let _ = panel.hide();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            tray::setup_tray_menu(app.handle())?;

            // Prevent windows from being destroyed on close — hide instead.
            // This keeps the tray panel and main window alive for re-show.
            if let Some(main_window) = app.get_webview_window("main") {
                let w = main_window.clone();
                main_window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = w.hide();
                    }
                });
            }

            if let Some(panel) = app.get_webview_window("tray-panel") {
                let p = panel.clone();
                panel.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = p.hide();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_tray_status,
            open_main_window,
            hide_tray_panel
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
