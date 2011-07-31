// mak an array of how_many elements, each with the value value.
// adopted from 
// http://stackoverflow.com/questions/4049847/initializing-an-array-with-a-single-value
function make_array(how_many, value){
    var output = [];
    while(how_many--){
        output.push(value);
    }
    return output;
}

function get_random(min, max){
	var rand = null;
	var rng = max - min;
	
	// generate a random number between 1 and the range of allowed values
	rand = Math.floor(Math.random()*(rng+1))
	
	// return the random number added to the min value so it's on the right
	// range of values
	return rand + min;
}
