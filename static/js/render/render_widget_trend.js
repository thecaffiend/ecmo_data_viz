var x_scale = null;
var y_scale = null;

// if the absolute value of the slope of the least squares regression is 
// greater than this number, we will consider the trend to be increasing
// or decreasing. Less than this number will be cosidered a flat trend
var slope_tolerance = .5;

// number of seconds of data to show in this view. default of 5 minutes (300 seconds)
const SECONDS_TO_SHOW = 300;

// number of datapoints to render in the view. the SECONDS_TO_SHOW number of 
// seconds will be merged into NUM_DATAPOINTS_SHOWN number of points
const NUM_DATAPOINTS_SHOWN = 10;

var slow_high_key = null;
var slow_low_key = null;
var stop_high_key = null;
var stop_low_key = null;
var series_key = null;
var order_key = null;

function render_widget_trend(div_id, widget_conf, widget_data){
	var h = $("#"+div_id).height()
	var w = $("#"+div_id).width()
	
	slow_high_key = widget_conf.div_id + SLOW_HIGH_SFX;
	slow_low_key = widget_conf.div_id + SLOW_LOW_SFX;
	stop_high_key = widget_conf.div_id + STOP_HIGH_SFX;
	stop_low_key = widget_conf.div_id + STOP_LOW_SFX;
	series_key = widget_conf.div_id + SERIES_SFX;
	order_key = widget_conf.div_id + ORDER_SFX;
	
	// square will always be half the available height. if there is a 
	// triangle, it will take up the remaining half
	var half_height = h/2
	// centers the square
	var square_left = (w - half_height) / 2	
	
	var wdata = widget_data[series_key]
	var massaged_data = massage_data(wdata)
	
	// get the min and max setpoints (stop or slow)
	var max_sp_stop = null;
	var max_sp_slow = null;
	if(widget_data[stop_high_key].length){
		max_sp_stop = _.max(widget_data[stop_high_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	if(widget_data[slow_high_key].length){		
		max_sp_slow = _.max(widget_data[slow_high_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	var min_sp_stop = null
	var min_sp_slow = null
	if(widget_data[stop_low_key].length){
		min_sp_stop = _.min(widget_data[stop_low_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	if(widget_data[slow_low_key].length){
		min_sp_slow = _.min(widget_data[slow_low_key], function(d){return d[VAL_IDX]})[VAL_IDX]
	}
	
	var vals_x = _.map(widget_data[series_key], function(s){return s[TIME_IDX]});
	var vals_y = _.map(widget_data[series_key], function(s){return s[VAL_IDX]});
	var reg_slope = ls_regression_slope(vals_x, vals_y);
	
	var triangle_location = trend_direction(reg_slope)
	var triangle_exists = triangle_location != 0
	
	init_scales(square_left, triangle_location, half_height, widget_data)
	
	var vis = new pv.Panel()
		.canvas(div_id)
		.height(function() {
			return h
		})
		.width(function() {
			return w
		})
	
	var triangle = vis.add(pv.Dot)
		.top(function(){
			var ret = 0
			if(triangle_exists){
				ret = triangle_location == 1 ? half_height/2 : h - half_height/2;
			}
			return ret
		})
		.left(function(){
			return w/2
		})
		.fillStyle(function(){
			var last_value = vals_y[vals_y.length-1]
			if(max_sp_stop && min_sp_stop){
				if(max_sp_slow && min_sp_slow){
					return (last_value < max_sp_slow && last_value > min_sp_slow) ? 
						'blue' : 
						((last_value < max_sp_stop && last_value > max_sp_slow) || (last_value > min_sp_stop && last_value < min_sp_slow)) ? 'orange' : 'red'	
				}
				else{
					return (last_value < max_sp_stop && last_value > min_sp_stop) ? 'blue' : 'red'
				}
			}
			else if(max_sp_slow && min_sp_slow){
				return (last_value < max_sp_slow && last_value > min_sp_slow) ? 'blue' : 'red'
			}
		})
		.size(function(){
			return half_height * 10
		})
		.shape("triangle")
		.angle(function(){
			var ret = 0;
			if(triangle_exists){
				ret = triangle_location == 1 ? Math.PI: 0;
			}
			return ret;
		})
		.visible(function(){
			return triangle_exists
		})
	
	var square = vis.add(pv.Panel)
		.left(function(){
			return square_left
		})
		.top(function(){
			return get_square_top(triangle_location, half_height)
		})
		.width(function(){
			return half_height
		})
		.height(function(){
			return half_height
		})
		.fillStyle(function(){
			var last_value = vals_y[vals_y.length-1]
			if(!triangle_exists){
				return 'black'
			}
			else{
				if(max_sp_stop && min_sp_stop){
					if(max_sp_slow && min_sp_slow){
						return (last_value < max_sp_slow && last_value > min_sp_slow) ? 
							'blue' : 
							((last_value < max_sp_stop && last_value > max_sp_slow) || (last_value > min_sp_stop && last_value < min_sp_slow)) ? 'orange' : 'red'	
					}
					else{
						return (last_value < max_sp_stop && last_value > min_sp_stop) ? 'blue' : 'red'
					}
				}
				else if(max_sp_slow && min_sp_slow){
					return (last_value < max_sp_slow && last_value > min_sp_slow) ? 'blue' : 'red'
				}
			}
		})
	
	var graph_line = vis.add(pv.Line)
		.data(function(){
//			return widget_data[series_key]
			return massaged_data
		})
		.interpolate('step-after')
		.left(function(d){
			return x_scale(d[TIME_IDX])
		})
		.top(function(d){
			return y_scale(d[VAL_IDX])
		})
		.lineWidth(1)
		.strokeStyle('white')
		
	vis.render()
}

// this view is interested in showing the last 5 minutes
function massage_data(wdata){
	// try to grab the last frame of seconds we're interested in showing
	var seconds_slice = wdata.slice(-SECONDS_TO_SHOW)
	
	// function for calculating the average of our datapoint slices
	var avg = function(arr){return (_.reduce(arr, function(memo, dp){ return memo + dp[VAL_IDX]; }, 0))/arr.length}
	
	// do we care if we don't have a full frame of data? should we treat that 
	// differently?
	
	// go from SECONDS_TO_SHOW number of datapoints (or fewer) down to 
	// NUM_DATAPOINTS_SHOWN (or fewer). for now, just average 
	// the slice values...not the best solution
	var step = SECONDS_TO_SHOW / NUM_DATAPOINTS_SHOWN;
	var reduced_data = []
	for(var i=0; i < wdata.length; i+=step){
		var avg_data = avg(wdata.slice(i, i+step))
		reduced_data.push([wdata[i][TIME_IDX], avg_data])
	}
	return reduced_data
}

function init_scales(sq_left, tri_loc, half_height, widget_data){
	x_scale = pv.Scale.linear(widget_data[series_key], function(d){return d[TIME_IDX]}).range(sq_left, sq_left+half_height)
	
	var sq_top = get_square_top(tri_loc, half_height)
			
	y_scale = pv.Scale.linear(widget_data[series_key], function(d){return d[VAL_IDX]}).range(sq_top+half_height, sq_top)
}

function get_square_top(tri_loc, half_height){
	var ret = half_height - (half_height/2)
	if(tri_loc != 0){
		ret = tri_loc == 1 ? half_height : 0;
	}
	return ret
}

// if the data set is generally trending up, return 1. if generally unchanging
// return 0, else (generally trending down), return -1
function trend_direction(regression_slope){
	var ret = Math.abs(regression_slope) > slope_tolerance ? (regression_slope > 0 ? 1 : -1) : 0;
	return ret
}

// modified (to only return the slope) from here:
// http://dracoblue.net/dev/linear-least-squares-in-javascript/159/
function ls_regression_slope(values_x, values_y) {
	var sum_x = 0;
	var sum_y = 0;
	var sum_xy = 0;
	var sum_xx = 0;
	var count = 0;
	
	/*
	 * We'll use those variables for faster read/write access.
	 */
	var x = 0;
	var y = 0;
	var values_length = values_x.length;
	
	if (values_length != values_y.length) {
		throw new Error('The parameters values_x and values_y need to have same size!');
	}
	
	/*
	 * Nothing to do.
	 * LDP mod - Return 0. Consider an error state in the future.
	 */
	if (values_length === 0) {
		// use this if you're interested in returning the line itself
		// return [[], []]
		return 0;
	}
	
	/*
	* Calculate the sum for each of the parts necessary.
	*/
	for (var v = 0; v < values_length; v++) {
		x = values_x[v];
		y = values_y[v];
		sum_x += x;
		sum_y += y;
		sum_xx += x*x;
		sum_xy += x*y;
		count++;
	}
	
	/*
	 * Calculate m and b for the formular:
	 * y = x * m + b
	 */
	var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
	return m;
	
	// use the following if you're interested in returning the line itself
	//var b = (sum_y/count) - (m*sum_x)/count;
		
	/*
	 * We will make the x and y result line now
	 */
	//var result_values_x = [];
	//var result_values_y = [];
	
	//for (var v = 0; v < values_length; v++) {
	//	x = values_x[v];
	//	y = x * m + b;
	//	result_values_x.push(x);
	//	result_values_y.push(y);
	//}
	
	//return [result_values_x, result_values_y];
}
