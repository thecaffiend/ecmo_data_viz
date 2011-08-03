// Sockets
var clock, cmd;

var running = false;
var tick;

const RESUME = 0;
const SET = 1;
const PAUSE = 2;
const SHUTDOWN = 4;

var show_events = false;

$(function(){
    var msg;
    
    $('#connection').click(function(){
        if(!clock){
            console.log('attempting to connect')
            init_sockets();
        }else{
            close_sockets();
        }
    })
    
    $('.clock_dependent, .cmd_dependent').attr('disabled', true);
    
    $('#toggle_running').click(function(){
        running = !running;
        $(this).text(running ? "Pause" : "Resume");
        send(clock,{
            'type':running ? RESUME : PAUSE});
    });
    
    $('#set_time').click(function(){
        send(clock,{
            'type':SET, 
            'run_time': parseInt($('#run_time_set').val())
            });
    });
    
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
            });
    });
    
    $('.feed .remove').live('click', function(){
        var evt = $(this).parents('.event');
        var feed = $(this).parents('.feed');
        send(cmd, {
            delete:         parseInt(evt.attr('id').replace('event-','')),
            });
    });
    
    $('.toggle_events').click(function(){
        $(this).parent().find('.events').slideToggle()
    })
    $('.toggle_all_events').click(function(){
        show_events = !show_events;
        if(show_events){
            $('.events').slideDown()
        }else{
            $('.events').slideUp()
        }
    })
    
    $(window).bind("beforeunload", function(){
      close_sockets();
    })
    
    
});

function close_sockets(){
    var sd = {'shutdown': 1}
    send(clock, sd);
    send(cmd, sd);
}


function init_sockets(){
    clock = null;
    clock = new WebSocket(ws_uri('clock'));
    clock.onmessage = function(e){on_tick(JSON.parse(e.data))};
    
    clock.onopen = function(){
        console.log('foo')
        $('#connection').text('Disconnect')
        $('.clock_dependent').attr('disabled',false)
    }
    
    clock.onclose = function(){
        $('#connection').text('Refresh to reconnect').attr('disabled', true)
        $('.clock_dependent').attr('disabled',true)
    }
    
    cmd = null;
    cmd = new WebSocket(ws_uri('command'));
    cmd.onmessage = function(e){on_command(JSON.parse(e.data))};
    
    cmd.onopen = function(){
        $('.cmd_dependent').attr('disabled',false)
    }
    cmd.onclose = function(){
        $('.cmd_dependent').attr('disabled',true)
    }
}


function on_tick(msg){
    if(msg.shutdown){
        clock.close()
    }
    tick = msg.run_time;
    $('#run_time').val(tick);
}

function on_command(msg){
    if(msg.shutdown){
        cmd.close()
    }
    if(msg.events && msg.events.length){
        $.each(msg.events, function(idx, evt){
            $( "#eventTemplate" ).tmpl( evt )
                    .appendTo( "#" + evt.feed + " tbody" );
            $('#' + evt.feed + ' td.sort').sortElements(function(a,b){
                    return parseInt($(a).text()) > parseInt($(b).text()) ? 1 : -1;
                }, function(){
                    return this.parentNode; 
            });
        });
    }else if(msg.points && msg.points.length){
        $.each(msg.points, function(idx, point){
            $('#feed-' + point.feed).val(point.val);
        });
    }else if(msg.delete){
        $('#event-'+msg.delete).remove();
    }
}