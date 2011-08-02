// Sockets
var sock;

$(function(){
    init_sockets();
})

function init_sockets(){
    sock = new WebSocket(ws_uri('socket'));
    // uncomment this for auto parsing, then just use the message
    // sock.onmessage = function(e){on_tick(JSON.parse(e.data))};
    sock.onmessage = function(e){on_tick(e)};
}

function on_tick(msg){
    $('#output').val(msg.data)
}