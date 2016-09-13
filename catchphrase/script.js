// read local Storage
var savedPhrases = JSON.parse(localStorage.getItem('savedPhrases'));
var phrasesLeft;
var phrasesTotal;
if ($.isArray(savedPhrases)){
	phrasesLeft = savedPhrases.slice();
	phrasesTotal = savedPhrases.slice();
}
else{
	phrasesLeft = [];
	phrasesTotal = [];
}
var savedMin = JSON.parse(localStorage.getItem('minDuration'));
var savedMax = JSON.parse(localStorage.getItem('maxDuration'));
var minDuration;
var maxDuration;
if (savedMin && savedMax){
	minDuration = savedMin;
	maxDuration = savedMax;
}
else{
	minDuration = 0;
	maxDuration = 10;
}


function Timer(){
	// pick random duration after which end the current game
	this.duration = Math.random() * (maxDuration - minDuration) + minDuration;
	console.log(this.duration);
	this.tick = function(){
		this.time = (Date.now() - this.startTime) / 1000;
		$('#timer').html(this.time.toFixed(2) + " seconds");
		$("#reset").show();
		$("#cont").html("Continue");
		if (this.time > this.duration || !(this.ticking)){
			clearInterval(this.interval);
			$("#gameMenu").hide();
			$("#startMenu").show();
			this.ticking = false;
			if (this.time > this.duration){
				$("#log").html("You ran out of time.");
			}
		}
	};
	this.stop = function(){
		this.ticking = false;
	};
	this.start = function(){
		this.startTime = Date.now();
		this.ticking = true;
		this.interval = setInterval(this.tick.bind(this), 10);
	};
}

//callback functions
var uploadFile = function(event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function(){
    	var text = reader.result;
    	phrasesLeft = phrasesLeft.concat(text.split("\n"));
    	phrasesTotal = phrasesTotal.concat(text.split("\n"));
    	localStorage.setItem('savedPhrases', JSON.stringify(phrasesTotal));
    };
    reader.readAsText(input.files[0]);
    $("#phrases").html(phrasesTotal.reverse().slice(0,20).join("<br>"));
};

var timer;
var cont = function(){
	$("#startMenu").hide();
	$("#gameMenu").show();
	timer = new Timer();
	timer.start();
	next();
};

var next = function(){
	if (phrasesLeft.length === 0){
		$("#log").html("BOOM! You ran out of catchphrases!");
		$("#cont").hide();
		timer.stop();
	}
	var idx = Math.floor(Math.random() * phrasesLeft.length);
	var nextPhrase = phrasesLeft.splice(idx, 1)[0];
	$("#phrase").html(nextPhrase);
};

var reset = function(){
	phrasesLeft = phrasesTotal.slice();
	$("#reset").hide();
	$("#cont").html("Play");
	$("#cont").show();
};

// listen for button clicks and keypresses
$(document).ready(function(){
	reset();
	console.log("Hello, nerds!");
	 $("#phrases").html(phrasesTotal.reverse().slice(0,20).join("<br>"));
	$("#gameMenu").hide();
	$("#reset").hide();
	$("#cont").click(cont);
	$("#next").click(next);
	$("#reset").click(reset);
	$("#newPhrase").keyup(function(key){
		if (key.which === 13){
			// Carriage return
			var newPhrase = document.getElementById("newPhrase").value;
			document.getElementById("newPhrase").value = "";
			phrasesTotal.push(newPhrase);
			phrasesLeft.push(newPhrase);
			localStorage.setItem('savedPhrases', JSON.stringify(phrasesTotal));
			 $("#phrases").html(phrasesTotal.reverse().slice(0,20).join("<br>"));
		}
	});
	$("#durationRange").slider({
      range: true,
      min: 0,
      max: 10,
      values: [minDuration, maxDuration],
      slide: function(event, ui) {
      	  minDuration = ui.values[0];
          maxDuration = ui.values[1];
          localStorage.setItem('minDuration', JSON.stringify(minDuration));
          localStorage.setItem('maxDuration', JSON.stringify(maxDuration));
          $("#amount").val(minDuration + "s - " + maxDuration + "s");
      }
    });
    $( "#amount" ).val($( "#durationRange" ).slider( "values", 0 ) + "s - " + 
    			       $( "#durationRange" ).slider( "values", 1 ) + "s" );
});

// math
var sgn = function(x){
	if(x === 0){
        return 0;
    } 
    else if(x > 0){
        return 1;
    } 
    else {
        return -1;
    }
};

var sqrd = function(x){
	return x * x;
};

var normpdf = function(x, a, b, mu, sigma){
	if (a <= x && x <= b){
		return Math.exp(- sqrd(Math.pow((x - mu) / sigma)) / 2) / (Math.sqrt(2 * Math.PI) * sigma);
	}
	else{
		return 0;
	}
};

var erfinv = function(x){
    var a  = 0.147;                                                   
    if(x === 0){
    	return 0;  
    } 
    else {
        var ln = Math.log(1-x*x);
        var firstSqrt = Math.sqrt(sqrd(2 /(Math.PI * a) + ln /2) - ln / a );
        var secondSqrt = Math.sqrt(firstSqrt - (2 / (Math.PI * a) + ln / 2));
        return sgn(x) * secondSqrt;
    }
};

var probit = function(x){
	return Math.sqrt(2) * erfinv(2 * x -1);
};

var normrv = function(a, b, mu, sigma){
	if (a >= b){
		throw "Nonsensical range";
	}
	while (true){
		var rv = mu + sigma * probit(Math.random());
		if (a <= rv && rv <= b){
			return rv;
		}
	}	
};

var m = [80, 80, 80, 80]; // margins
var w = 1000 - m[1] - m[3]; // width
var h = 400 - m[0] - m[2]; // height
// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
var data = [3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];
// X scale will fit all values from data[] within pixels 0-w
var x = d3.scale.linear().domain([0, data.length]).range([0, w]);
// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
var y = d3.scale.linear().domain([0, 10]).range([h, 0]);
// automatically determining max range can work something like this
// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);
// create a line function that can convert data[] into x and y points
var line = d3.svg.line()
	// assign the X function to plot our line as we wish
	.x(function(d,i) { 
		// verbose logging to show what's actually being done
		console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
		// return the X coordinate where we want to plot this datapoint
		return x(i); 
	})
	.y(function(d) { 
		// verbose logging to show what's actually being done
		console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
		// return the Y coordinate where we want to plot this datapoint
		return y(d); 
	})
	// Add an SVG element with the desired dimensions and margin.
	var graph = d3.select("#graph").append("svg:svg")
	      .attr("width", w + m[1] + m[3])
	      .attr("height", h + m[0] + m[2])
	    .append("svg:g")
	      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
	// create yAxis
	var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
	// Add the x-axis.
	graph.append("svg:g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + h + ")")
	      .call(xAxis);
	// create left yAxis
	var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
	// Add the y-axis to the left
	graph.append("svg:g")
	      .attr("class", "y axis")
	      .attr("transform", "translate(-25,0)")
	      .call(yAxisLeft);
	
  	// Add the line by appending an svg:path element with the data line we created above
	// do this AFTER the axes above so that the line is above the tick-lines
  	graph.append("svg:path").attr("d", line(data));
