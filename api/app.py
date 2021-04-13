from flask import Flask, request
import json
import mysql.connector
from requests import get, Response
import time
from datetime import datetime
from datetime import timedelta
import math
import numpy as np
import string
from typing import Tuple, Optional

app = Flask(__name__)


@app.route("/time")
def get_current_time():
    return {"time": time.time()}


# https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?date=latest&station=8454000&product=water_level&datum=STND&units=english&time_zone=gmt&application=ports_screen&format=json


@app.route("/basic_test")
def coords_test():
    server = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
    date = "latest"
    station = "8727520"  # Cedar Key
    product = "water_level"
    datum = "STND"
    units = "english"
    time_zone = "gmt"
    application = "uf_tides"
    res_format = "json"

    req = (
        server
        + "?"
        + "&".join(
            [
                "date=" + date,
                "station=" + station,
                "product=" + product,
                "datum=" + datum,
                "units=" + units,
                "time_zone=" + time_zone,
                "application=" + application,
                "format=" + res_format,
            ]
        )
    )
    print(req, flush=True)

    res = get(req)
    return res.json()


def connect_to_db():
    config = {
        "user": "root",
        "password": "root",
        "host": "db",
        "port": "3306",
        "database": "tides",
    }
    return mysql.connector.connect(**config)


def request_basic_range(
    begin_date: str,
    end_date: str,
    station_id: str,
    product: str,
    datum: str,
    units="english",
    time_zone="GMT",
    application="UF_Tides_Project",
    res_format="JSON",
) -> Response:
    server = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"
    req = (
        server
        + "?"
        + "&".join(
            [
                "begin_date=" + begin_date,
                "end_date=" + end_date,
                "station=" + station_id,
                "product=" + product,
                "datum=" + datum,
                "units=" + units,
                "time_zone=" + time_zone,
                "application=" + application,
                "format=" + res_format,
            ]
        )
    )
    print(req, flush=True)
    return get(req)


def data_from_response(response: Response):
    json_data = response.json()["data"]

    timestamps = np.zeros(len(json_data), dtype="datetime64[m]")
    levels = np.zeros(len(json_data))
    sigmas = np.zeros(len(json_data))

    for (i, data_point) in enumerate(json_data):
        timestamps[i] = data_point["t"]
        levels[i] = data_point["v"]
        if(data_point["s"] != ''):
            sigmas[i] = data_point["s"]

    return timestamps, levels, sigmas


# def request_extended_range(start: str, end: str, station_id: str):


@app.route("/station_metadata")
def get_station_metadata():
    cnx = connect_to_db()

    cursor = cnx.cursor()
    query = "SELECT id, name, ST_Latitude(coordinate), ST_Longitude(coordinate) FROM station_metadata"
    cursor.execute(query)

    metadata = []

    for (station_id, name, lat, lon) in cursor:
        metadata.append({"id": station_id, "name": name, "lat": lat, "lon": lon})

    cursor.close()
    cnx.close()

    return json.dumps(metadata)


@app.route("/basic_range")
def get_basic_range():
    begin = request.args["begin_date"]
    end = request.args["end_date"]
    id = request.args["station_id"]
    product = request.args["product"]

    res = request_basic_range(begin, end, id, product)

    if res.status_code != 200 or res.status_code == 400 or "data" not in res.json():
        # return res.content, res.status_code, res.headers.items()
        return {"data": {"timestamps": ["0"], "levels": ["0"]}}

    timestamps, levels, _ = data_from_response(res)

    return {
        "data": {
            "timestamps": np.datetime_as_string(timestamps).tolist(),
            "levels": levels.tolist(),
        }
    }


@app.route("/floods")
def get_floods():
    begin = request.args["begin_date"]
    end = request.args["end_date"]
    id = request.args["station_id"]
    product = request.args["product"]
    threshold = request.args["threshold"]

    res = request_basic_range(begin, end, id, product)

    if res.status_code != 200 or res.status_code == 400 or "data" not in res.json():
        # return res.content, res.status_code, res.headers.items()
        return {"data": ["0"]}

    timestamps, levels, _ = data_from_response(res)
    return {
        "data": list(
                np.datetime_as_string(timestamps[np.where(levels > float(threshold))])
                )
    }


def get_num_of_req_and_date_range(start_date, end_date):
    number_of_requests = 1
    # parse through date_range and divide into 
    # multiple requests if date range is greater than 31 days
    start_time = datetime.strptime(start_date, "%Y%m%d")
    end_time = datetime.strptime(end_date, "%Y%m%d")
    date_range_string = str(abs(end_time - start_time))

    date_range = int(date_range_string.split(" ")[0])

    if(date_range > 31):
        number_of_requests = math.ceil(date_range / 31)

    return number_of_requests, date_range


