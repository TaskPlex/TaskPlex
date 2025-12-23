use tauri_plugin_shell::ShellExt;
use std::sync::Arc;
use tokio::sync::Mutex;

// Global state to track backend readiness
static BACKEND_READY: Arc<Mutex<bool>> = Arc::new(Mutex::new(false));

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      // Lancer le sidecar Python au démarrage sur un port dédié pour éviter les conflits avec Docker
      // Port 8001 pour Tauri, port 8000 pour Docker/web
      let sidecar = app.shell().sidecar("taskplex-backend").map_err(|e| {
        eprintln!("Failed to create sidecar: {}", e);
        e
      })?;
      
      let (mut rx, _child) = sidecar
        .args(&["8001"])
        .spawn()
        .map_err(|e| {
          eprintln!("Failed to spawn sidecar: {}", e);
          e
        })?;

      let ready_flag = Arc::clone(&BACKEND_READY);
      
      // Logguer la sortie du backend et détecter quand il est prêt
      tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
          match event {
            tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
              let log = String::from_utf8_lossy(&line);
              println!("Backend stdout: {}", log);
              
              // Détecter quand le backend est prêt (cherche le message de démarrage)
              if log.contains("Application startup complete") || 
                 log.contains("Uvicorn running on") ||
                 log.contains("Started server process") ||
                 log.contains("on port") {
                let mut ready = ready_flag.lock().await;
                *ready = true;
                println!("Backend is ready!");
              }
            }
            tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
              let log = String::from_utf8_lossy(&line);
              eprintln!("Backend stderr: {}", log);
              
              // Sur Windows, certaines erreurs peuvent être dans stderr mais ne sont pas fatales
              if log.contains("on port") || log.contains("Uvicorn running") {
                let mut ready = ready_flag.lock().await;
                *ready = true;
                println!("Backend is ready (from stderr)!");
              }
            }
            tauri_plugin_shell::process::CommandEvent::Terminated { code, signal } => {
              eprintln!("Backend terminated with code: {:?}, signal: {:?}", code, signal);
            }
            _ => {}
          }
        }
        eprintln!("Backend process ended");
      });
      
      // Attendre un peu pour que le backend démarre (timeout après 10 secondes)
      let ready_flag_init = Arc::clone(&BACKEND_READY);
      tauri::async_runtime::spawn(async move {
        tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
        let mut ready = ready_flag_init.lock().await;
        if !*ready {
          println!("Warning: Backend may not be ready yet, but continuing anyway...");
          *ready = true; // Continue anyway after timeout
        }
      });
      
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
