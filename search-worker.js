importScripts("/vendor/lunr/lunr.min.js");
importScripts("/vendor/oboe/oboe-browser.min.js");

function log(txt){
    postMessage(["log", txt])
}

var index = lunr(function(){
    this.ref('id');
    this.field('title', {boost: 10});
    this.field('description');
    this.field('artist', {boost: 20});
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
    if(tracks.length % 2000 == 0){
        log("indexed " + tracks.length);
    }
    search();
}

var ob = oboe("/data/all.json").node("!.*", node => {queue(node); return oboe.drop})
    .done(() => {log("done downloading"); ob.finished = true})

var queued = [];
var queue_timeout;
function queue(track){
    queued.push(track);
    if(!queue_timeout){
        queue_timeout = setTimeout(queue_run, 200);
    }
}
function queue_run(){
    for(track of queued.slice(0, 500)){
        add(track);
    }
    queued = queued.slice(500);
    if(queued.length > 0){
        queue_timeout = setTimeout(queue_run, 50);
    } else {
        queue_timeout = null;
        if(ob.finished){
            log("done. " + tracks.length + " indexed");
        }
    }
}

var last_search;
function debounced_search(terms){
    if(!terms || terms == last_search){
        if(!last_search){
            return
        }
        else {
            terms = last_search;
        }
    }
    postMessage(["results", index.search(terms).map(
        result => get_track(result.ref)
    )]);
}

var search_debounce_timeout;
function search(terms){
    if(search_debounce_timeout){
        clearTimeout(search_debounce_timeout);
    }
    search_debounce_timeout = setTimeout(debounced_search, 20, terms);
    if(terms){
        last_search = terms
    };
}

onmessage = function onmessage(m){
    var type = m.data[0];
    var msg = m.data[1];
    if(type == "search"){
        search(msg);
    }
}
