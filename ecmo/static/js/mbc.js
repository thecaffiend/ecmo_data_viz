// Sockets
var clock, cmd;

var running = false;
var tick;

const RESUME = 0;
const SET = 1;
const PAUSE = 2;

$(function(){
    var msg;
    
    init_sockets();
    
    $('#toggle_running').click(function(){
        running = !running;
        $(this).text(running ? "Pause" : "Resume");
        send(clock,{
            'type':running ? RESUME : PAUSE})
    })
    
    $('#set_time').click(function(){
        send(clock,{
            'type':SET, 
            'run_time': parseInt($('#run_time_set').val())
            })
    })
    
    $('.feed .add').live('click', function(){
        var evt = $(this).parents('.event');
        var feed = $(this).parents('.feed');
        send(cmd, {
            feed:           feed.attr('id'),
            value:          parseFloat(evt.find('.value').val()),
            arg:            parseFloat(evt.find('.arg').val()),
            run_time:       parseInt(evt.find('.run_time').val()),
            distribution:   evt.find('.dist').val(),
            trend:          evt.find('.trend').val(),
            })
    })
    
    $('.feed .remove').live('click', function(){
        alert('unimplemented')
    })
    
})

function send(ws, obj){
    ws.send(JSON.stringify(obj))
}

function init_sockets(){
    clock = new WebSocket(ws_uri('clock'));
    clock.onmessage = function(e){on_tick(JSON.parse(e.data))};
    
    cmd = new WebSocket(ws_uri('command'));
    cmd.onmessage = function(e){on_command(JSON.parse(e.data))};
}

function ws_uri(socket){
    return document.URL.replace('http://','ws://')+"/"+socket
}

function on_tick(msg){
    tick = msg.run_time;
    $('#run_time').val(tick)
}

function on_command(msg){
    if(msg.events && msg.events.length){
        $.each(msg.events, function(idx, evt){
            $( "#eventTemplate" ).tmpl( evt )
                    .appendTo( "#" + evt.feed + " tbody" );  
        $('#' + evt.feed + ' td.sort').sortElements(function(a,b){
            return parseInt($(a).text()) > parseInt($(b).text()) ? 1 : -1;
        }, function(){
            return this.parentNode; 
            })
        })
    }else if(msg.points && msg.points.length){
        $.each(msg.points, function(idx, point){
            $('#feed-' + point.feed).val(point.val)
        })
    }
}