CREATE TABLE poll_group
    (
     `poll_id` int auto_increment, 
     `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
     `date_modified` timestamp, 
     `number_of_question` int, 
     `poll_name` varchar(255),
      PRIMARY KEY (poll_id)
    )   
CHARACTER SET utf8 COLLATE utf8_general_ci
ENGINE = MyISAM;

CREATE TABLE poll_question
    (
     `poll_id` int, 
     `question_id` int, 
     `question_text` varchar(255), 
     `available_choice` varchar(255), 
     `question_file_location` varchar(255),
      PRIMARY KEY (poll_id, question_id)
    )   
CHARACTER SET utf8 COLLATE utf8_general_ci
ENGINE = MyISAM;
    
CREATE TABLE poll_delivery
    (
     `delivery_id` int auto_increment, 
     `poll_id` int, 
     `batch_id` int, 
     `recipient_number` varchar(255), 
     `deliver_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
     `deliver_status` varchar(20),
      PRIMARY KEY (delivery_id)
    )   
CHARACTER SET utf8 COLLATE utf8_general_ci
ENGINE = MyISAM;
    
CREATE TABLE poll_response
    (
     `response_id` int auto_increment, 
     `poll_id` int, 
     `question_id` int, 
     `recipient_no` varchar(30), 
     `answer_key` varchar(20),
     `response_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (response_id)
    )   
CHARACTER SET utf8 COLLATE utf8_general_ci
ENGINE = MyISAM;

CREATE TABLE poll_rule
    (
     `rule_id` int auto_increment, 
     `poll_id` int, 
     `rule_trigger` varchar(255),
     `action_taken` text, 
      PRIMARY KEY (rule_id)
    )   
CHARACTER SET utf8 COLLATE utf8_general_ci
ENGINE = MyISAM;