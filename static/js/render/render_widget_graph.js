// graph_data is just for testing pre-backend
var graph_data = {
	// set points
	sps_high: make_array(20, 215).concat(make_array(20, 225)),
	sps_low: make_array(20, 165).concat(make_array(20, 175)),
	series: [],
}

var x_scale = null;
var y_scale = null;

// convenience function to create the pressures array. just for testing
function init_series(num_items){
	while(num_items--){
		graph_data.series.push(get_random(170, 225))
	}
}

function render_widget_graph(div_id){
	var h = $("#"+div_id).height()
	var w = $("#"+div_id).width()
	
	init_series(40)
	
	// take up 4/5 of the width with the setpoint and pressure lines
	var sp_datapoint_step = (w-(w/5)) / graph_data.sps_high.length;	
	var p_datapoint_step = (w-(w/5)) / graph_data.series.length;	
	
	// get the min and max values of the set points
	var max_sp = _.max(graph_data.sps_high)
	var min_sp = _.min(graph_data.sps_low)
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
	
	var setpoint_top_line = vis.add(pv.Line)
		.data(graph_data.sps_high)
		.top(function(d){
			return y_scale(d)
		})
		.left(function(d){
			return this.index * sp_datapoint_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3, 5")
	
	vis.add(pv.Label)
		.text(function(){
			return ""+graph_data.sps_high[graph_data.sps_high.length - 1]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(graph_data.sps_high[graph_data.sps_high.length - 1]) + 10
		})
		
		
	var setpoint_bottom_line = vis.add(pv.Line)
		.data(graph_data.sps_low)
		.top(function(d){
			return y_scale(d)
		})
		.left(function(d){
			return this.index * sp_datapoint_step
		})
		.strokeStyle('black')
		.lineWidth(2)
		.strokeDasharray("3,5")
	
	vis.add(pv.Label)
		.text(function(){
			return ""+graph_data.sps_low[graph_data.sps_low.length - 1]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(graph_data.sps_low[graph_data.sps_low.length - 1]) + 10
		})
		
	var series_line = vis.add(pv.Line)
		.data(graph_data.series)
		.top(function(d){
			return y_scale(d)
		})
		.left(function(d){
			return this.index * p_datapoint_step
		})
		.strokeStyle(function(d){
			return "blue"
			// this seems to only get evaluated for the first line segment...
			//return (d < data.sps_high[this.index] && d > data.sps_low[this.index]) ? "blue" : "red"
		})
		.lineWidth(2)
		
	vis.render()
	
}