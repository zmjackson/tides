import requests

with open('station_ids.txt') as f:
    ids = f.read().splitlines()

metadata = []

print('Gathering metadata... (this will take a while)')
for station_id in ids:
    req = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station={}&product=water_level&datum=STND&units=english&time_zone=gmt&application=ports_screen&format=json'.format(station_id)
    res = requests.get(req).json()
    if 'metadata' in res:
        metadata.append((res['metadata']['id'], res['metadata']['name'], res['metadata']['lat'], res['metadata']['lon']))

print('Writing metadata to file...')
with open('../db/init.sql', 'w') as init_sql:
    init_sql.write(    
"""CREATE DATABASE tides;
USE tides;

CREATE TABLE station_metadata (
    id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    coordinate POINT NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO station_metadata
    (id, name, coordinate)
VALUES
""")

    for station in metadata:
        delimiter = ';' if station == metadata[-1] else ','
        init_sql.write("({}, '{}', ST_GeomFromText('POINT({} {})', 4326)){}\n".format(station[0], station[1].replace("'", "''"), station[2], station[3], delimiter))
