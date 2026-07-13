import { app, BrowserWindow, Tray, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { startUp } from './server/Configs/database.js'
import { registerAllIpc } from './server/index.server.js'



const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null = null
let isQuitting:boolean = false

function createWindow() {
  const iconPath = path.join(process.env.VITE_PUBLIC, 'merakifav.png');
  
  win = new BrowserWindow({
    icon: iconPath,
    width: 900,
    height: 680,
    autoHideMenuBar: true, // Oculta el menú tipo navegador (Archivo, Editar, etc.)
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  // --- Lógica del System Tray (Bandeja del Sistema) ---
  tray = new Tray(iconPath)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Abrir Meraki', click: () => {
      if (win && !win.isDestroyed()) {
          win.show()
          win.focus()
        }
      } 
    },
    { type: 'separator' },
    { label: 'Salir', 
      click: () =>{ 
        isQuitting = true
        tray?.destroy()
        app.quit() 
    }}
  ])
  
  tray.setToolTip('Meraki')
  tray.setContextMenu(contextMenu)

  // Opcional: Que un clic izquierdo en el icono de la bandeja abra/enfoque la app
  tray.on('click', () => {
    if (win) {
      if (win.isVisible()) {
        win.focus()
      } else {
        win.show()
      }
    }
  })

  // Opcional: "Minimizar a la bandeja" (la ventana desaparece de la barra de tareas)
  // Si deseas que quede en la barra Y en la bandeja, borra o comenta esto:
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  win.on('minimize', (event: any) => {
    event.preventDefault()
    win?.hide()
  })
  win.on('close', (event) => {
  if (!isQuitting) {
    event.preventDefault()
    win?.hide()
  }
})

win.on('closed', () => {
  win = null
})
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//     win = null
//   }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//app.whenReady().then(createWindow)
async function bootstrap (){
  try {
    await startUp(true)
    await app.whenReady()
    registerAllIpc()
    createWindow()
    console.log('todo bien')
  } catch (error) {
    console.error(error)
    app.quit()
  }
}
bootstrap()
