var x_scale = null;
var y_scale = null;

var slow_high_key = null;
var slow_low_key = null;
var stop_high_key = null;
var stop_low_key = null;
var series_key = null;
var order_key = null;

var slow_high_exists = null;
var slow_low_exists = null;
var stop_high_exists = null;
var stop_low_exists = null;
var series_exists = null;
var order_exists = null;

const MAX_DATAPOINTS_TO_SHOW = 900

function render_widget_graph(div_id, widget_conf, widget_data){
	var h = $("#"+div_id).height()
	var w = $("#"+div_id).width()
	
	// make keys into the data dict
	slow_high_key = widget_conf.div_id + SLOW_HIGH_SFX;
	slow_low_key = widget_conf.div_id + SLOW_LOW_SFX;
	stop_high_key = widget_conf.div_id + STOP_HIGH_SFX;
	stop_low_key = widget_conf.div_id + STOP_LOW_SFX;
	series_key = widget_conf.div_id + SERIES_SFX;
	order_key = widget_conf.div_id + ORDER_SFX;
	
	// figure out if the keys are there
	slow_high_exists = widget_data.hasOwnProperty(slow_high_key);
	slow_low_exists = widget_data.hasOwnProperty(slow_low_key);
	stop_high_exists = widget_data.hasOwnProperty(stop_high_key);
	stop_low_exists = widget_data.hasOwnProperty(stop_low_key);
	series_exists = widget_data.hasOwnProperty(series_key);
	order_exists = widget_data.hasOwnProperty(order_key);

	// take up 4/5 of the width with the setpoint and measurement lines
	// make 0 if the key is not there.
	var sp_slow_step =  slow_high_exists ? (w-(w/5)) / widget_data[slow_high_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	var sp_stop_step =  stop_high_exists ? (w-(w/5)) / widget_data[stop_high_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	var order_step =  order_exists ? (w-(w/5)) / widget_data[order_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	var series_step =  series_exists ? (w-(w/5)) / widget_data[series_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	
	// steps for adding tick marks, want one per 10 minutes
	var tick_step = (w-(w/5)) / 6;
	
	var last_item_string = function(key){
		// the slice(-1) will come back with an array with 2 array elements, hence the [0]
		// index before the VAL_IDX index
		return widget_data[key].length ? widget_data[key].slice(-1)[0][VAL_IDX] : ""
	}
	
	var last_item_val = function(key){
		return widget_data[key].length ? widget_data[key].slice(-1)[0][VAL_IDX] : 0
	}
	
	// get the min and max values of the set points for the y_scale
	// start with the stopping set points, if they don't exists, try the 
	// slowing stop points next, if hose aren't there, try the series data with
	// a nudge factor of 10
	var max_sp = null;
	if(stop_high_exists && widget_data[stop_high_key].length){
		max_sp = _.max(widget_data[stop_high_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else if(slow_high_exists && widget_data[slow_high_key].length){		
		max_sp = _.max(widget_data[slow_high_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else{ // series better exists
		max_sp = _.max(widget_data[series_key], function(d){return d[VAL_IDX]})[VAL_IDX] + 10
	}
	
	var min_sp = null
	if(stop_low_exists && widget_data[stop_low_key].length){
		min_sp = _.min(widget_data[stop_low_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else if(slow_low_exists && widget_data[slow_low_key].length){
		min_sp = _.min(widget_data[slow_low_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else{ // series better exist
		min_sp = _.min(widget_data[series_key], function(d){return d[VAL_IDX]})[VAL_IDX] - 10
	}
	
	var y_scale = pv.Scale.linear(max_sp, min_sp).range(15, h-15)
	
	var vis = new pv.Panel()
		.canvas(div_id)
		.height(function() {
			return h
		})
		.width(function() {
			return w
		})
		.fillStyle("white")
		.event("click", function(){
			if($("#"+div_id).hasClass("fs_graph")){
				$("#"+div_id).removeClass("fs_graph").addClass("graph")
			}
			else{
				$("#"+div_id).removeClass("graph").addClass("fs_graph")
			}
			vis.render()
		})
		
	var top_line = vis.add(pv.Rule)
		.bottom(1)
		.strokeStyle('black')
		.lineWidth(2)
		.add(pv.Rule)
			.data(pv.range(0, 7))
			.top(0)
			.left(function(){
				return this.index * tick_step
			})
			.height(5)
	
	var bottom_line = vis.add(pv.Rule)
		.bottom(h-1)
		.strokeStyle('black')
		.lineWidth(2)
		.add(pv.Rule)
			.data(pv.range(0, 7))
			.bottom(0)
			.left(function(){
				return this.index * tick_step
			})
			.height(5)
	
	// upper stop setpoint line
	var setpoint_stop_top_line = vis.add(pv.Line)
		.data(function(){
			return stop_high_exists ? widget_data[stop_high_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []
		})
		.top(function(d){
			return stop_high_exists ? y_scale(d[VAL_IDX]) : 0
		})
		.left(function(d){
			return this.index * sp_stop_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return stop_high_exists
		})
	
	var setpoint_stop_top_label = vis.add(pv.Label)
		.text(function(){
			return ""+ (stop_high_exists ? last_item_string(stop_high_key) : "");
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return stop_high_exists ? y_scale(last_item_val(stop_high_key)) + 10 : 0
		})
		.visible(function(){
			return stop_high_exists
		})

	// upper slow setpoint line
	var setpoint_slow_top_line = vis.add(pv.Line)
		.data(function(){
			return slow_high_exists ? widget_data[slow_high_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []
		})
		.top(function(d){
			return slow_high_exists ? y_scale(d[VAL_IDX]) : 0
		})
		.left(function(d){
			return this.index * sp_slow_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return slow_high_exists
		})
	
	var setpoint_slow_top_label = vis.add(pv.Label)
		.text(function(){
			return ""+(slow_high_exists ? last_item_string(slow_high_key) : "")
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return slow_high_exists ? y_scale(last_item_val(slow_high_key)) + 10 : 0
		})
		.visible(function(){
			return slow_high_exists
		})

		
	// lower stop setpoint line
	var setpoint_stop_low_line = vis.add(pv.Line)
		.data(function(){
			return stop_low_exists ? widget_data[stop_low_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []
		})
		.top(function(d){
			return stop_low_exists ?  y_scale(d[VAL_IDX]) : 0
		})
		.left(function(d){
			return this.index * sp_stop_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return stop_low_exists
		})
	
	var setpoint_stop_low_label = vis.add(pv.Label)
		.text(function(){
			return ""+(stop_low_exists ? last_item_string(stop_low_key) : "")
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return stop_low_exists ? y_scale(last_item_val(stop_low_key)) + 10 : 0
		})
		.visible(function(){
			return stop_low_exists
		})

	// lower slow setpoint line
	var setpoint_slow_low_line = vis.add(pv.Line)
		.data(function(){
			return slow_low_exists ? widget_data[slow_low_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []
		})
		.top(function(d){
			return slow_low_exists ? y_scale(d[VAL_IDX]) : 0
		})
		.left(function(d){
			return this.index * sp_slow_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return slow_low_exists
		})
	
	var setpoint_slow_low_label = vis.add(pv.Label)
		.text(function(){
			return ""+(slow_low_exists ? last_item_string(slow_low_key) : "")
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return slow_low_exists ? y_scale(last_item_val(slow_low_key)) + 10 : 0
		})
		.visible(function(){
			return slow_low_exists
		})
		
	var series_line = vis.add(pv.Line)
		.data(function(){
			return series_exists ? widget_data[series_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []
		})
		.top(function(d){
			return y_scale(d[VAL_IDX])
		})
		.left(function(d){
			return this.index * series_step
		})
		.strokeStyle(function(d){
			return "blue"
			// this seems to only get evaluated for the first line segment...
			//return (d < data.sps_high[this.index] && d > data.sps_low[this.index]) ? "blue" : "red"
		})
		.lineWidth(2)
		.visible(function(){
			return series_exists
		})
		
	var order_line = vis.add(pv.Line)
		.data(function(){
			return order_exists ? widget_data[order_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []
		})
		.top(function(d){
			return y_scale(d[VAL_IDX])
		})
		.left(function(d){
			return this.index * order_step
		})
		.strokeStyle(function(d){
			return "darkgrey"
			// this seems to only get evaluated for the first line segment...
			//return (d < data.sps_high[this.index] && d > data.sps_low[this.index]) ? "blue" : "red"
		})
		.lineWidth(2)
		.visible(function(){
			return order_exists
		})

	vis.render()
	
	var pvs_items = {
		'vis': vis,
		'stop_high_line': setpoint_stop_top_line,
		'stop_high_label': setpoint_stop_top_label,
		'stop_low_line': setpoint_stop_low_line,
		'stop_low_label': setpoint_stop_low_label,
		'slow_high_line': setpoint_slow_top_line,
		'slow_high_label': setpoint_slow_top_label,
		'slow_low_line': setpoint_slow_low_line,
		'slow_low_label': setpoint_slow_low_label,
		'series_line': series_line,
		'order_line': order_line,
	}
	
	return pvs_items
	
}

function update_widget_graph(id, conf, widget_data, graph_ctxt){
	
// [REFACTOR] lots of code copied from above. refactor into single function
	var h = $("#"+id).height()
	var w = $("#"+id).width()
	
	// make keys into the data dict
	slow_high_key = conf.div_id + SLOW_HIGH_SFX;
	slow_low_key = conf.div_id + SLOW_LOW_SFX;
	stop_high_key = conf.div_id + STOP_HIGH_SFX;
	stop_low_key = conf.div_id + STOP_LOW_SFX;
	series_key = conf.div_id + SERIES_SFX;
	order_key = conf.div_id + ORDER_SFX;
	
	// figure out if the keys are there
	slow_high_exists = widget_data.hasOwnProperty(slow_high_key);
	slow_low_exists = widget_data.hasOwnProperty(slow_low_key);
	stop_high_exists = widget_data.hasOwnProperty(stop_high_key);
	stop_low_exists = widget_data.hasOwnProperty(stop_low_key);
	series_exists = widget_data.hasOwnProperty(series_key);
	order_exists = widget_data.hasOwnProperty(order_key);

	// take up 4/5 of the width with the setpoint and measurement lines
	// make 0 if the key is not there.
	var sp_slow_step =  slow_high_exists ? (w-(w/5)) / widget_data[slow_high_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	var sp_stop_step =  stop_high_exists ? (w-(w/5)) / widget_data[stop_high_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	var order_step =  order_exists ? (w-(w/5)) / widget_data[order_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	var series_step =  series_exists ? (w-(w/5)) / widget_data[series_key].slice(-MAX_DATAPOINTS_TO_SHOW).length : 0;	
	
	// steps for adding tick marks, want one per 10 minutes
	var tick_step = (w-(w/5)) / 6;
	
	var last_item_string = function(key){
		// the slice(-1) will come back with an array with 2 array elements, hence the [0]
		// index before the VAL_IDX index
		return widget_data[key].length ? widget_data[key].slice(-1)[0][VAL_IDX] : ""
	}
	
	var last_item_val = function(key){
		return widget_data[key].length ? widget_data[key].slice(-1)[0][VAL_IDX] : 0
	}
	
	
	// get the min and max values of the set points for the y_scale
	// start with the stopping set points, if they don't exists, try the 
	// slowing stop points next, if hose aren't there, try the series data with
	// a nudge factor of 10
	var max_sp = null;
	if(stop_high_exists && widget_data[stop_high_key].length){
		max_sp = _.max(widget_data[stop_high_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else if(slow_high_exists && widget_data[slow_high_key].length){		
		max_sp = _.max(widget_data[slow_high_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else{ // series better exists
		max_sp = _.max(widget_data[series_key], function(d){return d[VAL_IDX]})[VAL_IDX] + 10
	}
	
	var min_sp = null
	if(stop_low_exists && widget_data[stop_low_key].length){
		min_sp = _.min(widget_data[stop_low_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else if(slow_low_exists && widget_data[slow_low_key].length){
		min_sp = _.min(widget_data[slow_low_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else{ // series better exist
		min_sp = _.min(widget_data[series_key], function(d){return d[VAL_IDX]})[VAL_IDX] - 10
	}
	
	var y_scale = pv.Scale.linear(max_sp, min_sp).range(15, h-15)
// [REFACTOR END] lots of code copied from above. refactor into single function
	
	
	// clean the following up. use chanining so items like "graph_ctxt.stop_high_line" aren't
	// declared for every property setting
	
	// update the stop high setpoint line
	graph_ctxt.stop_high_line.data(function(){return stop_high_exists ? widget_data[stop_high_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []})
	graph_ctxt.stop_high_line.visible(stop_high_exists)
	graph_ctxt.stop_high_line.top(function(d){
		return stop_high_exists ? y_scale(d[VAL_IDX]) : 0
	})
	graph_ctxt.stop_high_line.left(function(d){
		return this.index * sp_stop_step
	})
	
	// update the stop high setpoint label
	graph_ctxt.stop_high_label.text(function(){
		return ""+ (stop_high_exists ? last_item_string(stop_high_key) : "");
	})
	graph_ctxt.stop_high_label.top(function(){
		// add 10 to push the label down
		return stop_high_exists ? y_scale(last_item_val(stop_high_key)) + 10 : 0
	})
	graph_ctxt.stop_high_label.visible(function(){
		return stop_high_exists
	})
	
	// update the stop low setpoint line
	graph_ctxt.stop_low_line.data(function(){return stop_low_exists ? widget_data[stop_low_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []})
	graph_ctxt.stop_low_line.visible(stop_low_exists)
	graph_ctxt.stop_low_line.top(function(d){
		return stop_low_exists ? y_scale(d[VAL_IDX]) : 0
	})
	graph_ctxt.stop_low_line.left(function(d){
		return this.index * sp_stop_step
	})
	
	// update the stop low setpoint label
	graph_ctxt.stop_low_label.text(function(){
		return ""+ (stop_low_exists ? last_item_string(stop_low_key) : "");
	})
	graph_ctxt.stop_low_label.top(function(){
		// add 10 to push the label down
		return stop_low_exists ? y_scale(last_item_val(stop_low_key)) + 10 : 0
	})
	graph_ctxt.stop_low_label.visible(function(){
		return stop_low_exists
	})
	
	// update the slow high setpoint line
	graph_ctxt.slow_high_line.data(function(){return slow_high_exists ? widget_data[slow_high_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []})
	graph_ctxt.slow_high_line.visible(slow_high_exists)
	graph_ctxt.slow_high_line.top(function(d){
		return slow_high_exists ? y_scale(d[VAL_IDX]) : 0
	})
	graph_ctxt.slow_high_line.left(function(d){
		return this.index * sp_slow_step
	})
	
	// update the slow high setpoint label
	graph_ctxt.slow_high_label.text(function(){
		return ""+ (slow_high_exists ? last_item_string(slow_high_key) : "");
	})
	graph_ctxt.slow_high_label.top(function(){
		// add 10 to push the label down
		return slow_high_exists ? y_scale(last_item_val(slow_high_key)) + 10 : 0
	})
	graph_ctxt.slow_high_label.visible(function(){
		return slow_high_exists
	})
	
	// update the slow low setpoint line
	graph_ctxt.slow_low_line.data(function(){return slow_low_exists ? widget_data[slow_low_key].slice(-MAX_DATAPOINTS_TO_SHOW) : []})
	graph_ctxt.slow_low_line.visible(slow_low_exists)
	graph_ctxt.slow_low_line.top(function(d){
		return slow_low_exists ? y_scale(d[VAL_IDX]) : 0
	})
	graph_ctxt.slow_low_line.left(function(d){
		return this.index * sp_slow_step
	})
	
	// update the slow low setpoint label
	graph_ctxt.slow_low_label.text(function(){
		return ""+ (slow_low_exists ? last_item_string(slow_low_key) : "");
	})
	graph_ctxt.slow_low_label.top(function(){
		// add 10 to push the label down
		return slow_low_exists ? y_scale(last_item_val(slow_low_key)) + 10 : 0
	})
	graph_ctxt.slow_low_label.visible(function(){
		return slow_low_exists
	})
	
	// get the series line to use the newly calculated values
	graph_ctxt.series_line.data(widget_data[series_key].slice(-MAX_DATAPOINTS_TO_SHOW))
	graph_ctxt.series_line.visible(series_exists)
	graph_ctxt.series_line.strokeStyle("blue")
	graph_ctxt.series_line.top(function(d){
		return y_scale(d[VAL_IDX])
	})
	graph_ctxt.series_line.left(function(d){
		return this.index * series_step
	})
	
	// order needs the new vals too		
	graph_ctxt.order_line.data(function(){ 
		return order_exists ? widget_data[order_key].slice(-MAX_DATAPOINTS_TO_SHOW) : [] 
	})
	graph_ctxt.order_line.visible(order_exists)
	graph_ctxt.order_line.top(function(d){
		return y_scale(d[VAL_IDX])
	})
	graph_ctxt.order_line.left(function(d){
		return this.index * order_step
	})
	
	// finally, update the vis just once
	graph_ctxt.vis.render()
	
}
