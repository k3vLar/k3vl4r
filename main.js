// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
        const path = require('path');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
        let
mainWindow;


//Dependencies
geoip = require('geoip-lite');
whois = require('whois');
const {exec} = require('child_process');
const getIP = require('external-ip')();
fs = require("fs");

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
                webPreferences: {
                    preload: path.join(__dirname, 'js/dataWindowPreloader.js')
                }
            });

            dataWindow.setPosition(100, 375);
            //dataWindow.setMenuBarVisibility(false);
            //dataWindow.setAlwaysOnTop(true);
            dataWindow.isFullScreenable(false);
            dataWindow.isMaximizable(false);
            dataWindow.isMinimizable(false);
            dataWindow.isResizable(false);
            dataWindow.setOpacity(.95);
            dataWindow.loadFile('data.html');

            mainWindow.setPosition(100, 100);
            //mainWindow.setAlwaysOnTop(true);
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



//Local data arrays
allResults = [];
finalResults = [];
mapResults = [];
myMapResult = [];

            setInterval(function () {

                //Get my internet IP address
getIP((err, ip) => {
    if (err) {
        throw err;
    }
    var myGeo = geoip.lookup(ip);
    var JSONMyGeo = JSON.stringify(myGeo);
    myMapResult.push({
        name: myGeo['city'] + "," + myGeo['region'] + "," + myGeo['country'],
        value: [myGeo['ll'][1], myGeo['ll'][0]]
    });
    fs.writeFile("myGeo.json", JSONMyGeo, (err) => {
        console.log(JSONMyGeo);
        if (err)
            console.log(err);
    });
});


    exec('netstat -an | grep tcp4 | grep ESTAB | grep -v "127.0.0.1"', (err, stdout, stderr) => {
        if (err) {
            return;
        }
        //Begin working with the returned netstat data
        var data = stdout.split("\n");
        for (i = 0; i < data.length; i++) {

            var netstat = data[i].split(" ");
            if (netstat[19] !== undefined && netstat[19] !== '') {

                d = netstat[19].split(".");
                IP = d[0] + "." + d[1] + "." + d[2] + "." + d[3];
                Port = d[4];

                //Create a boolean flag for duplicate identification
                var alreadyLoaded = false;
                for (i2 = 0; i2 < finalResults.length; i2++) {
                    if (finalResults[i2][0] === IP) {
                        var alreadyLoaded = true;
                    }
                }

                //Condition on the duplicate boolean flag
                if (alreadyLoaded === false) {

                    //Match connections that the destination falls within local network class ranges
                    var matchLocalNetwork = IP.match("192.168");
                    var matchLocalNetworkB = IP.match("10.0");
                    var matchLocalNetworkC = IP.match("172.16");

                    //Run the conditions on the local network matches
                    if (matchLocalNetwork == null && matchLocalNetworkB == null && matchLocalNetworkC == null) {

                        //Begin MaxMind GEOIP Lookup
                        GeoLookup = geoip.lookup(IP);
                        if (GeoLookup !== null) {

                            //Push the data to our arrays
                            finalResults.push([IP, Port, GeoLookup]);
                            mapResults.push({
                                name: GeoLookup['city'] + "," + GeoLookup['region'] + "," + GeoLookup['country'],
                                value: [GeoLookup['ll'][1], GeoLookup['ll'][0]],
                                ip: IP,
                                port: Port
                            });
                        }

                    }

                }

            }
        }

        //JSON encode the return arrays
        var JSONreturn = JSON.stringify(finalResults);
        var JSONMapReturn = JSON.stringify(mapResults);

        //Write the JSON data to local files
        fs.writeFile("connections.json", JSONreturn, (err) => {
            console.log(JSONreturn);
            if (err)
                console.log(err);

        });
        fs.writeFile("mapData.json", JSONMapReturn, (err) => {
            if (err)
                console.log(err);
        });

    });


            }, 10000);
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
