importScripts("/vendor/lunr/lunr.min.js");
importScripts("/vendor/oboe/oboe-browser.min.js");

VERSION = 2

function log(txt){
    postMessage(["log", txt])
}

var index = lunr(function(){
    this.ref('id');
    this.field('title', {boost: 10});
    this.field('description');
    this.field('artist', {boost: 15});

    this.pipeline.reset();
});

var tracks = [];
function get_track(id){
    return tracks.find(function(e){
        return e.id == id;
    });
}

function add(track){
    tracks.push(track);
    index.add(track);
    if(tracks.length % 500 == 0){
        log("indexed " + tracks.length);
    }
    search();
}

var last_search;
var last_search_time = 0;
function search(terms){
    if(!terms || terms == last_search){
        if(!last_search || last_search_time > Date.now() - 500){
            return
        }
        else {
            terms = last_search;
        }
    }
    postMessage(["results", index.search(terms).map(
        result => get_track(result.ref)
    )]);
    last_search = terms;
    last_search_time = Date.now();
}

onmessage = function onmessage(m){
    var type = m.data[0];
    var msg = m.data[1];
    if(type == "search"){
        search(msg);
    } else if(type == "restore-state"){
        load(msg);
    }
}

function load(state){
    if(!state || !state.version || state.version < VERSION){
        log("loading from network");
        oboe("/data/all.json").node("!.*", node => {add(node); return oboe.drop})
            .done(function(){
                log("done");
                postMessage(["save-state",
                    {"version": VERSION, "tracks": tracks}
                ]);
            })
    } else {
        log("loading from storage");
        for(var i = 0; i < state.tracks.length; i += 300){
            setTimeout(function(i){
                for(var track of state.tracks.slice(i, i+300)){
                    add(track);
                }
            }, i/2, i)
        }
    }
}
