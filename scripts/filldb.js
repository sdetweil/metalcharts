const fs= require ('fs')
var sqlite3 = require('sqlite3').verbose();
const moment=require('moment')
 
var csv_name="./metalcharts.csv";

var db = new sqlite3.Database('metalcharts.db',sqlite3.OPEN_READWRITE);

//db.run("drop TABLE prices")

db.serialize(function() {
	db.run("CREATE TABLE prices (gold real, paladium real, date date);");
	fs.readFile(csv_name, (err, data) => {
	  if (err) throw err;
	  console.log(data);
	  var lines = (data+'\n').split('\n')
	  for(var i = 1 ; i<lines.length; i++){

	  	  if (lines[i].length>0){
			console.log("inserting from "+lines[i])

			var values=lines[i].split(',')
			var x = values[2].split('.')
			console.log("array="+JSON.stringify(x))
			x.unshift(x.pop())
			x.splice(1,0,x.pop())
			values[2]= x.join('-')
			console.log("date="+JSON.stringify(x)+" d="+values[2]) 
			db.run("INSERT INTO prices (gold, paladium, date) VALUES (?,?,?)",values[0],values[1],values[2])
		 
		/*  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
		      console.log(row.id + ": " + row.info);
		  }); */
			}
		}
		db.close();		
	});
});
 
