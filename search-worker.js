importScripts("/vendor/lunr/lunr.min.js");

function log(txt){
    postMessage(["log", txt])
}

var index = lunr(function(){
    this.ref('id');
    this.field('title', {boost: 10});
    this.field('description');
    this.field('artist', {boost: 10});
});

var tracks = [];
function get_track(id){
    return tracks.find(function(e){
        return e.id == id;
    });
}
var xhr = new XMLHttpRequest();
xhr.addEventListener("load", function(){
    tracks = JSON.parse(xhr.response);
    var i = 0;
    for(var track of tracks){
        index.add(track);
        i += 1;
        if(i % 500 == 0){
            log("added " + i + " entries");
        }
    }
    log("done");
});
xhr.open("GET", "/data/all.json");
xhr.send();

onmessage = function onmessage(m){
    var type = m.data[0];
    var msg = m.data[1];
    if(type == "search"){
        postMessage(["results", index.search(msg).map(function(result){
            return get_track(result.ref);
        })]);
    }
}
