 CREATE DATABASE manager;

CREATE TABLE clusters (
  id int  NOT NULL AUTO_INCREMENT,
  name varchar(500) UNIQUE,
  queue varchar(255) UNIQUE,
  status int DEFAULT 0,
  start_on BIGINT,
  stop_on BIGINT,
  PRIMARY KEY (id)
);

 //  -2 = Error; -1 = Booting; 0 = Free; 1 = Occupied;

CREATE TABLE nodes (
 id int  NOT NULL AUTO_INCREMENT,
 hostname varchar(500) UNIQUE,
 cluster varchar(500) UNIQUE,
 start_on BIGINT,
 last_ping BIGINT,
 PRIMARY KEY (id)
);

CREATE TABLE jobs (
 id int  NOT NULL AUTO_INCREMENT,
 anchor varchar(500) UNIQUE,
 case_name varchar(500),
 source varchar(500),
 submitted_on BIGINT,
 state int DEFAULT 0,
 cluster varchar(500),
 queue varchar(255),
 assigned_on BIGINT,
 finished_on BIGINT,
 total_files BIGINT,
 unprocessed_files BIGINT,
  PRIMARY KEY (id)
);

// 0 = submitted; 1 = processing; 2 = finished; -1 = error
 // eventually move to Redis
 // source path
 // case name
  // Flake ID