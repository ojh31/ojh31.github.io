function Timer(){
	// pick random duration after which end the current game
	if (localStorage.getItem('dist') === "normal"){
		this.duration = normrv(minDuration, maxDuration, meanDuration, sdDuration);
	}
	else{
		this.duration = uniform(minDuration, maxDuration);
	}
	this.tick = function(){
		this.time = (Date.now() - this.startTime) / 1000;
		$('#timer').html(this.time.toFixed(2) + " seconds");
		$("#reset").show();
		$("#cont").html("Continue");
		if (this.time > this.duration || !(this.ticking)){
			clearInterval(this.interval);
			phrasesLeft.push(nextPhrase);
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
	console.log(timer);
	timer.start();
	next();
};

var nextPhrase;
var next = function(){
	if (phrasesLeft.length === 0){
		$("#log").html("BOOM! You ran out of catchphrases!");
		$("#cont").hide();
		timer.stop();
	}
	var idx = Math.floor(Math.random() * phrasesLeft.length);
	nextPhrase = phrasesLeft.splice(idx, 1)[0];
	$("#phrase").html(nextPhrase);
};

var reset = function(){
	phrasesLeft = phrasesTotal.slice();
	$("#reset").hide();
	$("#log").html("");
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
