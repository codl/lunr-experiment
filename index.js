(function(){
    var status = document.querySelector("#status");
    function log(txt){
        console.log(txt);
        status.textContent += "\n" + new Date() + " " + txt;
        scroll_log();
    }
    var scroll_timeout;
    function scroll_log(){
        if(scroll_timeout){
            clearTimeout(scroll_timeout);
        }
        scroll_timeout = setTimeout(function(){
            status.scrollTop = status.scrollHeight;
        }, 10);
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
    xhr.open("GET", "data/all.json");
    xhr.send();

    var status = document.querySelector("#status");
    log("started");

    var searchbar = document.querySelector("#search");
    var results = document.querySelector("#results");
    searchbar.addEventListener("input", function(){
        var res = index.search(searchbar.value);
        results.innerHTML = "";
        for(var r of res){
            var track = get_track(r.ref);
            console.log(r.ref, track, r.score);
            var li = document.createElement("li");
            li.textContent = r.score + " " + track.title + track.id;
            results.appendChild(li);
        }
    })
})();
