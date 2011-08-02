var clock, clock_uri;
var running = false;
var tick;

var intvl = null;

const RESUME = 0;
const SET = 1;
const PAUSE = 2;

$(function(){
    var msg;
    
    init_clock();
    
    $('#toggle_running').click(function(){
        running = !running;
        $(this).text(running ? "Pause" : "Resume");
        msg = {'type':running ? RESUME : PAUSE}
        clock.send(JSON.stringify(msg))
    })
    
    $('#set_time').click(function(){
        msg = {'type':SET, 'run_time': parseInt($('#run_time_set').val())}
        clock.send(JSON.stringify(msg))
    })
    
})

function init_clock(){
    clock = new WebSocket("ws://localhost:8000/ecmo/man_behind_curtain/"+$('#run_id').val()+"/clock");
    clock.onmessage = on_tick;
}

function on_tick(e){
    tick = JSON.parse(e.data).run_time;
    $('#run_time').val(tick)
}