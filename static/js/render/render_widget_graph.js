var x_scale = null;
var y_scale = null;

function render_widget_graph(div_id, widget_conf, widget_data){
	var h = $("#"+div_id).height()
	var w = $("#"+div_id).width()
	
	// take up 4/5 of the width with the setpoint and measurement lines
	// assumes good data.
	var sp_slow_step = (w-(w/5)) / widget_data[SP_SLOW_HIGH_IDX].length;	
	var sp_stop_step = (w-(w/5)) / widget_data[SP_STOP_HIGH_IDX].length;	
	var order_step = (w-(w/5)) / widget_data[ORDER_IDX].length;	
	var series_step = (w-(w/5)) / widget_data[SERIES_IDX].length;	
	
	// get the min and max values of the set points for the y_scale
	// start with the stopping set points, if they don't exists, try the 
	// slowing stop points next, if hose aren't there, try the series data with
	// a nudge factor of 10
	var max_sp = null;
	if(widget_data[SP_STOP_HIGH_IDX].length){
		max_sp = _.max(widget_data[SP_STOP_HIGH_IDX], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else if(widget_data[SP_SLOW_HIGH_IDX].length){		
		max_sp = _.max(widget_data[SP_SLOW_HIGH_IDX], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else{
		max_sp = _.max(widget_data[SERIES_IDX], function(d){return d[VAL_IDX]})[VAL_IDX] + 10
	}
	
	var min_sp = null
	if(widget_data[SP_STOP_LOW_IDX].length){
		min_sp = _.min(widget_data[SP_STOP_LOW_IDX], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else if(widget_data[SP_SLOW_LOW_IDX].length){
		min_sp = _.min(widget_data[SP_SLOW_LOW_IDX], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	else{
		min_sp = _.min(widget_data[SERIES_IDX], function(d){return d[VAL_IDX]})[VAL_IDX] - 10
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
		
	var top_line = vis.add(pv.Rule)
		.bottom(1)
		.strokeStyle('black')
		.lineWidth(2)
	
	var bottom_line = vis.add(pv.Rule)
		.bottom(h-1)
		.strokeStyle('black')
		.lineWidth(2)

	// upper stop setpoint line
	var setpoint_stop_top_line = vis.add(pv.Line)
		.data(widget_data[SP_STOP_HIGH_IDX])
		.top(function(d){
			return y_scale(d[VAL_IDX])
		})
		.left(function(d){
			return this.index * sp_stop_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return widget_data[SP_STOP_HIGH_IDX].length > 0
		})
	
	vis.add(pv.Label)
		.text(function(){
			return ""+widget_data[SP_STOP_HIGH_IDX][widget_data[SP_STOP_HIGH_IDX].length - 1][VAL_IDX]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(widget_data[SP_STOP_HIGH_IDX][widget_data[SP_STOP_HIGH_IDX].length - 1][VAL_IDX]) + 10
		})
		.visible(function(){
			return widget_data[SP_STOP_HIGH_IDX].length > 0
		})

	// upper slow setpoint line
	var setpoint_slow_top_line = vis.add(pv.Line)
		.data(widget_data[SP_SLOW_HIGH_IDX])
		.top(function(d){
			return y_scale(d[VAL_IDX])
		})
		.left(function(d){
			return this.index * sp_slow_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return widget_data[SP_SLOW_HIGH_IDX].length
		})
	
	vis.add(pv.Label)
		.text(function(){
			return ""+widget_data[SP_SLOW_HIGH_IDX][widget_data[SP_SLOW_HIGH_IDX].length - 1][VAL_IDX]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(widget_data[SP_SLOW_HIGH_IDX][widget_data[SP_SLOW_HIGH_IDX].length - 1][VAL_IDX]) + 10
		})
		.visible(function(){
			return widget_data[SP_SLOW_HIGH_IDX].length
		})

		
	// lower stop setpoint line
	var setpoint_stop_low_line = vis.add(pv.Line)
		.data(widget_data[SP_STOP_LOW_IDX])
		.top(function(d){
			return y_scale(d[VAL_IDX])
		})
		.left(function(d){
			return this.index * sp_stop_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return widget_data[SP_STOP_LOW_IDX].length
		})
	
	vis.add(pv.Label)
		.text(function(){
			return ""+widget_data[SP_STOP_LOW_IDX][widget_data[SP_STOP_LOW_IDX].length - 1][VAL_IDX]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(widget_data[SP_STOP_LOW_IDX][widget_data[SP_STOP_LOW_IDX].length - 1][VAL_IDX]) + 10
		})
		.visible(function(){
			return widget_data[SP_STOP_LOW_IDX].length
		})

	// lower slow setpoint line
	var setpoint_slow_low_line = vis.add(pv.Line)
		.data(widget_data[SP_SLOW_LOW_IDX])
		.top(function(d){
			return y_scale(d[VAL_IDX])
		})
		.left(function(d){
			return this.index * sp_slow_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
		.visible(function(){
			return widget_data[SP_SLOW_LOW_IDX].length
		})
	
	vis.add(pv.Label)
		.text(function(){
			return ""+widget_data[SP_SLOW_LOW_IDX][widget_data[SP_SLOW_LOW_IDX].length - 1][VAL_IDX]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(widget_data[SP_SLOW_LOW_IDX][widget_data[SP_SLOW_LOW_IDX].length - 1][VAL_IDX]) + 10
		})
		.visible(function(){
			return widget_data[SP_SLOW_LOW_IDX].length
		})
		
	var series_line = vis.add(pv.Line)
		.data(widget_data[SERIES_IDX])
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
			return widget_data[SERIES_IDX].length
		})
		
	var order_line = vis.add(pv.Line)
		.data(widget_data[ORDER_IDX])
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
			return widget_data[ORDER_IDX].length > 0
		})

	vis.render()
	
}