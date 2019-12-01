//  k3vl4r
//  preloads JSON data into local files after running netstat and maxmind geoiplookup
//  support for windows, macos, and linux

//Dependencies
geoip = require('geoip-lite');
whois = require('whois');
const {exec} = require('child_process');
const getIP = require('external-ip')();
fs = require("fs");

//Local data arrays
allResults = [];
finalResults = [];
mapResults = [];
myMapResult = [];

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
        if (err)
            console.log(err);
    });
});

//MacOS and Linux
//Begin netstat collection

if (process.platform !== "win32") {
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
            if (err)
                console.log(err);

        });
        fs.writeFile("mapData.json", JSONMapReturn, (err) => {
            if (err)
                console.log(err);
        });

    });

} else {

    //Windows Operating System
    var netstat = require('node-netstat');

    //Begin netstat
    netstat({
        filter: {}
    }, function (data) {
        allResults.push(data);
        for (i = 0; i < allResults.length; i++) {
            if (allResults[i].remote.address !== null) {
                var matchLoopback = allResults[i].remote.address.match("127.0.0.1");
                var matchLocalNetwork = allResults[i].remote.address.match("192.168");

                if (matchLoopback === null && matchLocalNetwork === null) {
                    var alreadyLoaded = false;
                    for (i2 = 0; i2 < finalResults.length; i2++) {
                        if (finalResults[i2][0] === allResults[i].remote.address) {
                            var alreadyLoaded = true;
                        }
                    }
                    if (alreadyLoaded === false) {
                        IP = allResults[i].remote.address;
                        Port = allResults[i].remote.port;
                        geo = geoip.lookup(IP);
                        finalResults.push([IP, Port, geo]);
                        if (geo['city'].trim() !== "") {
                            mapResults.push({
                                name: geo['city'] + "," + geo['region'] + "," + geo['country'],
                                value: [geo['ll'][1], geo['ll'][0]],
                                ip: IP,
                                port: Port
                            });
                        }
                    }
                } else {

                }
            }
        }
        var JSONreturn = JSON.stringify(finalResults);
        var JSONMapReturn = JSON.stringify(mapResults);

        fs.writeFile("connections.json", JSONreturn, (err) => {
            if (err)
                console.log(err);

        });
        fs.writeFile("mapData.json", JSONMapReturn, (err) => {
            if (err)
                console.log(err);
        });
    });

}
