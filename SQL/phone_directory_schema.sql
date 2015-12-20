CREATE TABLE phone_directory
    (
     `phone_id` int auto_increment, 
     `recipient_name` varchar(255),
     `phone_no` varchar(255),
     `recipient_description` varchar(255),
     `recipient_information_1` varchar(255),
      PRIMARY KEY (phone_id)
    )
    CHARACTER SET utf8 COLLATE utf8_general_ci
    ENGINE = MyISAM;
    