// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
        const path = require('path');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
        let
mainWindow;
        function createWindow() {
            // Create the browser window.
            mainWindow = new BrowserWindow({
                width: 1000,
                height: 275,
                webPreferences: {
                    preload: path.join(__dirname, 'js/preload.js')
                }
            });

            dataWindow = new BrowserWindow({
                width: 1000,
                height: 600,
                frame: false,
                webPreferences: {
                    preload: path.join(__dirname, 'js/dataWindowPreloader.js')
                }
            });

            dataWindow.setPosition(100, 375);
            //dataWindow.setMenuBarVisibility(false);
            dataWindow.setAlwaysOnTop(true);
            dataWindow.isFullScreenable(false);
            dataWindow.isMaximizable(false);
            dataWindow.isMinimizable(false);
            dataWindow.isResizable(false);
            dataWindow.setOpacity(.95);
            dataWindow.loadFile('data.html');

            mainWindow.setPosition(100, 100);
            mainWindow.setAlwaysOnTop(true);
            mainWindow.setAutoHideMenuBar(true);
            mainWindow.setOpacity(.95);
            mainWindow.isFullScreenable(false);
            mainWindow.isMaximizable(false);
            mainWindow.isMinimizable(false);
            mainWindow.isResizable(false);
            // and load the index.html of the app.
            mainWindow.loadFile('index.html');

            // Open the DevTools.
            // mainWindow.webContents.openDevTools()

            // Emitted when the window is closed.
            mainWindow.on('closed', function () {
                app.quit();
                // Dereference the window object, usually you would store windows
                // in an array if your app supports multi windows, this is the time
                // when you should delete the corresponding element.
                mainWindow = null;
            });

            dataWindow.on('closed', function () {
                app.quit();
            });
        }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin')
        app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null)
        createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
