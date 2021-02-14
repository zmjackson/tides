from flask import Flask
import json
import mysql.connector
import os
import requests
import time
from datetime import datetime

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


@app.route('/getFloodLevelData/<flood_level>/<station_id>/<start_date>/<end_date>')
def get_flood_level_data(flood_level, station_id, start_date, end_date):
    server = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
    start_date = start_date
    end_date = end_date
    station_id = station_id
    product = 'water_level'
    datum = 'STND'
    units = 'english'
    time_zone = 'gmt'
    application = 'uf_tides'
    res_format = 'json'

    req = server + '?' + '&'.join(['begin_date=' + start_date, 'end_date=' + end_date, 'station=' + station_id, 'product=' + product, 'datum=' + datum,
                                   'units=' + units, 'time_zone=' + time_zone, 'application=' + application, 'format=' + res_format])
    print(req, flush=True)

    res = requests.get(req)
    resJson = res.json()
    flood = {}
    flood_levels = []
    flood_collection = []
    flood_collection_data_json = {}
    flood_started = False

    for resJson in resJson['data']:
        if(resJson['v'] >= flood_level):
            if(flood_started == False):
                flood['start_date'] = resJson['t']
            flood_levels.append(resJson['v'])
            flood_started = True
        elif(resJson['v'] < flood_level and flood_started):
            # get end date
            flood['end_date'] = resJson['t']

            # get duration
            start_time = datetime.strptime(flood['start_date'], "%Y-%m-%d %H:%M")
            end_time = datetime.strptime(flood['end_date'], "%Y-%m-%d %H:%M")
            time_delta = str(abs(end_time - start_time))
            flood['duration'] = time_delta

            # get average of flood levels
            sum = 0
            for values in flood_levels:
                sum = sum + float(values)

            average = sum/len(flood_levels)
            flood['average'] = "{:.3f}".format(average)
            
            # Store flood levels
            flood['flood_levels'] = flood_levels

            # store flood data
            flood_collection.append(flood)

            # reset values
            flood_levels = []
            flood = {}
            flood_started = False

    flood_collection_data_json['data'] = flood_collection

    ret = json.dumps(flood_collection_data_json)
    return ret