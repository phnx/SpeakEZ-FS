/*

SpeakEZ - Script for Voice Pushing - Call Dispatcher
November, 2015

*/

// pre setting
var script_path = '/home/sharicus/Desktop/outbound_call/scripts/voice_push';
var call_string_pre = "originate {ignore_early_media=true,origination_caller_id_name=SpeakEZ,origination_caller_id_number=+13152165258}";
var arg = argv;

/*
argv0 -> voice_id e.g. 20
argv1 -> recipient_no1|recipient_no2|recipient_no3|… e.g. 3153807451|3154938465|9874836251

// to test on fs_cli
jsrun //home/sharicus/Desktop/scripts_active/call_dispatcher.js 20 13153807451|16504894546|14154758378
*/

// delimiter
var argument_delimiter = '|';
//system gateway
var gateway ='sofia/gateway/Twilio-outbound';
// initiate global arguments
var voice_id = 0;
var recipient_no = [];
var validataion_flag = false;
var call_delay_interval = 5000;

// split and validate given input
function argument_validate(raw_input) {
	
	if(raw_input.length == 2){
		//arg 1
		var data = raw_input[0];
		if(parseInt(data)) {
			voice_id = data[0];
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

		validataion_flag = true;

	}

}

// generate string for call origination
function format_call(rcpt_no) {
	//tweak caller_id/call_handler here	
	var call_handler = ' \'&javascript('+script_path+'/call_handler.js '+ voice_id + ' ' + recipient_no[rcpt_no]+')\'';
	var call_string = call_string_pre + gateway + '/' + recipient_no[rcpt_no];
	console_log('info', call_string + call_handler+'\n');

	return call_string + call_handler;
}


// pre operation
argument_validate(arg);

// operation
if(validataion_flag) {
	console_log('info', 'successfully parse input arguments\n')
	
	/*
	console_log('notice', response_id +'\n');
	console_log('notice', total_question +'\n');
	console_log('notice', poll_id +'\n');
	console_log('notice', recipient_no +'\n');
	console_log('notice', answer_key +'\n');
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

