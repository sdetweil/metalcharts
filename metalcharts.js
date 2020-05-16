/*

sample module structure


 */


Module.register("metalcharts", {
    
    // define variables used by module, but not in config data
//    some_variable:  true,
//    some_other_variable: "a string",
    data:null,
    ticklabel:[],
    charts:null,
    wrapper:null,
    min_gold_price:100000000,
    max_gold_price:0,

    // anything here in defaults will be added to the config data
    // and replaced if the same thing is provided in config
    defaults: {
	type:'db',
	dateFormat:"MM/DD/YYYY HH:mm:SS",
	metals:[],
	line_colors:{gold:'white',palladium:'red'},
	chart_title:"title",
	xAxisLabel:"xaXis",
	yAxisLabel:"dollars",
	ranges: {min:500.0,max:2000.0, stepSize:200.0},

	height: 400,
	width: 400,
	//defaultFontSize:12,

	backgroundColor: 'black',   
	chartTitleColor: 'white',
	legendTextColor:'white',

	xAxisLabelColor:'white',    
	xAxisTickLabelColor:'white',

	yAxisLabelColor:'white',    
	yAxisTickLabelColor:'white',  	
	datafile:"edelmetallpreise.csv",
	database:"edelmetallpreise.db",
	limit:180,	
	defer:true,
//dirk
//	month_names:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
	month_names:['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ']
//end
    },

    init: function() {
	//Log.log(this.name + " is in init!");
    },

    start: function() {
	Log.log(this.name + " is starting!");
    },

    loaded: function(callback) {
	Log.log(this.name + " is loaded!");
	callback();
    },

    // return list of other functional scripts to use, if any (like require in node_helper)
    getScripts: function() {
	return	[
	    "moment.js", "modules/" + this.name + "/node_modules/chart.js/dist/Chart.min.js"
	    // sample of list of files to specify here, if no files,do not use this routine, or return empty list

	    //'script.js', // will try to load it from the vendor folder, otherwise it will load is from the module folder.
	    //'moment.js', // this file is available in the vendor folder, so it doesn't need to be available in the module folder.
	    //this.file('anotherfile.js'), // this file will be loaded straight from the module folder.
	    //'https://code.jquery.com/jquery-2.2.3.min.js',  // this file will be loaded from the jquery servers.
	]
    }, 

    // return list of stylesheet files to use if any
    getStyles: function() {
//dirk
//	return 	[
	return 	[this.data.path + "/css/mc.css"
//end
	    // sample of list of files to specify here, if no files, do not use this routine, , or return empty list

	    //'script.css', // will try to load it from the vendor folder, otherwise it will load is from the module folder.
	    //'font-awesome.css', // this file is available in the vendor folder, so it doesn't need to be avialable in the module folder.
	    //this.file('anotherfile.css'), // this file will be loaded straight from the module folder.
	    //'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css',  // this file will be loaded from the bootstrapcdn servers.
	]
    },

    // return list of translation files to use, if any
    /*getTranslations: function() {
	return {
	    // sample of list of files to specify here, if no files, do not use this routine, , or return empty list

	    // en: "translations/en.json",  (folders and filenames in your module folder)
	    // de: "translations/de.json"
	}
    }, */ 

    // only called if the module header was configured in module config in config.js
//dirk
    /*getHeader: function() {
	return this.data.header + " Foo Bar";
    },*/
    getHeader: function() {
	return this.data.header;
    },
//end

    // messages received from other modules and the system (NOT from your node helper)
    // payload is a notification dependent data structure
    notificationReceived: function(notification, payload, sender) {
	var self = this
	// once everybody is loaded up
	if(notification === "ALL_MODULES_STARTED") {
	    // send our config to our node_helper
	    this.sendSocketNotification("CONFIG",this.config) 
	    this.sendSocketNotification("get_prices",null)
	}
	if(this.config.debug) {
	    if (sender) {
		Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
	    }
	    else {
		Log.log(this.name + " received a system notification: " + notification);
	    }
	}
    },

    // messages received from from your node helper (NOT other modules or the system)
    // payload is a notification dependent data structure, up to you to design between module and node_helper
    socketNotificationReceived: function(notification, payload) {
	if(this.config.debug)
	    Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
	// helper sent us back the current file (after appending any data)
	if(notification === "newdata") {
	    if(this.config.debug)
		Log.log(this.name+" new data arrived ="+JSON.stringify(payload))
	    this.chartdata = payload;
	    // tell mirror runtime that our data has changed,
	    // we will be called back at GetDom() to provide the updated content
	    this.updateDom(1000)
	}
    },

    // system notification your module is being hidden
    // typically you would stop doing UI updates (getDom/updateDom) if the module is hidden
    suspend: function() {

    },

    // system notification your module is being unhidden/shown
    // typically you would resume doing UI updates (getDom/updateDom) if the module is shown
    resume: function() {

    },
    
//dirk
    // create document element worker
    createEl : function (type, id, className, parent, value) {
	var el= document.createElement(type)
	if(id)
	    el.id = id
	if(className)
	    el.className = className		
	if(parent)
	    parent.appendChild(el)
	if(value) { 
	    var e = document.createTextNode(value)
	    el.appendChild(e)
	}
	return el
    },
//end

    // this is the major worker of the module, it provides the displayable content for this module
    getDom: function() {
	var self = this   
	//if(wrapper == null)
//dirk
//	wrapper = document.createElement("div");
	wrapper = this.createEl("div", null, "BOX", null, null);
//end

	if(this.chartdata == null) {
	    wrapper.innerHTML = self.name + " is loading...";
	}
	else {
	    wrapper.innerHTML = null
	    wrapper.style.maxWidth = self.config.width + "px";
	    wrapper.style.maxHeight = self.config.height + "px";
	    wrapper.style.width = self.config.width + "px";
	    wrapper.style.height = parseInt(self.config.height) + "px";  			
//dirk
//	    var d = document.createElement('div')
	    var d = document.createElement('div')
//          d.style.width = (self.config.width -10) + "px";
            d.style.width = (self.config.width) + "px";
//end
            d.style.height = self.config.height + "px";    
//dirk
//	    d.style.maxWidth = (self.config.width -10) + "px";
            d.style.maxWidth = (self.config.width) + "px";
//end
            d.style.maxHeight = self.config.height + "px"; 			
	    
	    var canvas=document.createElement('canvas')
            canvas.id = "mymetals_" + self.identifier ;
//dirk
//          canvas.style.width = (self.config.width -10) + "px";
            canvas.style.width = (self.config.width) + "px";
//end
            canvas.style.height = self.config.height + "px";    
//dirk
//          canvas.style.maxWidth = (self.config.width -10) + "px";
            canvas.style.maxWidth = (self.config.width) + "px";
//end
            canvas.style.maxHeight = self.config.height + "px";             
            canvas.style.resize = 'none'
            canvas.style.overflow = 'hidden'
            canvas.style.backgroundColor = self.config.backgroundColor;	
	    d.appendChild(canvas)
		
	    var __$ds = []
	    self.min_gold_price = 100000000, self.max_gold_price = 0; 
	    //wrapper.innerHTML = "have data";
	    for(var metal of self.config.metals) {
		// make sure there is data for this selection (spelling errors etc)
		if(self.chartdata[metal] != undefined) {
		    // create a new dataset description, one for each location 
		    // multiple states or countries
		    __$ds.push( {
			xAxisID: 'dates',
			data: self.chartdata[metal],     // < -----   data for this dataset
//dirk
//			fill: false,
			fill: self.config.drawChart.line.fill,
//end
			borderColor: self.config.line_colors[metal], // Add custom color border (Line)
			backgroundColor: self.config.line_colors[metal],
			label: metal,
			showInLegend: true,
//dirk       
//			borderWidth: 2,           
			borderWidth: self.config.drawChart.line.borderWidth,
//end
		    })
			
		    // set the start tick label
		    // make a x axes tick label for start/end and each month day 1
		    self.ticklabel = []
		    self.ticklabel.push(self.chartdata[metal][0].x)
		    var m = moment(moment(self.chartdata[metal][0].x,"YYYY-MM-DD").endOf('month')+1,'unix')

		    for(var count = self.chartdata[metal].length/30; count>0; count--) {
//dirk
			self.ticklabel.push(m.format("YYYY-MM-DD"))
//			self.ticklabel.push(m.format("MMM"))
//end
			m = m.add(1,'month')
		    }
			
		    // get the date of the last day of data
		    var idx = self.chartdata[metal].length-1
		    
		    // if it is not the 1st of the mmonth
		    if((m = moment(self.chartdata[metal][idx].x,"YYYY-MM-DD")).format('D') != '1') {
			// add one more tick label entry
			// self.ticklabel.push(m.format("YYYY-MM-DD"))
		    }

		    for(var data_point of self.chartdata[metal]) {
			self.min_gold_price = Math.min(data_point.y,self.min_gold_price)
			self.max_gold_price = Math.max(data_point.y,self.max_gold_price)
		    }
		}  
	    }		
		
	    //var info = { self:self, ourID:self.oucanvas:canvas, data:__$ds}
	    wrapper.appendChild(d)
	    //info.self.drawChart(info.self,info)

	    var info = {
		self:self, ourID:"mymetals_" + self.identifier , data:__$ds, canvas:canvas
	    }
	    if(!self.config.defer) {
		info.self.drawChart(info.self,info)
	    }
	    else {      
		if(this.config.debug)
		    Log.log("will execute defered drawing id=" + this.ourID)        
		setTimeout(()=> {
		info.self.offlineTimer(info)
		}, 
		250)
	    }      
	}

	// pass the created content back to MM to add to DOM.
	return wrapper;
    },
  
    offlineTimer: (info)=> {
	if ((canvas = document.getElementById(info.ourID )) != null ) {
	    info.self.drawChart(info.self,info)
	}
	else
	    setTimeout(()=> {info.self.offlineTimer(info)}, 250)
    },  

    drawChart: (self, info) => {

	var chartOptions= {
	    title: {
//dirk
//                display: true, 
                display: self.config.display_chart_title, 
//end
                text: self.config.chart_title,   

	    },        
            
	    legend: {
		display: false,
                position: 'bottom',    
                textAlign: 'right',  
                labels: {
		    boxWidth: 10,
		}
	    },
            
	    tooltips: {
		enabled: true,
                displayColors: true,
                position: 'nearest',
                intersect: false,
	    },
            
	    responsive: false,
            elements: {
		point: {
		    radius: 0,
                },
		line: {
                  tension: 0, // disables bezier curves
                }
	    },
            scales: {
                xAxes: [{
                    id: 'dates',
                    type: 'time',
                    distribution: 'linear',
                    scaleLabel: {
			display: true,
			labelString: self.config.xAxisLabel,
                    }, 
                    gridLines: {
			display: true,
			zeroLineColor: 'white', // '#ffcc33'
			color: 'grey',
			drawBorder: true, 
			drawOnChartArea: false,
                    },
                    time: {
			unit: 'month',
			//parser: 'YYYY-MM' //'YYYY-MM-DD'
			displayFormats: {
			    month: 'MMM'
			},                      
                    },
                    ticks: {
			display: true,
//dirk
//			maxRotation: 0,
//			minRotation: 0,
			maxRotation: 0,
			minRotation: 0,
//end
			source: 'labels',
			maxTicksLimit: self.ticklabel.length, //10, //self.our_data[this_country].length,
			//maxTicksLimit: 4,
			autoSkip: true, 
                    },
		}],
		
                yAxes: [{
                    display: true,
                    scaleLabel: {
			display: true,
			labelString: self.config.yAxisLabel,
                    },
                    
		    gridLines: {
			display: true,
			zeroLineColor: 'white', // '#ffcc33'   
			color: 'grey',
			drawBorder: true, 
			drawOnChartArea: false,
                    },

                    ticks: {
//dirk
			callback: 
			    function(value, index, values) { 	// Returns the string representation of the tick value as 
				return value + ' €';		//   it should be displayed on the chart. 
			    },
			padding: 5,				// Padding between the tick label and the axis. When set on a 
								//   vertical axis, this applies in the horizontal (X) direction. When set 
								//   on a horizontal axis, this applies in the vertical (Y) direction.
//end
                      //beginAtZero: true,
                      source: 'auto',
// MIN-, MAX- , STEP Y-Axes
                      min: self.min_gold_price - 20, // self.config.ranges.min,
                      suggestedMax: self.max_gold_price + 20, //   self.config.ranges.max,
                      stepSize: 50, //self.config.ranges.stepSize,
		      precision: 0,
                    },
		}]
	    },
	}
	
        // add the font info before draw
        self.updateOptions(self.config, chartOptions)
	
	// create it now
        if(self.config.debug) {
	    Log.log(self.name + " defered  drawing in  getDom()")   
	    Log.log(self.name + " data=" + JSON.stringify(info.data))
        }
	
	//Chart.defaults.global.defaultFontSize = 4     
        self.charts = new Chart(info.canvas, {
            type: 'line',
            showLine: true,
            data: {
		datasets: info.data,
		labels: self.ticklabel,
            },
            
	    options: chartOptions, 
	});

        if(info.self.config.debug)
	    Log.log(self.name + " done defered drawing  getDom()")
    },
    
    updateOptions(config, chartOptions) {
	var defaults = false;
        var defaultFontInfo = {      
	    global:{},
	    //  defaultColor : 'yourColor',
	    //  defaultFontColor : 'yourColor',
	    //  defaultFontFamily : 'yourFont',
	    //  defaultFontSize:14      
        }    

	if(config.defaultColor) {
	    if(defaultFontInfo.global == undefined)
		defaultFontInfo['global'] = {}
	    defaultFontInfo.global['defaultColor'] = config.defaultColor
	    defaults = true
	}
    
	if(config.defaultFontColor) {
	    if(defaultFontInfo.global == undefined)
		defaultFontInfo['global'] = {}
	    defaultFontInfo.global['defaultFontColor'] = config.defaultFontColor
	    defaults = true
	}    
    
	if(config.defaultFontName) {
	    if(defaultFontInfo.global == undefined)
    		defaultFontInfo['global'] = {}    	
	    defaultFontInfo.global['defaultFontFamily'] = config.defaultFontName
	    defaults = true
	}   
    
	if(config.defaultFontSize) {
	    if(defaultFontInfo.global == undefined)
		defaultFontInfo['global'] = {}
	    defaultFontInfo.global['defaultFontSize'] = config.defaultFontSize
	    defaults = true
	}   
    
	if(defaults) {
	    // chartOptions['defaults']= defaultFontInfo
	}

	// chart title
	if(config.titleFontFamily != undefined)
	    chartOptions.title.fontFamily = config.titleFontFamily
	if(config.titleFontSize != undefined)
	    chartOptions.title.fontSize = config.titleFontSize
	if(config.titleFontStyle != undefined)
	    chartOptions.title.fontStyle = config.titleFontStyle
	if(config.chartTitleColor)
	    chartOptions.title.fontColor = config.chartTitleColor

	// chart legend

	if(config.legendFontFamily != undefined)
	    chartOptions.legend.fontFamily = config.legendFontFamily
	if(config.legendFontSize != undefined)
	    chartOptions.legend.fontSize = config.legendFontSize
	if(config.legendFontStyle != undefined)
	    chartOptions.legend.fontStyle = config.legendFontStyle
	if(config.legendTextColor) {
	    var labels = { fontColor: config.legendTextColor}
	    chartOptions.legend['labels'] = Object.assign(chartOptions.legend['labels'],labels)
	}

	// xAxes label

	if(config.xAxisLabelColor != undefined)
	    chartOptions.scales.xAxes[0].scaleLabel.fontColor = config.xAxisLabelColor
	if(config.xAxisLabelFontFamily != undefined)
	    chartOptions.scales.xAxes[0].scaleLabel.fontFamily = config.xAxisLabelFontFamily
	if(config.xAxisLabelFontSize != undefined)
	    chartOptions.scales.xAxes[0].scaleLabel.fontSize = config.xAxisLabelFontSize
	if(config.xAxisLabelFontStyle != undefined)
	    chartOptions.scales.xAxes[0].scaleLabel.fontStyle = config.xAxisLabelFontStyle

	// xAxes ticks

	if(config.xAxisTickLabelColor != undefined)
	    chartOptions.scales.xAxes[0].ticks.fontColor = config.xAxisTickLabelColor
	if(config.xAxisTickLabelFontFamily != undefined)
	    chartOptions.scales.xAxes[0].ticks.fontFamily = config.xAxisTickLabelFontFamily
	if(config.xAxisTickLabelFontSize != undefined)
	    chartOptions.scales.xAxes[0].ticks.fontSize = config.xAxisTickLabelFontSize
	if(config.xAxisTickLabelFontStyle != undefined)
	    chartOptions.scales.xAxes[0].ticks.fontStyle = config.xAxisTickLabelFontStyle

	// yAxes label

	if(config.yAxisLabelColor != undefined)
	    chartOptions.scales.yAxes[0].scaleLabel.fontColor = config.yAxisLabelColor
	if(config.yAxisLabelFontFamily != undefined)
	    chartOptions.scales.yAxes[0].scaleLabel.fontFamily = config.yAxisLabelFontFamily
	if(config.yAxisLabelFontSize != undefined)
	    chartOptions.scales.yAxes[0].scaleLabel.fontSize = config.yAxisLabelFontSize
	if(config.yAxisLabelFontStyle != undefined)
	    chartOptions.scales.yAxes[0].scaleLabel.fontStyle = config.yAxisLabelFontStyle

	//yAxes ticks

	if(config.yAxisTickColor != undefined)
	    chartOptions.scales.yAxes[0].ticks.fontColor = config.yAxisTicklColor
	if(config.yAxisTickFontFamily != undefined)
	    chartOptions.scales.yAxes[0].ticks.fontFamily = config.yAxisTickFontFamily
	if(config.yAxisTickFontSize != undefined)
	    chartOptions.scales.yAxes[0].ticks.fontSize = config.yAxisTickFontSize
	if(config.yAxisTickFontStyle != undefined)
	    chartOptions.scales.yAxes[0].ticks.fontStyle = config.yAxisTickFontStyle

    },

})
