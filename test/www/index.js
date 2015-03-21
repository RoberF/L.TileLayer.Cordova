var LAT  = 44.5667;
var LNG  = -123.2833;
var ZOOM = 13;

var CACHE_ZOOM_MIN = 13, CACHE_ZOOM_MAX = 16;

var MAP, BASE;

function startMap() {
    MAP = L.map('map', {
        minZoom:CACHE_ZOOM_MIN,
        maxZoom:CACHE_ZOOM_MAX
    });

    try {
        BASE = L.tileLayerCordova('https://{s}.tiles.mapbox.com/v3/examples.map-i875mjb7/{z}/{x}/{y}.png', {
            // these options are perfectly ordinary L.TileLayer options
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                         '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                         'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            // these are specific to L.TileLayer.Cordova and mostly specify where to store the tiles on disk
            folder: 'LTileLayerCordovaExample',
            name:   'example',
            debug:   true
        }).addTo(MAP);
    } catch (e) {
        alert(e);
    }

    MAP.setView([LAT,LNG],ZOOM);
    MAP.on('moveend', function () {
        document.getElementById('status').innerHTML =  MAP.getCenter().lat.toFixed(5) + ' x ' + MAP.getCenter().lng.toFixed(5) + ' @ ' + MAP.getZoom();
    }).fire('moveend');
}

function startButtons() {
    document.getElementById('test_cache').addEventListener('click', testCaching);
    document.getElementById('test_offline').addEventListener('click', testOffline);
    document.getElementById('test_online').addEventListener('click', testOnline);
    document.getElementById('test_cache').addEventListener('click', testUsage);
}

function testCaching() {
    var lat       = MAP.getCenter().lat;
    var lng       = MAP.getCenter().lng;
    var zmin      = MAP.getZoom();
    var zmax      = CACHE_ZOOM_MAX;
    var tile_list = BASE.calculateXYZListFromPyramid(lat, lng, zmin, zmax);
    var message   = "Preparing to cache tiles.\n" + "Zoom level " + zmin + " through " + zmax + "\n" + tile_list.length + " tiles total." + "\nClick OK to proceed.";
    var ok        = confirm(message);
    if (! ok) return false;

    var status_block = document.getElementById('status');

    BASE.downloadXYZList(
        // 1st param: a list of XYZ objects indicating tiles to download
        tile_list,
        // 2nd param: overwrite existing tiles on disk? if no then a tile already on disk will be kept, which can be a big time saver
        false,
        // 3rd param: progress callback
        // receives the number of tiles downloaded and the number of tiles total; caller can calculate a percentage, update progress bar, etc.
        function (done,total) {
            var percent = Math.round(100 * done / total);
            status_block.innerHTML = done  + " / " + total + " = " + percent + "%";
        },
        // 4th param: complete callback
        // no parameters are given, but we know we're done!
        function () {
            // for this demo, on success we use another L.TileLayer.Cordova feature and show the disk usage
            testUsage();
        },
        // 5th param: error callback
        // parameter is the error message string
        function (error) {
            alert("Failed\nError code: " + error.code);
        }
    );
}

function testOffline() {

}

function testOnline() {

}

function testUsage() {
    BASE.getDiskUsage(function (filecount,bytes) {
        var kilobytes = Math.round( bytes / 1024 );
        status_block.innerHTML = "Done" + "<br/>" + filecount + " files" + "<br/>" + kilobytes + " kB";
    });
}
