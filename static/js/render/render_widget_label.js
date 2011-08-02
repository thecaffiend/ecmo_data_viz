var x_scale = null;
var y_scale = null;

function render_widget_label(div_id, widget_conf, widget_data){
	var h = $("#"+div_id).height()
	var w = $("#"+div_id).width()
	
	var vis = new pv.Panel()
		.canvas(div_id)
		.height(function() {
			return h
		})
		.width(function() {
			return w
		})
	
	var symbol_dot = vis.add(pv.Dot)
		.top(h/3)
		.left(w/7)
		.fillStyle("white")
		.strokeStyle("black")
		.size(function(){
			return h*5;
		})
	.anchor("center").add(pv.Label)
		.text(widget_conf.symbol)
		.font("20px Verdana bold")
	
	symbol_dot.anchor("bottom").add(pv.Label)
		.text(widget_conf.unit)
		.font("16px Verdana bold")
	
	vis.add(pv.Label)
		.text(widget_conf.label)
		.top(h/3)
		.left(w/4)
		.font("16px Verdana bold")
	
	vis.add(pv.Label)
		.text(function(){
//			return ""+widget_data[SERIES_IDX][widget_data[SERIES_IDX].length-1][VAL_IDX]
			var wd_key = widget_conf.div_id + SERIES_SFX;
			return ""+widget_data[wd_key][widget_data[wd_key].length-1][VAL_IDX]
		})
		.top(h)
		.left(w/2)
		.font("32px Verdana bold")
		.textStyle("blue")
	
		
	vis.render()
}

