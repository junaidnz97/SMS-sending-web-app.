var express=require("express");
var app=express();
var bodyParser = require('body-parser');
var fs=require("fs");
var schedule = require('node-schedule');
var urlencodedParser = bodyParser.urlencoded({ extended: false })


app.use("/public",express.static("public"));   //For giving access to static files
app.set("view engine","ejs");				   //For setting up the view engine


var number=fs.readFileSync("other_files/number.txt","utf8");	//Reading phone number from the file

var server=app.listen("9090",function(){						//Connecting to the server

	console.log("server running successfully");
});

app.get("/",function(req,res){									//Loading the main page


	fs.readFile("other_files/number.txt","utf8",function(err,data){

		if(err)
			err;
		number=data;
		res.render("main_page",{data:data});			//Passing phone number as data

	});
});


app.post("/successfull",urlencodedParser,function(req,res){		//Loading change number link

	number=req.body.number;
	fs.writeFileSync("other_files/number.txt",number);			//Writing the new number to the file
	res.redirect("/");											//Redirecting to the main page

});


app.get("/error_log",function(req,res){							//Loading error log page

	var file=fs.readFileSync('other_files/error_messages.txt',"utf8");	//Reading error messages from file

	file=file.split("\n");									//Formating the data

	var index = file.indexOf("");
	
	if(index>-1)
	{
		    file.splice(index, 1);
	}

	for(var i=0;i<file.length;i++)
	{

		file[i]=file[i].split("|");
		
	}

	
	var file2=fs.readFileSync('other_files/time.txt',"utf8");	//Reading time data from the file
	res.render("error_log",{data:file,data2:file2});			//Passing required data to error log page

});


const accountSid = '';		//Set your accountSid
const authToken = '';			//Set to your token_id
const client = require('twilio')(accountSid, authToken);


function retry(x)											//Recursive function for sending messages
{
if(x>0)														//Trying to sent messages till x becomes 0
{
	client.messages
	.create({
    			to:number,
    			from: '',
    			body: 'Your name is john',
    			provideFeedback: 'true',
  			})
	.then(function(message){
	
	return x;												//Returning if message is successfully sent

	})
	.catch(function(err){
	
		fs.appendFile('other_files/error_messages.txt', err.message+"|"+new Date+"\n", function (err) {
  		
  			if (err) throw err;
  		
  			console.log('Saved!');
	
		});

		retry(x-1);											//Calling function again if error occurs by reducing x by 1
	});

}

}


//Sheduling the message

var rule = new schedule.RecurrenceRule();         
rule.hour=[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];//sheduling in such a way that he wont get messages while sleeping
rule.minute=0;


var j = schedule.scheduleJob(rule, function(firedate){
  console.log(firedate);
  
  var file=fs.readFileSync('other_files/time.txt',"utf8");	//Reading from timefile for incrementing
  file=parseInt(file)+1;
  console.log(file);
  retry(5);													//Calling retry function for x=5


  fs.writeFile('other_files/time.txt',file,function(err){	//Writing incremented time to file

  	if(err)
  		throw err;
  });


});
