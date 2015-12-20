/*

SpeakEZ - Script for Voice Polling - Call Dispatcher
November, 2015

*/

// pre setting
var script_path = '/home/sharicus/Desktop/outbound_call/scripts/voice_polling';
var call_string_pre = 'originate {ignore_early_media=true,origination_caller_id_number=+13152165258}';
var arg = argv;

// database connection establising
use("ODBC");
var db = new ODBC("freeswitch", "root", "Karen753CIS");
db.connect();
db.query('use freedomfone');

/*
argv0 -> response_id|poll_id|total_question e.g. 300|2|3
argv1 -> recipient_no1|recipient_no2|recipient_no3|… e.g. 3153807451|3154938465|9874836251
argv2 -> answer_key e.g. 1-2|1-3|1-5

// to test on fs_cli
jsrun //home/sharicus/Desktop/scripts_active/call_dispatcher.js 300|2|3 13153807451|16504894546|14154758378 1-2|1-3|1-5
*/

// delimiter
var argument_delimiter = '|';

//system gateway
var gateway ='sofia/gateway/Twilio-outbound';

// initiate global arguments
var response_id = 0;
var total_question = 0;
var poll_id = 0;
var recipient_no = [];
var answer_key = [];
var validataion_flag = false;
var call_delay_interval = 5000;
var rule_trigger = '-';

// split and validate given input
function argument_validate(raw_input) {
	
	if(raw_input.length == 3){
		//arg 1
		var data = raw_input[0].split(argument_delimiter);
		if(data.length==3) {
			response_id = data[0];
			poll_id = data[1];
			total_question = data[2];
		} else {
			//invalid argument length
			console_log(data);
			return false;
		}

		data = raw_input[1].split(argument_delimiter);
		if(data.length != 0) {
			recipient_no = data;
		} else {
			//no recipient
			console_log(data);
			return false;
		}

		data = raw_input[2].split(argument_delimiter);
		if(data.length == total_question) {
			answer_key = raw_input[2];
		} else {
			//answer key not aligned with question
			console_log(data);
			return false;
		}

		validataion_flag = true;

	}

}

// generate string for call origination
function format_call(rcpt_no) {
	//tweak caller_id/call_handler here	
	var call_handler = ' \'&javascript('+script_path+'/call_handler.js '+ poll_id + ' ' + recipient_no[rcpt_no]+' '+ total_question +' '+answer_key+' '+rule_trigger+')\'';
	var call_string = call_string_pre + gateway + '/' + recipient_no[rcpt_no];
	console_log('info', call_string + call_handler+'\n');

	return call_string + call_handler;
}


// pre operation
argument_validate(arg);

// operation
if(validataion_flag) {
	console_log('info', 'successfully parse input arguments\n')
	
	//lookup poll_rule to get trigger conditions and results
	var sql = 'select * from poll_rule where poll_id='+poll_id;
	var row;

	db.query(sql);
	//must be only one row, if applicable
	while (db.nextRow()) {
	    row = db.getData();
	  	rule_trigger = row['rule_trigger'];
	    //console_log("notice", rule_trigger+ "\n");
	}

	/*
	console_log('notice', response_id +'\n');
	console_log('notice', total_question +'\n');
	console_log('notice', poll_id +'\n');
	console_log('notice', recipient_no +'\n');
	console_log('notice', answer_key +'\n');
	console_log('notice', rule_trigger +'\n');
	*/

	//main loop to delegate call to handler
	for (i = 0; i < recipient_no.length; i++) {
		apiExecute('bgapi', format_call(i));

		//delay between call
		msleep(call_delay_interval);
		console_log('warning', 'init next call\n');
	}


} else {
	// create log - tbd
	console_log('validation failed\n')
}

