CREATE TABLE voice_message
    (
     `voice_id` int auto_increment, 
     `voice_name` varchar(255),
     `voice_text` varchar(255),
     `voice_file_location` varchar(255),
      PRIMARY KEY (voice_id)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci
    ENGINE = MyISAM;
    
CREATE TABLE voice_delivery
    (
     `delivery_id` int auto_increment, 
     `voice_id` int, 
     `batch_id` int, 
     `recipient_number` varchar(255), 
     `deliver_timestamp` timestamp, 
     `deliver_status` varchar(20),
      PRIMARY KEY (delivery_id)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci
    ENGINE = MyISAM;