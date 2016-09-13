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
var meanDuration = 5;
var sdDuration = 1;


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
            showGraph();
      }
    });
    $( "#amount" ).val($( "#durationRange" ).slider( "values", 0 ) + "s - " + 
    			       $( "#durationRange" ).slider( "values", 1 ) + "s" );
    showGraph();
});

var showGraph = function(){
    d3.select("svg").remove();
    var data = [];
    if (minDuration === maxDuration){
    	data = [{"x": 0, "y": 0}, {"x": minDuration, "y": 0}, {"x": minDuration, "y": 1}, {"x": minDuration, "y": 0},
    		{"x": minDuration + 1, "y": 0}];
    }
    else{
    	for (t=minDuration; t<=maxDuration; t+= (maxDuration - minDuration) / 100){
            data.push({
                "x": t,
                "y": normpdf(t, minDuration, maxDuration, meanDuration, sdDuration)
            });
    	}
    }
    var margin = {top: 50, right: 50, bottom: 50, left: 70},
    width = $("#settings").width() - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    var x = d3.scale.linear()
        .range([0, width]);
    var y = d3.scale.linear()
        .range([height, 0]);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    var line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });
    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    x.domain(d3.extent(data, function(d) { return d.x; }));
    y.domain(d3.extent(data, function(d) { return d.y; }));
    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .attr("transform", "translate(0," + height + ")")
        .append("text")
        .attr("transform", "translate(" + (width/2) + ",40)")
        .attr("x", 6)
        .attr("dx", ".71em")
        .style("text-anchor", "start")
        .text("Duration");
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90) translate(-" + (height/2) + ",-70)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Probability density");
    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
};

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
		return Math.exp(-0.5 * sqrd((x - mu) / sigma)) / (Math.sqrt(2 * Math.PI) * sigma);
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
