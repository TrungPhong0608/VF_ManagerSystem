CREATE DATABASE webapp;

USE webapp;

-- Create IssueList table
DROP TABLE IF EXISTS IssueList;
CREATE TABLE IssueList (
    id INT(10) NOT NULL AUTO_INCREMENT,
    vehicleMarket VARCHAR(10),
    vin VARCHAR(10),
    co_drive VARCHAR(10),
    tagDate DATE,
    currentSW VARCHAR(10),
    severity VARCHAR(10),
    timestamp VARCHAR(10),
    feature VARCHAR(10),
    des VARCHAR(500),
    featureCategory VARCHAR(20),
    rawName VARCHAR(200),
    pic VARCHAR(20),
    daDate DATE,
    daResult VARCHAR(10),
    issueNo VARCHAR(10),
    note VARCHAR(500),
    km VARCHAR(10),
    PRIMARY KEY (id)
);

-- Create StatisticalData table
DROP TABLE IF EXISTS StatisticalData;
CREATE TABLE StatisticalData (
    id INT(10) NOT NULL AUTO_INCREMENT,
    currentFRS VARCHAR(10),
    feature VARCHAR(10),
    issueNo VARCHAR(20),
    originFRS VARCHAR(20),
    issueOwner VARCHAR(20),
    severity VARCHAR(20),
    occurence VARCHAR(20),
    issueDescription VARCHAR(500),
    assessment VARCHAR(20),
    PRIMARY KEY (id)
);