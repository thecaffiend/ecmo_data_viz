function ws_uri(socket){
    return document.URL.replace('http://','ws://')+"/"+socket;
}

function send(ws, obj){
    ws.send(JSON.stringify(obj));
}