def update_date_range(number_of_requests, date_range, start_date, end_date):
    if(number_of_requests > 1):
            if(date_range > 31):
                end_date = (datetime.strptime(start_date, "%Y%m%d") + timedelta(days=31)).strftime("%Y%m%d")
                date_range = date_range - 31
            else:
                end_date = (datetime.strptime(start_date, "%Y%m%d") + timedelta(days=date_range)).strftime("%Y%m%d")
                date_range = 0
    if(date_range != 0):
        date_range = date_range - 1

    return date_range, end_date 


def get_duration(start_date, end_date):
    start_time = datetime.strptime(start_date, "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(end_date, "%Y-%m-%d %H:%M")
    time_delta = str(abs(end_time - start_time))
    return time_delta


def get_average(array):
    sum = 0
    average = 0
    if len(array) == 0:
        return 0

    for values in array:
        sum = sum + float(values)

    average = sum/len(array)
    return average


@app.route("/getFloodLevelData")
def get_flood_level_data():
    start_date = request.args["start_date"]
    end_date = request.args["end_date"]
    station_id = request.args["station_id"]
    flood_level = request.args["floodThreshold"]
    product = request.args["product"]
    datum = request.args["datum"]
 
    number_of_requests, date_range = get_num_of_req_and_date_range(start_date, end_date)

    flood_started = False
    flood_collection_data_json = {}
    flood = {}
    flood_levels = []
    flood_collection = []
    metadata = {}
    num_of_floods = 0
    all_flood_levels = []
    all_water_level_dates = []
    missing_water_level_dates = []

    for x in range(number_of_requests):
        if(date_range == 0):
            break
        else:
            date_range, end_date = update_date_range(number_of_requests, date_range, start_date, end_date)
        
        try:
            resJson = request_basic_range(start_date, end_date, station_id, product, datum).json()

            index = 0
            
            try:
                num_of_datapoints = len(resJson['data'])

                for resJson in resJson['data']:
                    index = (index + 1)
                    all_water_level_dates.append(resJson['t'])
                    if(resJson['v'] == ''):
                        print("IGNORED")
                        missing_water_level_dates.append(resJson['t'])
                    else:
                        all_flood_levels.append(resJson['v'])
                        if(float(resJson['v']) >= float(flood_level)):
                            if(flood_started == False):
                                flood['start_date'] = resJson['t']
                                flood_started = True
                            flood_levels.append(resJson['v'])
                            
                        if((float(resJson['v']) < float(flood_level) and flood_started) or (index == num_of_datapoints and flood_started == True and x == number_of_requests - 1)):
                            # get end date
                            flood['end_date'] = resJson['t']

                            flood['duration'] = get_duration(flood["start_date"], flood["end_date"])

                            # increment number of floods
                            num_of_floods = num_of_floods + 1

                            flood['average'] = "{:.3f}".format(get_average(flood_levels))
                            
                            # Store flood levels
                            flood['flood_levels'] = flood_levels

                            # store flood data
                            flood_collection.append(flood)

                            # reset values
                            flood_levels = []
                            flood = {}
                            flood_started = False
            except KeyError:
                missing_water_level_dates.append(start_date + "-" +  end_date)
                print("NO DATA AVAILABLE")
        except:
            missing_water_level_dates.append(start_date + "-" + end_date)

        # update start date to be one past the end date 
        start_date = (datetime.strptime(end_date, "%Y%m%d") + timedelta(days=1)).strftime("%Y%m%d")
        
    # metadata
    metadata['num_of_floods'] = num_of_floods

    # overall average of all water levels
    metadata['overall_average'] = "{:.3f}".format(get_average(all_flood_levels))
    metadata['all_water_levels'] = all_flood_levels
    metadata['all_water_level_dates'] = all_water_level_dates
    metadata['missing_water_level_dates'] = missing_water_level_dates
    # store data in json
    flood_collection_data_json['data'] = flood_collection
    flood_collection_data_json['metadata'] = metadata

    ret = json.dumps(flood_collection_data_json)
    return ret

@app.route("/getPredictions")
def get_predictions():
    start_date = request.args["start_date"]
    end_date = request.args["end_date"]
    station_id = request.args["station_id"]
    datum = request.args["datum"]

    number_of_requests, date_range = get_num_of_req_and_date_range(start_date, end_date)

    prediction_collection_data_json = {}
    data = {}
    all_prediction_levels = []
    all_prediction_level_dates = []
    missing_water_level_dates = []

    for x in range(number_of_requests):
        if(date_range == 0):
            break
        else:
            date_range, end_date = update_date_range(number_of_requests, date_range, start_date, end_date)
        
        try:
            resJson = request_basic_range(start_date, end_date, station_id, "predictions", datum).json()

            index = 0
            
            try:
                num_of_datapoints = len(resJson['predictions'])

                for resJson in resJson['predictions']:
                    index = (index + 1)
                    all_prediction_level_dates.append(resJson['t'])
                    if(resJson['v'] == ''):
                        print("IGNORED")
                        missing_water_level_dates.append(resJson['t'])
                    else:
                        all_prediction_levels.append(resJson['v'])
            except KeyError:
                missing_water_level_dates.append(start_date + "-" +  end_date)
                print("NO DATA AVAILABLE")
        except:
            missing_water_level_dates.append(start_date + "-" + end_date)

        # update start date to be one past the end date 
        start_date = (datetime.strptime(end_date, "%Y%m%d") + timedelta(days=1)).strftime("%Y%m%d")
        
    data['all_prediction_levels'] = all_prediction_levels
    data['all_prediction_level_dates'] = all_prediction_level_dates
    data['missing_water_level_dates'] = missing_water_level_dates

    prediction_collection_data_json['data'] = data

    ret = json.dumps(prediction_collection_data_json)
    return ret


def get_data_from_noaa_json(resJson, all_levels, all_level_dates, missing_water_level_dates):
    # all_levels = []
    # all_level_dates = []
    # missing_water_level_dates = []

    for resJson in resJson['data']:
        all_level_dates.append(resJson['t'])
        if(resJson['v'] == ''):
            print("IGNORED")
            missing_water_level_dates.append(resJson['t'])
        else:
            all_levels.append(resJson['v'])

    return all_levels, all_level_dates, missing_water_level_dates


@app.route("/getMeanData")
def get_mean_data():
    start_date = request.args["start_date"]
    end_date = request.args["end_date"]
    station_id = request.args["station_id"]
    product = request.args["product"]

    number_of_requests, date_range = get_num_of_req_and_date_range(start_date, end_date)

    mean_collection_data_json = {}
    data = {}
    all_MHHW_levels = []
    all_MHHW_level_dates = []
    all_MLLW_levels = []
    all_MLLW_level_dates = []
    all_MHW_levels = []
    all_MHW_level_dates = []
    all_MLW_levels = []
    all_MLW_level_dates = []
    missing_water_level_dates = []

    for x in range(number_of_requests):
        if(date_range == 0):
            break
        else:
            date_range, end_date = update_date_range(number_of_requests, date_range, start_date, end_date)
        
        try:
            resJsonMHHW = request_basic_range(start_date, end_date, station_id, product, "MHHW").json()
            resJsonMLLW = request_basic_range(start_date, end_date, station_id, product, "MLLW").json()
            resJsonMLW = request_basic_range(start_date, end_date, station_id, product, "MLW").json()
            resJsonMHW = request_basic_range(start_date, end_date, station_id, product, "MHW").json()

            
            try:
                get_data_from_noaa_json(resJsonMHHW, all_MHHW_levels, all_MHHW_level_dates, missing_water_level_dates)
                get_data_from_noaa_json(resJsonMLLW, all_MLLW_levels, all_MLLW_level_dates, missing_water_level_dates)
                get_data_from_noaa_json(resJsonMHW, all_MHW_levels, all_MHW_level_dates, missing_water_level_dates)
                get_data_from_noaa_json(resJsonMLW, all_MLW_levels, all_MLW_level_dates, missing_water_level_dates)
                
            except KeyError:
                missing_water_level_dates.append(start_date + "-" +  end_date)
                print("NO DATA AVAILABLE")
        except:
            missing_water_level_dates.append(start_date + "-" + end_date)

        # update start date to be one past the end date 
        start_date = (datetime.strptime(end_date, "%Y%m%d") + timedelta(days=1)).strftime("%Y%m%d")
        
    data['all_MHHW_levels'] = all_MHHW_levels
    data['all_MHHW_level_dates'] = all_MHHW_level_dates
    data['all_MLLW_levels'] = all_MLLW_levels
    data['all_MLLW_level_dates'] = all_MLLW_level_dates
    data['all_MHW_levels'] = all_MHW_levels
    data['all_MHW_level_dates'] = all_MHW_level_dates
    data['all_MLW_levels'] = all_MLW_levels
    data['all_MLW_level_dates'] = all_MLW_level_dates
    data['missing_water_level_dates'] = missing_water_level_dates

    mean_collection_data_json['data'] = data

    ret = json.dumps(mean_collection_data_json)
    return ret