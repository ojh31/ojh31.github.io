function Timer(){
	// pick random duration after which end the current game
	if (localStorage.getItem('dist') === "normal"){
	    console.log(this);
		this.duration = normrv(minDuration, maxDuration, meanDuration, sdDuration);
	}
	else{
	    console.log(this);
		this.duration = uniform(minDuration, maxDuration);
	}
	
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

$(document).ready(function(){
    reset();
    $("#gameMenu").hide();
	$("#reset").hide();
	$("#cont").click(cont);
	$("#next").click(next);
	$("#reset").click(reset);
});
