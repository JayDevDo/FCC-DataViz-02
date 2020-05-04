const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const cors_api_url = 'https://cors-anywhere.herokuapp.com/';
let xhttp = new XMLHttpRequest();
let theData = []

function onLoad(){
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            theData = JSON.parse(this.responseText);
            // console.log("the data", theData)
            buildChart(theData);
        }
    };
    xhttp.open("GET", cors_api_url + dataURL, true);
    xhttp.send();
    return  "request sent";
}

function onLoadLocal(){
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            theData = JSON.parse(this.responseText);
            // console.log("the data", theData)
            buildChart(theData);
        }
    };
    xhttp.open("GET", "cyclist-data.json", true);
    xhttp.send();
    return  "request sent";
}

// console.log("doing onLoad", onLoadLocal() )
console.log("doing onLoad", onLoad() )

const m = { t: 20, r: 10, b: 100, l: 80 };
const appW      =   document.getElementById("app").offsetWidth;
const appH      =   document.getElementById("app").offsetHeight;
const legendW   =   400;
const legendH   =   400;
const legendX   =   (appW - legendW - m.r )
const legendT   =   "translate(" + legendX + ", " + m.t +  ")" ;


function buildChart(data){
console.log("buildChart", data.length );

// make a time object from the Time entry + a boolean for doping use.
for (it in data){
    let item = data[it];
    item.Year = parseInt(item.Year);
    item.tmObj = new Date( 1970, 0, 1, 0, item.Time.split(":")[0], item.Time.split(":")[1] );
    item.doper = (item.Doping.length > 0);
}

const container =   d3.select("#svgContainer")
                        .append("svg")
                        .attr("id","chart")
                        .attr("height", appH)
                        .attr("width", appW)
                    ;

const yAxis =   container
                    .append("g")
                    .attr("id","y-axis")
                    .attr("transform", "translate( " + m.l + ", " + ( appH - m.t )+ ")" )
                ;

const xAxis =   container
                    .append("g")
                    .attr("id","x-axis")
                    .attr("border", "1px solid orange")
                    .attr("transform", "translate(0, " + (appH - m.t ) + ")" )
                ;

const dots = container
                    .append("g")
                    .attr("id","dataDots")
                    .attr("height", (appH - m.t - m.b) )
                    .attr("width",  (appW - m.l - m.r) )
                ;

const xScale = d3.scaleLinear()
                    .domain([
                        d3.min(data, (d)=>{ return d.Year  ; } ) , 
                        d3.max(data, (d)=>{ return d.Year ; } ) 
                    ])
                    .range([ 
                        m.l, 
                        appW-m.r-m.l  
                    ]);

const yScale = d3.scaleTime()
                    .domain( d3.extent( data, (d)=> {return d.tmObj;}) )
                    .range([ m.t, appH-m.b ])
                    ;

const tmFormat = d3.timeFormat('%M:%S');

dots.selectAll("circle")
    .data(data).enter()
    .append("circle")
        .attr("class", "dot")
        .attr("id", (d)=> { return  "dot_" + d.Place; } )
        .attr("cx", (d)=> { return xScale( d.Year ); } )
        .attr("cy", (d)=> { return m.t + yScale( d.tmObj ); } )
        .attr("r", 3 )
        .attr("data-doper", (d)=>{ return d.doper;} )
        .attr("data-year", (d)=> { return d.Year; }  )
        .attr("data-xvalue", (d)=> { return d.Year; }  ) // year of tour de france integer
        .attr("data-yvalue", (d)=> { return  tmFormat(d.tmObj) ; }  ) // time of ascent in time-object minutes
        .style("fill", (d)=>{ return d.doper? "red":"green"; })
        .on("mouseover", dotHover )
        .on("mouseout", dotLeave )
    ;

const legend =  container.append("g")
                    .attr("id","legend")
                    .attr("class", "legend")
                    .attr("width", legendW )
                    .attr("height", legendH )
                    .attr("transform", legendT )
 
legend.append("rect")
        .attr("width", 20 )
        .attr("height", 20 )
        .style("fill", "red") 

legend.append( "text" )
                .attr("dx", 25)
                .attr("dy", 15)
                .attr( "width", 250 )
                .attr( "height", 80 )
                .attr( "font-color", "white")
                .style( "font-size", "22px" )
                .text("Doped")
;

legend.append("rect")
        .attr("width", 20 )
        .attr("height", 20 )
        .style("fill", "green") 
        .attr("transform", "translate(0,40)")

legend.append( "text" )
                .attr("dx", 25)
                .attr("dy", 60)
                .attr( "width", 250 )
                .attr( "height", 80 )
                .attr( "font-color", "white")
                .style( "font-size", "22px" )
                .text("probably Doped")
;

legend.append( "text" )
                .attr("dx", 25)
                .attr("dy", 100)
                .attr("id", "tooltip" )
                .attr( "width", 250 )
                .attr( "height", 180 )
                .attr( "font-color", "white")
                .style( "font-size", "18px" )
                .text( "info" )


container.append("g")
        .attr("class", "axis x-axis")
        .attr( "transform", "translate(" + (0) + ", " + (appH-m.b+m.t) + " )" )
        .call(d3.axisBottom(xScale))
            .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("class","tick")
                .attr("class","x-tick")
                .attr("transform", "rotate(-90)")
;

// Add the Y Axis
container.append("g")
        .attr( "class", "axis y-axis" )
        .attr( "transform", "translate(" + m.l + ", " + m.t + " )" )
        .call( d3.axisLeft(yScale) )
            .selectAll("text")	
                .style("text-anchor", "start")
                .attr("dx", "-3.0em")
                .attr("class","tick")
                .attr("class","y-tick")
;

function dotHover(d,e){ 
    console.log("hovering IN" )
    d3.select("#tooltip")
        .text(
            "#:" + d.Place + " " + d.Name + " in " +  d.Year + 
            ( d.doper? " while on dope":" so far not proven on dope" ) + 
            " took " +  d.Time + " minutes "
        )
        .attr("dx",-200)
        .attr("data-year", d.Year )
        .style("opacity", "1")

}

function dotLeave(){
    console.log("hovering OUT"  )
    d3.select("#tooltip")
    .text("info")
    .style("opacity", "0")
    ;
}


}

