use std::sync::Mutex;
use tauri::menu::{IsMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{Emitter, Manager, WindowEvent};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_global_shortcut::ShortcutState;

// Build the tray menu with the current focus items as a "Focus vandaag" submenu.
fn build_tray_menu<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    focus: &[String],
) -> tauri::Result<tauri::menu::Menu<R>> {
    let show = MenuItem::with_id(app, "show", "Open Giulia", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Giulia", true, None::<&str>)?;

    let mut focus_items: Vec<MenuItem<R>> = Vec::new();
    if focus.is_empty() {
        focus_items.push(MenuItem::with_id(app, "f0", "Geen focus vandaag", false, None::<&str>)?);
    } else {
        for (i, t) in focus.iter().take(10).enumerate() {
            focus_items.push(MenuItem::with_id(app, format!("f{i}"), t, false, None::<&str>)?);
        }
    }
    let focus_refs: Vec<&dyn IsMenuItem<R>> = focus_items.iter().map(|i| i as &dyn IsMenuItem<R>).collect();
    let focus_sub = Submenu::with_items(app, "Focus vandaag", true, &focus_refs)?;

    let items: Vec<&dyn IsMenuItem<R>> = vec![&show, &sep, &focus_sub, &sep, &quit];
    Menu::with_items(app, &items)
}

/// Frontend-callable: rebuild the tray menu from the latest DailyPlan focus items.
#[tauri::command]
fn update_tray_focus(app: tauri::AppHandle, items: Vec<String>) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("no tray")?;
    let menu = build_tray_menu(&app, &items).map_err(|e| e.to_string())?;
    tray.set_menu(Some(menu)).map_err(|e| e.to_string())?;
    Ok(())
}

/// Frontend-callable: store the focus items in app state (optional cache).
#[tauri::command]
fn set_focus_items(state: tauri::State<'_, Mutex<Vec<String>>>, items: Vec<String>) {
    *state.lock().unwrap() = items;
}

pub fn run() {
    let shortcut_plugin = tauri_plugin_global_shortcut::Builder::new()
        .with_shortcut("Ctrl+Shift+Space")
        .expect("invalid shortcut")
        .with_handler(|app, _shortcut, event| {
            if event.state == ShortcutState::Pressed {
                if let Some(palette) = app.get_webview_window("palette") {
                    let _ = palette.show();
                    let _ = palette.set_focus();
                }
            }
        })
        .build();

    tauri::Builder::default()
        .plugin(shortcut_plugin)
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--hidden"]),
        ))
        .manage(Mutex::new(Vec::<String>::default()))
        .on_window_event(|window, event| {
            if let WindowEvent::Focused(false) = event {
                if window.label() == "palette" {
                    let _ = window.hide();
                }
            }
        })
        .setup(|app| {
            // Start with Windows (background, via --hidden arg). Reuses the tray.
            let _ = app.app_handle().autostart().enable();

            let menu = build_tray_menu(app.handle(), &[])?;
            let mut tray_builder = TrayIconBuilder::with_id("main");
            // Tauri v2 note: default_window_icon() can be None if icons weren't generated
            // yet (e.g. first CI run before `tauri icon` ran) — guard instead of unwrap().
            if let Some(icon) = app.default_window_icon() {
                tray_builder = tray_builder.icon(icon.clone());
            }
            let _tray = tray_builder
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state,
                        ..
                    } = event
                    {
                        if button_state == MouseButtonState::Up {
                            let app = tray.app_handle();
                            if let Some(w) = app.get_webview_window("main") {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            // Notify the frontend once the main window is ready (for initial focus sync).
            app.get_webview_window("main")
                .and_then(|w| w.emit("tauri://ready", ()).ok());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_tray_focus, set_focus_items])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}