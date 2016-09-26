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



    var worker = new Worker("search-worker.js");
    worker.onmessage = function onmessage(e){
        var type = e.data[0];
        var msg = e.data[1];
        if(type == "log"){
            log(msg);
        } else if(type == "results"){
            display_results(msg);
        }
    }

    var searchbar = document.querySelector("#search");
    searchbar.addEventListener("input", function(){
        worker.postMessage(["search", searchbar.value]);
    });

    function display_results(entries){
        var ul = document.querySelector("ul#results");
        ul.innerHTML = "";
        for(var track of entries.slice(0, 50)){
            var li = document.createElement("li");
            li.textContent = " " + track.id + " " + track.artist + " - " + track.title;
            ul.appendChild(li);
        }
    }
})();
