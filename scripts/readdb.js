const fs= require ('fs')
var sqlite3 = require('sqlite3').verbose();
const moment=require('moment')
 

var db = new sqlite3.Database('metalcharts.db',sqlite3.OPEN_ONLY);

var type ="paladium"
var number = 4

db.serialize(function() {
		 var stmt="select date,"+type+" from prices where date > date('now','-"+number+" days') order by date"
		 console.log("stmt ="+stmt)
		 db.each(stmt, function(err, row) {
		 	  //console.log("row="+JSON.stringify(row))
		      console.log("point={x:"+row.date + ",y:" + row[type]+"}");
		 }); 
		db.close();		
});
 
