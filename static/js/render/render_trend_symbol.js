var data = {
		sp_max:100,
		sp_min:0,
		// current is the last datapaint
		datapoints:_.range(10, 90, 10).concat(_.range(90,10, -10))
	}

var x_scale = null;
var y_scale = null;

function render_trend_symbol(div_id){
	var h = $(document).height()
	var w = $(document).width()
	
	init_dataset()
	console.log(data.dataset)
	
	// square will always be half the available height. if there is a 
	// triangle, it will take up the remaining half
	var half_height = h/2
	// centers the square
	var square_left = (w - half_height) / 2	
	var triangle_location = trend_direction()
	var triangle_exists = triangle_location != 0
	
	init_scales(square_left, triangle_location, half_height)
	
	var vis = new pv.Panel()
		.canvas(div_id)
		.strokeStyle('blue')
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
		.fillStyle("blue")
		.size(function(){
			return half_height * 115
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
		.fillStyle("blue")
	
	var graph_line = vis.add(pv.Line)
		.data(function(){
			return data.dataset
		})
		.interpolate('step-after')
		.left(function(d){
			return x_scale(d.x)
		})
		.top(function(d){
			return y_scale(d.y)
		})
		.lineWidth(3)
		.strokeStyle('white')
		
	vis.render()
}

function init_dataset(){
	var i = 0;
	data['dataset'] = _.map(data.datapoints, function(d){
		return {x:i++, y:d}
	})
	
}

function init_scales(sq_left, tri_loc, half_height){
	x_scale = pv.Scale.linear(data.dataset, function(d){return d.x}).range(sq_left, sq_left+half_height)
	
	var sq_top = get_square_top(tri_loc, half_height)
	console.log("sq_top", sq_top, "sq_left", sq_left, "tri_loc", tri_loc, "half_height", half_height)
			
	y_scale = pv.Scale.linear(data.dataset, function(d){return d.y}).range(sq_top, sq_top+half_height)
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
function trend_direction(){
	return 1
}
