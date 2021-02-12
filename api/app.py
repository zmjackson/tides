from flask import Flask
import json
import mysql.connector
import os
import requests
import time

app = Flask(__name__)


@app.route("/time")
def get_current_time():
    return {'time': time.time()}

# https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=8454000&product=water_level&datum=STND&units=english&time_zone=gmt&application=ports_screen&format=json


@app.route('/basic_test')
def coords_test():
    server = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
    date = 'latest'
    station = '8727520'  # Cedar Key
    product = 'water_level'
    datum = 'STND'
    units = 'english'
    time_zone = 'gmt'
    application = 'uf_tides'
    res_format = 'json'

    req = server + '?' + '&'.join(['date=' + date, 'station=' + station, 'product=' + product, 'datum=' + datum,
                                   'units=' + units, 'time_zone=' + time_zone, 'application=' + application, 'format=' + res_format])
    print(req, flush=True)

    res = requests.get(req)
    return res.json()


def connect_to_db():
    config = {
        'user': 'root',
        'password': 'root',
        'host': 'db',
        'port': '3306',
        'database': 'tides'
    }
    return mysql.connector.connect(**config)


@app.route('/station_metadata')
def get_station_metadata():
    cnx = connect_to_db()

    cursor = cnx.cursor()
    query = "SELECT id, name, ST_Latitude(coordinate), ST_Longitude(coordinate) FROM station_metadata"
    cursor.execute(query)

    metadata = []

    for (station_id, name, lat, lon) in cursor:
        metadata.append(
            {'id': station_id, 'name': name, 'lat': lat, 'lon': lon})
            
    cursor.close()
    cnx.close()

    return json.dumps(metadata)
