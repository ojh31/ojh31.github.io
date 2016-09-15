var distShow = function(dist){
    if (dist === "normal"){
        $("#normal").show();
    }
    if (dist === "uniform"){
        $("#normal").hide();
    }
    localStorage.setItem('dist', dist);
    document.getElementById('dist').value = dist;
};

var showGraph = function(){
    d3.select("svg").remove();
    var data = [];
    if (minDuration === maxDuration){
    	data = [{"x": 0, "y": 0}, {"x": minDuration, "y": 0}, {"x": minDuration, "y": 1}, {"x": minDuration, "y": 0},
    		{"x": minDuration * 2, "y": 0}];
    }
    else if (sdDuration === 0 && minDuration <= meanDuration && meanDuration <= maxDuration){
    	data = [{"x": 0, "y": 0}, {"x": meanDuration, "y": 0}, {"x": meanDuration, "y": 1}, {"x": meanDuration, "y": 0},
    		{"x": meanDuration * 2, "y": 0}];
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
$(document).ready(function(){
  $("#rangeSlider").slider({
        range: true,
      	min: 0,
        max: 120,
        values: [minDuration, maxDuration],
        slide: function(event, ui) {
      	    minDuration = ui.values[0];
            maxDuration = ui.values[1];
            localStorage.setItem('minDuration', JSON.stringify(minDuration));
            localStorage.setItem('maxDuration', JSON.stringify(maxDuration));
            $("#range").val(minDuration + "s - " + maxDuration + "s");
            showGraph();
      }
    });
    $( "#range" ).val($("#rangeSlider").slider( "values", 0 ) + "s - " + 
    			       $("#rangeSlider").slider( "values", 1 ) + "s" );
     $( "#meanSlider" ).slider({
       value:meanDuration,
       min: 0,
       max: 120,
       step: 1,
       slide: function( event, ui ) {
       	meanDuration = ui.value;
       	localStorage.setItem('meanDuration', JSON.stringify(meanDuration));
         $( "#mean" ).val(ui.value + "s");
         showGraph();
       }
     });
     $("#mean").val($( "#meanSlider" ).slider("value") + "s");
      $( "#sdSlider" ).slider({
       value:sdDuration,
       min: 0,
       max: 12,
       step: 0.1,
       slide: function( event, ui ) {
       	sdDuration = ui.value;
       	localStorage.setItem('sdDuration', JSON.stringify(sdDuration));
         $( "#sd" ).val(ui.value + "s");
         showGraph();
       }
     });
     $("#sd").val($( "#sdSlider" ).slider("value") + "s");
    showGraph();
     distShow(localStorage.getItem('dist') ? localStorage.getItem('dist') : "uniform");
});
	
