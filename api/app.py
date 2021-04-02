from flask import Flask
import json
import mysql.connector
import os
import requests
import time
from datetime import datetime
from datetime import timedelta
import math

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
    
    number_of_requests = 1
    # parse through date_range and divide into 
    # multiple requests if date range is greater than 31 days
    start_time = datetime.strptime(start_date, "%Y%m%d")
    end_time = datetime.strptime(end_date, "%Y%m%d")
    date_range_string = str(abs(end_time - start_time))

    date_range = int(date_range_string.split(" ")[0])

    if(date_range > 31):
        number_of_requests = math.ceil(date_range / 31)
        
    flood = {}
    flood_levels = []
    flood_collection = []
    flood_collection_data_json = {}
    flood_started = False
    num_of_floods = 0
    metadata = {}
    all_flood_levels = []
    all_water_level_dates = []

    for x in range(number_of_requests):
        # add 31 days to start date if more than one request
        if(number_of_requests > 1):
            if(date_range > 31):
                end_date = (datetime.strptime(start_date, "%Y%m%d") + timedelta(days=31)).strftime("%Y%m%d")
                date_range = date_range - 31
            else:
                print(date_range)
                if(date_range) == 0:
                    break
                end_date = (datetime.strptime(start_date, "%Y%m%d") + timedelta(days=date_range)).strftime("%Y%m%d")
                date_range = 0
        print(start_date)
        print(end_date)
        req = server + '?' + '&'.join(['begin_date=' + start_date, 'end_date=' + end_date, 'station=' + station_id, 'product=' + product, 'datum=' + datum,
                                   'units=' + units, 'time_zone=' + time_zone, 'application=' + application, 'format=' + res_format])
        print(req, flush=True)
        res = requests.get(req)

        f = open("log.txt", "w")
        f.write(json.dumps(res.json()))
        f.close()
        resJson = res.json()
        index = 0
        # update start date to be one past the end date
        start_date = (datetime.strptime(end_date, "%Y%m%d") + timedelta(days=1)).strftime("%Y%m%d")
        # date range decreased by one bc our start date uses one of the those days
        if(date_range != 0):
            date_range = date_range - 1

        try:
            resJson_length = len(resJson['data'])

            for resJson in resJson['data']:
                if(resJson['v'] == ''):
                    # all_flood_levels.append(0)
                    print("IGNORED")
                    all_water_level_dates.append(resJson['t'])
                    index = (index + 1)
                else:
                    index = (index + 1)
                    all_flood_levels.append(resJson['v'])
                    all_water_level_dates.append(resJson['t'])
                    # print(resJson['v'])
                    if(float(resJson['v']) >= float(flood_level)):
                        if(flood_started == False):
                            flood['start_date'] = resJson['t']
                        flood_levels.append(resJson['v'])
                        flood_started = True
                    if((float(resJson['v']) < float(flood_level) and flood_started) or (index == resJson_length and flood_started == True and x == number_of_requests - 1)):
                        # get end date
                        flood['end_date'] = resJson['t']

                        # get duration
                        start_time = datetime.strptime(flood['start_date'], "%Y-%m-%d %H:%M")
                        end_time = datetime.strptime(flood['end_date'], "%Y-%m-%d %H:%M")
                        time_delta = str(abs(end_time - start_time))
                        flood['duration'] = time_delta

                        # increment number of floods
                        num_of_floods = num_of_floods + 1

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
        except KeyError:
            print("NO DATA AVAILABLE")

    # metadata
    metadata['num_of_floods'] = num_of_floods

    sum = 0
    for values in all_flood_levels:
        sum = sum + float(values)

    average = 0
    if(len(all_flood_levels) > 0):
        average = sum/len(all_flood_levels)

    # overall average of all water levels
    metadata['overall_average'] = "{:.3f}".format(average)
    metadata['all_water_levels'] = all_flood_levels
    metadata['all_water_level_dates'] = all_water_level_dates

    # store data in json
    flood_collection_data_json['data'] = flood_collection
    flood_collection_data_json['metadata'] = metadata

    ret = json.dumps(flood_collection_data_json)
    return ret