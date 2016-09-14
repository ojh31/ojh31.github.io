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
var savedMean = JSON.parse(localStorage.getItem('meanDuration'));
var savedSd = JSON.parse(localStorage.getItem('sdDuration'));
var meanDuration;
var sdDuration;
if (savedMean && savedSd){
	meanDuration = savedMean;
	sdDuration = savedSd;
}
else{
	meanDuration = 5;
	sdDuration = 1;
}

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
	if (a <= x && x <= b && sigma !== 0){
		return Math.exp(-0.5 * sqrd((x - mu) / sigma)) / (Math.sqrt(2 * Math.PI) * sigma);
	}
	else if (sigma === 0 && x === mu){
		return 1
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
