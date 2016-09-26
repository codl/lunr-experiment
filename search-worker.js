importScripts("/vendor/lunr/lunr.min.js");
importScripts("/vendor/oboe/oboe-browser.min.js");

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
    if(Math.random() > .999) console.log(track)
    if(tracks.length % 500 == 0){
        log("indexed " + tracks.length);
    }
    search();
}

oboe("/data/all.json").node("!.*", node => {add(node); return oboe.drop})
    .done(() => log("done"))

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
    }
}
