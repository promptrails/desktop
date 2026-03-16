use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconEvent};
use tauri::{AppHandle, Manager, PhysicalPosition};

pub fn setup_tray_menu(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let open = MenuItemBuilder::with_id("open", "Open Monitor").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

    let menu = MenuBuilder::new(app).items(&[&open, &quit]).build()?;

    if let Some(tray) = app.tray_by_id("main") {
        tray.set_menu(Some(menu))?;
        // Show menu only on right-click
        tray.set_show_menu_on_left_click(false)?;

        tray.on_menu_event(move |app, event| match event.id().as_ref() {
            "open" => {
                open_main_window(app);
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        });

        tray.on_tray_icon_event(|tray, event| {
            // Only toggle panel on left click
            if let TrayIconEvent::Click {
                position,
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                toggle_tray_panel(tray.app_handle(), position);
            }
        });
    }

    Ok(())
}

fn toggle_tray_panel(app: &AppHandle, click_pos: PhysicalPosition<f64>) {
    if let Some(panel) = app.get_webview_window("tray-panel") {
        if panel.is_visible().unwrap_or(false) {
            let _ = panel.hide();
            return;
        }

        // Position panel near the tray icon
        let panel_width: f64 = 320.0;
        let x = (click_pos.x - panel_width / 2.0).max(0.0) as i32;

        // On macOS menu bar is at top, panel goes below
        #[cfg(target_os = "macos")]
        let y = click_pos.y as i32;

        // On Windows/Linux, tray is at bottom, panel goes above
        #[cfg(not(target_os = "macos"))]
        let y = (click_pos.y as i32 - 420).max(0);

        let _ = panel.set_position(PhysicalPosition::new(x, y));
        let _ = panel.show();
        let _ = panel.set_focus();
    }
}

pub fn open_main_window(app: &AppHandle) {
    // Hide tray panel first
    if let Some(panel) = app.get_webview_window("tray-panel") {
        let _ = panel.hide();
    }
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

pub fn update_tray_tooltip(app: &AppHandle, status: &str) {
    if let Some(tray) = app.tray_by_id("main") {
        let tooltip = format!("PromptRails Monitor - {}", status);
        let _ = tray.set_tooltip(Some(&tooltip));
    }
}
