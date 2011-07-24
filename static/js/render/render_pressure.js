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
	// var invisi_bar = vis.add(pv.Bar)
		// .top(function(){
			// return v_label_bump
		// })
		// .height(function(){
			// return h - (2*v_label_bump)
		// })
		// .fillStyle(null)
		// .width(function(){
			// return w/6
		// })
		// .left(function(){
			// return 0
		// })
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
