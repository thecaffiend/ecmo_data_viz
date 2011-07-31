// DEPRECATED! 
// only still here if we want the gauge type view

var pressure_data = {
	sps_high: make_array(20, 215).concat(make_array(20, 225)),
	sps_low: make_array(20, 165).concat(make_array(20, 175)),
	pressures: [],
}

var x_scale = null;
var y_scale = null;

// convenience function to create the pressures array. just for testing
function init_pressures(num_items){
	while(num_items--){
		pressure_data.pressures.push(get_random(170, 225))
	}
}

function render_pressure_graph(div_id){
	var h = $("#"+div_id).height()
	var w = $("#"+div_id).width()
	
	init_pressures(40)
	
	// take up 4/5 of the width with the setpoint and pressure lines
	var sp_datapoint_step = (w-(w/5)) / pressure_data.sps_high.length;	
	var p_datapoint_step = (w-(w/5)) / pressure_data.pressures.length;	
	
	// get the min and max values of the set points
	var max_sp = _.max(pressure_data.sps_high)
	var min_sp = _.min(pressure_data.sps_low)
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
		.data(pressure_data.sps_high)
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
			return ""+pressure_data.sps_high[pressure_data.sps_high.length - 1]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(pressure_data.sps_high[pressure_data.sps_high.length - 1]) + 10
		})
		
		
	var setpoint_bottom_line = vis.add(pv.Line)
		.data(pressure_data.sps_low)
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
			return ""+pressure_data.sps_low[pressure_data.sps_low.length - 1]
		})
		.textAlign("center")
		.font('20px Verdana bold')
		.textStyle('black')
		.right(w/6)
		.top(function(){
			// add 10 to push the label down
			return y_scale(pressure_data.sps_low[pressure_data.sps_low.length - 1]) + 10
		})
		
	var pressure_line = vis.add(pv.Line)
		.data(pressure_data.pressures)
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

function render_pressure_gauge(div_id){
	var abs_min = 0
	var abs_max = 100
	var sp_min = 15
	var sp_max = 75
	var curr_pres = 45
	
	var h = $(document).height()
	var w = $(document).width()
	
	// label for abs max starts @ 0, bar starts at v_label_bump (vertical label
	// bump), bar ends at h-labelbump and label for abs min starts has a bottom 
	// @ height
	var v_label_bump = h/12
	
	var pressure_scale = pv.Scale.linear(abs_max, abs_min).range(v_label_bump, h-v_label_bump)
	
	var vis = new pv.Panel()
		.canvas(div_id)
		.height(function() {
			return h
		})
		.width(function() {
			return w
		})
	// the pressure bar min to max pressurec
	var pressure_bar = vis.add(pv.Bar)
		.top(function(){
			return v_label_bump
		})
		.height(function(){
			return h - (2*v_label_bump)
		})
		.fillStyle("lightgrey")
		.width(function(){
			return w/6
		})
		.left(function(){
			return w/6
		})
		
	var setpoint_bar = vis.add(pv.Bar)
		.top(function(){
			return pressure_scale(sp_max)
		})
		.height(function(){
			var t = pressure_scale(sp_max)
			var b = pressure_scale(sp_min)
			return b-t
		})
		.fillStyle("grey")
		.width(function(){
			return w/6
		})
		.left(function(){
			return w/6
		})

	// max pressure label
	vis.add(pv.Label)
		.text(function(){
			return ""+abs_max
		})
		.textAlign("left")
		.font('25px Verdana bold')
		.textStyle('darkgrey')
		.left(function(){
			return 3*(w/6)/4
		})
		.top(function(){
			return v_label_bump
		})
	
	// min pressure label
	vis.add(pv.Label)
		.text(function(){
			return ""+abs_min
		})
		.textAlign("left")
		.font('25px Verdana bold')
		.textStyle('darkgrey')
		.left(function(){
			return 3*(w/6)/4
		})
		.top(function(){
			return h-v_label_bump
		})
		
	// sp max pressure dot
	vis.add(pv.Dot)
		.size(50)
		.left(function(){
			return (w/6)/2
		})
		.top(function(){
			return pressure_scale(sp_max)
		})
		.fillStyle('black')
		.strokeStyle('black')
	// sp max pressure label
	.anchor('bottom').add(pv.Label)
		.text(function(){
			return ""+sp_max
		})
		.textAlign("center")
		.font('30px Verdana bold')
		.textStyle('darkgrey')
	.add(pv.Rule)
		.left(function(){
			return ((w/6)/2)
		})
		.width(function(){
			return (2*(w/6))-((w/6)/2)
		})
		.top(function(){
			return pressure_scale(sp_max)
		})
		.lineWidth(3)
		
	// sp max pressure dot
	vis.add(pv.Dot)
		.size(50)
		.left(function(){
			return (w/6)/2
		})
		.top(function(){
			return pressure_scale(sp_min)
		})
		.fillStyle('black')
		.strokeStyle('black')
	// sp max pressure label
	.anchor('top').add(pv.Label)
		.text(function(){
			return ""+sp_min
		})
		.textAlign("center")
		.font('30px Verdana bold')
		.textStyle('darkgrey')
	.add(pv.Rule)
		.left(function(){
			return ((w/6)/2)
		})
		.width(function(){
			return (2*(w/6))-((w/6)/2)
		})
		.top(function(){
			return pressure_scale(sp_min)
		})
		.lineWidth(3)
	
	// current pressure dot
	vis.add(pv.Dot)
		.size(60)
		.left(function(){
			return (2*(w/6))+(w/6)/2
		})
		.top(function(){
			return pressure_scale(curr_pres)
		})
		.fillStyle('blue')
		.strokeStyle('blue')
	// current pressure label
	.anchor('top').add(pv.Label)
		.text(function(){
			return ""+curr_pres
		})
		.textAlign("center")
		.font('40px Verdana bold')
		.textStyle('blue')
	.add(pv.Rule)
		.left(function(){
			return ((w/6))
		})
		.width(function(){
			return (2*(w/6))-((w/6)/2)
		})
		.top(function(){
			return pressure_scale(curr_pres)
		})
		.strokeStyle('blue')
		.lineWidth(3)
	
	vis.render()
}
