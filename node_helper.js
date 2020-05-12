var NodeHelper = require("node_helper");
	const fs=require('fs')
	const csv=require('csvtojson')
	const moment=require('moment')
	const sqlite3 = require('sqlite3').verbose();
		

// add require of other javascripot components here
// var xxx = require('yyy') here

module.exports = NodeHelper.create({

	csv_header:"date, gold, paladium"+'\n',
	// chars allowed in prices
	regex:/[^0-9.]/g,
	dataFolder:'/data/',

	init(){
		console.log("init module helper SampleModule");
	},

	start() {
		console.log('Starting module helper:' +this.name);
	},

	stop(){
		console.log('Stopping module helper: ' +this.name);
	},

	getfile() {
		    var self=this
			const csvFilePath = this.path + this.dataFolder+this.config.datafile;
			csv()
			.fromFile(csvFilePath)
			.then((jsonObj)=>{      				
				// send data to [modulname].js
				
				var metals={}
				for(var metal of self.config.metals){
					metals[metal]=[]
				}
				var x = 0
				if(jsonObj.length>this.limit){
					if(this.config.debug)
						console.log("reducing "+jsonObj.length +"by "+this.config.limit)
					x = jsonObj.length-this.config.limit;
					if(this.config.debug)					
						console.log("start loop at "+x)	
				}
				var i=0;
				for(i=x; i< jsonObj.length; i++){				
					var row=jsonObj[i];
					for(var metal of self.config.metals){
						if(this.config.debug)
							console.log("row="+JSON.stringify(row) +"  metal="+metal)
						if(row[metal]!=undefined){
							var d = row.datum.split('.')
							d=this.swapSpliceInPlace(d,0,2).join('-')
							metals[metal].push({x:d , y:  parseInt(row[metal])})
							if(this.config.debug)
								console.log(self.name+" point={x:"+row.datum + ",y:" + parseInt(row[metal])+"}");
						}
					}
				}
				if(this.config.debug)
					console.log(this.name + " sending data to module + i="+i)
				self.sendSocketNotification("newdata", metals);
			})	
	},
	swapSpliceInPlace(list, iA, iB){
	  list[iA] = list.splice(iB, 1, list[iA])[0];
	  return list;
	},
	getDbData(){
			var self = this
			if(this.config.debug)
				console.log(this.name+" opening database="+this.path+this.dataFolder+this.config.database)
			var db = new sqlite3.Database(this.path+this.dataFolder+this.config.database,sqlite3.OPEN_ONLY);

			var metals={}
			for(var metal of self.config.metals){
				metals[metal]=[]
			}
			db.serialize(function() {
				 var stmt="select datum,"+self.config.metals.join(',')+ " from edelmetallpreise  order by datum limit "+self.config.limit+" offset ((select count(*) from edelmetallpreise)-"+self.config.limit+")"
				 if(self.config.debug)
				 	console.log("stmt ="+stmt)
				 db.all(stmt,[], (err, rows) => {
				 	if(err){
				 		console.log("error ="+ JSON.stringify(err))
				 	}
				 	else {
						rows.forEach((row) => {
							for(var metal of self.config.metals){
								if(self.config.debug)
									console.log("row="+JSON.stringify(row) +"  metal="+metal)
								if(row[metal]!=undefined){
									metals[metal].push({x:row.datum , y:  parseInt(row[metal])})
									if(self.config.debug)
										console.log(self.name+" point={x:"+row.datum + ",y:" + parseInt(row[metal])+"}");
								}
							}
						})
						if(self.config.debug)
							console.log(self.name+" sending data to module"+JSON.stringify(metals))						 
						self.sendSocketNotification("newdata",metals)						 
					}
			    }); 				 
				db.close();		
			});			
			if(self.config.debug)			
				console.log(self.name+" db data completed")
	},
	// handle messages from our module// each notification indicates a different messages
	// payload is a data structure that is different per message.. up to you to design this
	socketNotificationReceived(notification, payload) {
		if(this.config && this.config.debug)
			console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		// if config message from module
		if (notification === "CONFIG") {
			// save payload config info
			this.config=payload
		}
		// get the csv now
		else if(notification === "get_prices") {
			if(this.config.type=='db')
				this.getDbData()			
			else
				this.getfile()			
		} else if(notification=='abc'){
			// create the csv file if it doesn't exist
			if(!fs.existsSync(this.path + this.dataFolder+this.config.datafile)){
				// create the initial file with header
				fs.writeFile(this.path + this.dataFolder+this.config.datafile,this.csv_header, (error)=>{
	                if(error){
	                	console.log(this.name + " unable to write prices file")
	                }
	            })
			}
		}
	},

});