from flask import Flask
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
    # station = '8727520'  # Cedar Key
    product = 'water_level'
    datum = 'STND'
    units = 'english'
    time_zone = 'gmt'
    application = 'uf_tides'
    res_format = 'json'

    stationIds = open("Database/station_ids.txt", "r")
    resDictList = []
    
    for x in stationIds:
        print(x)
        station = x
        req = server + '?' + '&'.join(['date=' + date, 'station=' + station, 'product=' + product, 'datum=' + datum,
                                    'units=' + units, 'time_zone=' + time_zone, 'application=' + application, 'format=' + res_format])
        res = requests.get(req)
        resJson = res.json()
        resDictList.append(resJson)
    return json.dumps(resDictList)