CREATE DATABASE tides;
USE tides;

CREATE TABLE station_metadata (
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    coordinate POINT NOT NULL,
    PRIMARY KEY (id)
);

LOAD DATA LOCAL INFILE '/app/db/station_metadata.csv'
INTO TABLE station_metadata
FIELDS TERMINATED BY ':'
LINES TERMINATED BY '\n'
(id, name, @lat, @lon)
SET coordinate = POINT(@lat, @lon);
