// most basic dependencies
var express = require('express'),
    http = require('http'),
    os = require('os'),
    path = require('path'),
    fs = require('fs'),
    Chance = require('chance');

// create the app
var app = express();
var chance = new Chance();

// configure everything, just basic setup
app.set('port', process.env.PORT || 3000);
app.use(function (req, resp, next) {
    resp.header("Access-Control-Allow-Origin", "*");
    resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Serve the www directory statically
app.use(express.static('www'));

//---------------------------------------
// mini app
//---------------------------------------
var openConnections = [];

app.get('/czml', function (req, resp) {

    req.socket.setTimeout(2 * 60 * 1000);

    // send headers for event-stream connection
    // see spec for more information
    resp.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    resp.write('\n');

    // push this res object to our global variable
    openConnections.push(resp);

    // send document packet
    var d = new Date();
    resp.write('id: ' + d.getMilliseconds() + '\n');
    resp.write('data:' + JSON.stringify({
        "id": "document",
        "version": "1.0",
        "clock": {
            "interval": "2018-07-12T13:00:25Z/2028-07-12T13:40:25Z",
            "currentTime": "2018-07-12T13:10:25Z",
            "multiplier": 1,
            "range": "LOOP_STOP"
        }
    }) + '\n\n'); // Note the extra newline

    // When the request is closed, e.g. the browser window
    // is closed. We search through the open connections
    // array and remove this connection.
    req.on("close", function () {
        var toRemove;
        for (var j = 0; j < openConnections.length; j++) {
            if (openConnections[j] == resp) {
                toRemove = j;
                break;
            }
        }
        openConnections.splice(j, 1);
    });
});
let arr = [111, 24, 125, 30, 87, 40, 131, 50, 135, 55, 139, 40, 120, 10, 110, 10]
let i = 0
let timeLine = 0
let posArr = []
let timer = setInterval(() => {
    if (i === arr.length - 4) {
        clearInterval(timer)
    }
    if (i % 2 === 0) {
        // we walk through each connection
        openConnections.forEach(function (resp) {
            // send doc
            var d = new Date();
            resp.write('id: document' + '\n');
            resp.write('data:' + createMsg(i, timeLine) + '\n\n'); // Note the extra newline
        });
        timeLine += 30
    }
    i += 1
}, 1000)

function createMsg(index, timeLine) {
    posArr = posArr.concat([timeLine, arr[index], arr[index + 1], 0])
    console.log(posArr);
    var d = new Date();
    var entity = {
        "id": 'car',
        "polyline": {
            "positions": {
                "cartographicDegrees": [
                    arr[index], arr[index + 1], 0, arr[index + 2], arr[index + 3], 0
                ]
            },
            "width": 2,
            "material": {
                "solidColor": {
                    "color": {
                        "rgba": [0, 0, 255, 255]
                    }
                }
            }
        },
        "model": {
            "gltf": "./www/assets/model/kuantiche.glb",
            "minimumPixelSize": 5,
            "maximumScale": 5,
            "scale": 10000
        },
        "billboard": {
            "eyeOffset": {
                "cartesian": [0, 0, 0]
            },
            "horizontalOrigin": "CENTER",
            "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACvSURBVDhPrZDRDcMgDAU9GqN0lIzijw6SUbJJygUeNQgSqepJTyHG91LVVpwDdfxM3T9TSl1EXZvDwii471fivK73cBFFQNTT/d2KoGpfGOpSIkhUpgUMxq9DFEsWv4IXhlyCnhBFnZcFEEuYqbiUlNwWgMTdrZ3JbQFoEVG53rd8ztG9aPJMnBUQf/VFraBJeWnLS0RfjbKyLJA8FkT5seDYS1Qwyv8t0B/5C2ZmH2/eTGNNBgMmAAAAAElFTkSuQmCC",
            "pixelOffset": {
                "cartesian2": [0, 0]
            },
            "scale": 100.5,
            "show": true,
            "verticalOrigin": "CENTER"
        },
        "position": {
            "interpolationAlgorithm": "LAGRANGE",
            "interpolationDegree": 5,
            "referenceFrame": "INERTIAL",
            "epoch": "2020-05-02T12:00:00Z",
            "cartesian": [
                0.0, -6668447.2211117, 1201886.45913705, 146789.427467256,
                60.0, -6711432.84684144, 919677.673492462, -214047.552431458,
                90.0, -6721319.92231553, 776899.784034099, -394198.837519575,
                150.0, -6717826.447064, 488820.628328182, -752924.980158179,
                180.0, -6704450.41462847, 343851.784836767, -931084.800346031,
                240.0, -6654518.44949696, 52891.726433174, -1283967.69137678
            ]
        }
    };

    return JSON.stringify(entity);;
}

// startup everything
http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
})