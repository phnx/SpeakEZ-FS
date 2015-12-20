/*

SpeakEZ - Script for Voice Polling - Call Handler
November, 2015

*/

// pre setting
//var file_path = '/home/sharicus/Desktop/outbound_call/files/voice_polling';
var file_path = '/opt/freedomfone/gui/app/webroot/upload/voice_polling';
var sms_url = 'http://karencis-dev.syr.edu/freedomfone/batches/addRemoteBatch';

// delimiter
var argument_delimiter = '|';
var answer_key_delimiter = '-';
var empty_rule_trigger = '-';
var rule_trigger_delimiter = '=';

// arguments
var poll_id = argv[0];
var recipient_no = argv[1];
var total_question = argv[2];
var answer_key = argv[3].split(argument_delimiter);
var rule_trigger= argv[4];

// database connection establising
use("ODBC");
// http protocal request
use('CURL');

// DSN and credentials
var db = new ODBC("freeswitch", "root", "Karen753CIS");
db.connect();
db.query('use freedomfone');

var continue_question = false;
var current_question = 0;
var current_question_index = 0;

var rule_requirement_met = true;
var hangup_threshold = 3 // repeating one question as many, before hanging up

// validate input against given range
// verify rule_trigger in parallel, if applicable
function validateInput(key, range) {
    var range = range.split(answer_key_delimiter);
    var start = range[0];
    var end = range[1];

    console_log('notice', 'start '+ start +' end '+end +' key '+key+'\n');

    if(key<=end && key >= start) {
        console_log('notice', 'answer validation successful\n');
        return true;
    } else {
        console_log('notice', 'answer validation failed\n');
        return false;
    }
}

// one-way CURL function 
function curlCallback(string) {
  console_log("info", string);
  return true;
}

// getting input from DTMF
function onInput( session, type, data, arg ) {
    if ( type == "dtmf" ) {
        //getting a key press - whatever the key is
        console_log( "info", "Got digit " + data.digit + '\n' );
        console_log( "info", "validate against " + answer_key[current_question_index] + '\n');
        
        if(validateInput(data.digit, answer_key[current_question_index])) {
            var sql = 'INSERT INTO  poll_response (poll_id, recipient_no, question_id, answer_key) VALUES ('+poll_id+', '+recipient_no+','+(current_question)+','+data.digit+')';
            db.query(sql);
    
            //flag to continue to next question
            continue_question = true;

            //verify input for rule_trigger
            if(rule_requirement_met) {
                console_log('info', 'rule verify '+ rule_trigger[current_question_index] +' against input '+data.digit+'\n');
                if(rule_trigger[current_question_index] != '-' && data.digit != rule_trigger[current_question_index]) {
                    rule_requirement_met = false;
                    console_log('info', 'rule false, no longer verify\n');
                }
            }

        } else {
            continue_question = false;
        }
    }
    return false;
}

console_log('warning', 'call handler activated ' + recipient_no + '\n');

session.answer();

//rule trigger prep
// skip requirement check if empty rule
if(rule_trigger == '-') {
    rule_requirement_met = false;
} else {
    rule_trigger = rule_trigger.split(argument_delimiter);
}

while ( session.ready( ) ) {
    var repeating_count = 0;

    for ( i = 0; i < total_question; i++) {
        //reset question flag
        continue_question = false;
        current_question = i+1;
        current_question_index = i;
        console_log('info', 'current question '+current_question+'\n');

        repeating_count = 0;
        while(session.ready() && continue_question == false) {
            console_log('notice', current_question + ' file playing\n');
            //no answer needed
            if (answer_key[current_question_index] != '-') {
                session.streamFile(file_path+'/'+poll_id+'/question_'+current_question+'.wav', onInput);
            } else {
                session.streamFile(file_path+'/'+poll_id+'/question_'+current_question+'.wav');
                continue_question = true;
            }
            repeating_count++;

            if(repeating_count == hangup_threshold) {
                session.hangup();
                i = total_question; // break loop
                break;
            }
        }

    }

    //reached last question -> mark delivered
    if(current_question == total_question){
        // end call
        session.hangup();
        var sql = 'INSERT INTO  poll_delivery (poll_id, batch_id, recipient_number, deliver_status) VALUES ('+poll_id+', 0, "'+recipient_no+'", "deliveried")';
        db.query(sql);

        //also verify rule requirement
        if(rule_requirement_met) {
            console_log('warning', 'rule base requirement met - sending SMS\n');
            var curl = new CURL();
            curl.run("POST", sms_url, 'poll_id='+poll_id+'&recipient='+recipient_no, curlCallback);

        }

    } else {
        var sql = 'INSERT INTO  poll_delivery (poll_id, batch_id, recipient_number, deliver_status) VALUES ('+poll_id+', 0, "'+recipient_no+'", "not delivered")';
        db.query(sql);
    }

    

    console_log('warning', 'call ended ' + sql + '\n');
    



}




