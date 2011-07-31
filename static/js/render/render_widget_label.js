// label data is just for testing pre-backend
var label_data = {
	label:"Pre-Membrane Pressure",
	unit:"mmHG",
	symbol:"P",
	
	// current is the last datapaint
	datapoints:_.range(10, 90, 10).concat(_.range(90,10, -10))

}

var x_scale = null;
var y_scale = null;

function render_widget_label(div_id){
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
		.text(label_data.symbol)
		.font("20px Verdana bold")
	
	symbol_dot.anchor("bottom").add(pv.Label)
		.text(label_data.unit)
		.font("16px Verdana bold")
	
	vis.add(pv.Label)
		.text(label_data.label)
		.top(h/3)
		.left(w/4)
		.font("16px Verdana bold")
	
	vis.add(pv.Label)
		.text(function(){
			return ""+label_data.datapoints[label_data.datapoints.length-1]
		})
		.top(h)
		.left(w/2)
		.font("32px Verdana bold")
		.textStyle("blue")
	
		
	vis.render()
}

