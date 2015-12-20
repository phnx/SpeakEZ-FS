/*

SpeakEZ - Script for Voice Pushing - Call Handler
November, 2015

*/

// pre setting
//var file_path = '/home/sharicus/Desktop/outbound_call/files/voice_push';
var file_path = '/opt/freedomfone/gui/app/webroot/upload/voice_push';
var repeating_times = 2;
var repeating_key = 1;
var repeating_flag = true;	//true only for first loop
var ask_for_repeating_times = 2;
var ask_for_repeating_count = 0;

// arguments
var voice_id = argv[0];
var recipient_no = argv[1];

// uncomment when database is accessible

// database connection establising
use("ODBC");
// DSN and credentials
var db = new ODBC("freeswitch", "root", "Karen753CIS");
db.connect();
db.query('use freedomfone');

      
//var sql = 'INSERT INTO  poll_response (poll_id, recipient_no, question_id, answer_key) VALUES ('+poll_id+', '+recipient_no+','+current_question+','+data.digit+')';
//db.query(sql);

// getting input from DTMF
function repeatOrHangup( session, type, data, arg ) {
    if ( type == "dtmf" ) {
        //getting a key press - whatever the key is
        console_log( "info", "Got digit " + data.digit + '\n' );
        if (data.digit == repeating_key) {
        	repeating_flag = true;
        } else {
        	repeating_flag = false;
        }
       
    }
    return false;
}

// play message and repeat until reaching assigned times
function messageLoop() {
	for(i=0;i<repeating_times;i++) {
		session.streamFile(file_path+'/'+voice_id+'/voice_'+voice_id+'.wav');
	    console_log('notice', 'file played '+i+'\n');
	}
}


function askForRepeat() {
	ask_for_repeating_count = 0;

	repeating_flag = false;
	while(ask_for_repeating_count < ask_for_repeating_times) {
		session.streamFile(file_path+'/repeating_question.wav', repeatOrHangup);
		if(repeating_flag) {
			// back to main loop
			return true;
		}
		ask_for_repeating_count = ask_for_repeating_count + 1;
	}

	// exit condition
	if (ask_for_repeating_count == ask_for_repeating_times) {
		repeating_flag = false;
	}

}

console_log('warning', 'call handler activated ' + recipient_no + '\n');

session.answer();
while ( session.ready( ) ) {
    
    if ( session.ready( ) ) {
    	while(repeating_flag) {
			messageLoop();
			askForRepeat();
		}

        session.hangup();

    }

    var sql = 'INSERT INTO  voice_delivery (voice_id, batch_id, recipient_number, deliver_status) VALUES ('+voice_id+', 0, "'+recipient_no+'", "deliveried")';
	db.query(sql);

	console_log('warning', 'call ended ' + sql + '\n');

}




