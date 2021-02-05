from flask import Flask
from CoopsApi import CoopsApi
import datetime
import time
import requests
import json
import array as arr 

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


@app.route('/getCoordsOfAllStations')
def getCoordsOfAllStations():
    server = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
    date = 'latest'
    product = 'water_level'
    datum = 'STND'
    units = 'english'
    time_zone = 'gmt'
    application = 'uf_tides'
    res_format = 'json'

    station_ids = open("Database/station_ids.txt", "r")
    res_dict_list = []
    
    for station in station_ids:
        req = server + '?' + '&'.join(['date=' + date, 'station=' + station, 'product=' + product, 'datum=' + datum,
                                    'units=' + units, 'time_zone=' + time_zone, 'application=' + application, 'format=' + res_format])
        res = requests.get(req)
        res_json = res.json()
        res_dict_list.append(res_json)
    return json.dumps(res_dict_list)

@app.route('/coopsAPI_getData/<stationID>/<startDate>/<endDate>/<product>')
def coopsAPI_getData(stationID, startDate, endDate, product):
    dateFormat = '%Y-%m-%d'
    startDateFormated = datetime.datetime.strptime(startDate, dateFormat)
    endDateFormated = datetime.datetime.strptime(startDate, dateFormat)
    coopsApi = CoopsApi()
    [output, errors] = coopsApi.get_data(stationID, [startDateFormated, endDateFormated], product)
    print("Errors: " + str(errors))

    lists = output.to_json(orient = 'table')
    
    return json.loads(lists)
    return res.json()