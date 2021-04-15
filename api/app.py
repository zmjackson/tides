from flask import Flask, request
import json
from flask.globals import current_app
import mysql.connector
from requests import get, Response
import time
from datetime import datetime
from datetime import timedelta
from dateutil.relativedelta import relativedelta
import math

app = Flask(__name__)


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
    return get(req)


def request_basic_range_metadata(
    stationId: str
) -> Response:
    req = "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/" + \
        stationId + "/datums.json?units=english"
    print(req, flush=True)
    return get(req)


@app.route("/station_metadata")
def get_station_metadata():
    cnx = connect_to_db()

    cursor = cnx.cursor()
    query = "SELECT id, name, ST_Latitude(coordinate), ST_Longitude(coordinate) FROM station_metadata"
    cursor.execute(query)

    metadata = []

    for (station_id, name, lat, lon) in cursor:
        metadata.append(
            {"id": station_id, "name": name, "lat": lat, "lon": lon})

    cursor.close()
    cnx.close()

    return json.dumps(metadata)


@app.route("/monthly_ranking")
def get_monthly_ranking():
    id = request.args["id"]
    datum = request.args["datum"]

    most_recent_year = (datetime.today() -
                        relativedelta(years=1)).strftime("%Y")

    res = request_basic_range(
        "19000101",
        most_recent_year + "1231",
        id,
        "monthly_mean",
        datum="STND",
    )

    if res.status_code != 200 or "data" not in res.json():
        return {"error": "NOAA API request failed"}

    json_data = res.json()["data"]

    monthly_rankings = {
        "January": {"highest": [], "lowest": None, "rank": None},
        "February": {"highest": [], "lowest": None, "rank": None},
        "March": {"highest": [], "lowest": None, "rank": None},
        "April": {"highest": [], "lowest": None, "rank": None},
        "May": {"highest": [], "lowest": None, "rank": None},
        "June": {"highest": [], "lowest": None, "rank": None},
        "July": {"highest": [], "lowest": None, "rank": None},
        "August": {"highest": [], "lowest": None, "rank": None},
        "September": {"highest": [], "lowest": None, "rank": None},
        "October": {"highest": [], "lowest": None, "rank": None},
        "November": {"highest": [], "lowest": None, "rank": None},
        "December": {"highest": [], "lowest": None, "rank": None},
    }

    for month_num, month_name in enumerate(monthly_rankings.keys()):
        valid_data_for_this_month = [
            data_point
            for data_point in json_data
            if data_point[datum] and int(data_point["month"]) == month_num + 1
        ]

        s = sorted(
            valid_data_for_this_month, key=lambda data: float(data[datum]), reverse=True
        )

        monthly_rankings[month_name]["highest"] = [data["year"]
                                                   for data in s[0:3]]
        monthly_rankings[month_name]["lowest"] = s[-1]["year"]
        monthly_rankings[month_name]["rank"] = [
            i for i, data in enumerate(s) if data["year"] == most_recent_year
        ][0] + 1

    return monthly_rankings


def get_num_of_req_and_date_range(start_date, end_date):
    number_of_requests = 1
    date_range = 0
    error = False
    # parse through date_range and divide into
    # multiple requests if date range is greater than 31 days
    start_time = datetime.strptime(start_date, "%Y%m%d")
    end_time = datetime.strptime(end_date, "%Y%m%d")
    if start_date == end_date:
        error = True
    elif int(str(end_time - start_time).split(" ")[0]) < 0:
        error = True
    else:
        date_range_string = str(abs(end_time - start_time))

        date_range = int(date_range_string.split(" ")[0])

        if date_range > 31:
            number_of_requests = math.ceil(date_range / 31)

    return number_of_requests, date_range, error


def num_of_req_for_mean_data(start_date, end_date):
    number_of_requests = 1

    start_time = datetime.strptime(start_date, "%Y%m%d")
    end_time = datetime.strptime(end_date, "%Y%m%d")
    date_range_string = str(abs(end_time - start_time))

    number_of_requests = int(date_range_string.split(" ")[0])

    return (number_of_requests * 480)


def update_date_range(number_of_requests, date_range, start_date, end_date):
    if number_of_requests > 1:
        if date_range > 31:
            end_date = (
                datetime.strptime(start_date, "%Y%m%d") + timedelta(days=31)
            ).strftime("%Y%m%d")
            date_range = date_range - 31
        else:
            end_date = (
                datetime.strptime(start_date, "%Y%m%d") +
                timedelta(days=date_range)
            ).strftime("%Y%m%d")
            date_range = 0
    if date_range != 0:
        date_range = date_range - 1

    return date_range, end_date


def get_duration(start_date, end_date):
    start_time = datetime.strptime(start_date, "%Y-%m-%d %H:%M")
    end_time = datetime.strptime(end_date, "%Y-%m-%d %H:%M")
    time_delta = str(abs(end_time - start_time))
    return time_delta


def get_duration_month(start_date, end_date, isEnd):
    month_delta = int(end_date.split("-")[1]) - int(start_date.split("-")[1])
    year_delta = int(end_date.split("-")[0]) - int(start_date.split("-")[0])

    time_delta = month_delta + (year_delta * 12)
    if isEnd:
        time_delta = time_delta + 1
    time_delta_str = str(time_delta) + " month"
    if time_delta > 1:
        time_delta_str = time_delta_str + "s"
    return time_delta_str


def get_average(array):
    sum = 0
    average = 0
    if len(array) == 0:
        return 0

    for values in array:
        sum = sum + float(values)

    average = sum / len(array)
    return average


@app.route("/getFloodLevelData")
def get_flood_level_data():
    start_date = request.args["start_date"]
    end_date = request.args["end_date"]
    station_id = request.args["station_id"]
    flood_level = request.args["floodThreshold"]
    product = request.args["product"]
    datum = request.args["datum"]

    number_of_requests, date_range, error = get_num_of_req_and_date_range(
        start_date, end_date
    )

    if product == "monthly_mean":
        number_of_requests = 1

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
    error_message = []

    if error == False:
        for x in range(number_of_requests):
            if product != "monthly_mean":
                if date_range == 0:
                    break
                else:
                    date_range, end_date = update_date_range(
                        number_of_requests, date_range, start_date, end_date
                    )

            # try:
            resJson = request_basic_range(
                start_date, end_date, station_id, product, datum
            ).json()

            index = 0

            try:
                num_of_datapoints = len(resJson["data"])
                if product == "monthly_mean":
                    for resJson in resJson["data"]:
                        index = index + 1
                        all_water_level_dates.append(
                            resJson["year"] + "-" + resJson["month"]
                        )
                        if resJson["MSL"] == "":
                            missing_water_level_dates.append(
                                resJson["year"] + "-" + resJson["month"]
                            )
                        else:
                            all_flood_levels.append(resJson["MSL"])
                            if float(resJson["MSL"]) >= float(flood_level):
                                if flood_started == False:
                                    flood["start_date"] = (
                                        resJson["year"] + "-" +
                                        resJson["month"]
                                    )
                                    flood_started = True
                                flood_levels.append(resJson["MSL"])

                            if (
                                float(resJson["MSL"]) < float(flood_level)
                                and flood_started
                            ) or (index == num_of_datapoints and flood_started == True):
                                # get end date
                                flood["end_date"] = (
                                    resJson["year"] + "-" + resJson["month"]
                                )

                                end = index == num_of_datapoints
                                flood["duration"] = get_duration_month(
                                    flood["start_date"], flood["end_date"], end
                                )

                                # increment number of floods
                                num_of_floods = num_of_floods + 1

                                flood["average"] = "{:.3f}".format(
                                    get_average(flood_levels)
                                )

                                # Store flood levels
                                flood["flood_levels"] = flood_levels

                                # store flood data
                                flood_collection.append(flood)

                                # reset values
                                flood_levels = []
                                flood = {}
                                flood_started = False
                else:
                    for resJson in resJson["data"]:
                        index = index + 1
                        all_water_level_dates.append(resJson["t"])
                        if resJson["v"] == "":
                            missing_water_level_dates.append(resJson["t"])
                        else:
                            all_flood_levels.append(resJson["v"])
                            if float(resJson["v"]) >= float(flood_level):
                                if flood_started == False:
                                    flood["start_date"] = resJson["t"]
                                    flood_started = True
                                flood_levels.append(resJson["v"])

                            if (
                                float(resJson["v"]) < float(flood_level)
                                and flood_started
                            ) or (
                                index == num_of_datapoints
                                and flood_started == True
                                and x == number_of_requests - 1
                            ):
                                # get end date
                                flood["end_date"] = resJson["t"]

                                flood["duration"] = get_duration(
                                    flood["start_date"], flood["end_date"]
                                )

                                # increment number of floods
                                num_of_floods = num_of_floods + 1

                                flood["average"] = "{:.3f}".format(
                                    get_average(flood_levels)
                                )

                                # Store flood levels
                                flood["flood_levels"] = flood_levels

                                # store flood data
                                flood_collection.append(flood)

                                # reset values
                                flood_levels = []
                                flood = {}
                                flood_started = False
            except KeyError:
                missing_water_level_dates.append(start_date + "-" + end_date)
                if product == "monthly_mean":
                    lastMonth = datetime.today().replace(day=1) - timedelta(days=1)
                    date = lastMonth.strftime("%B %d, %Y")
                    error_message.append(
                        "Monthly means are only available through: "
                        + date
                        + ". Check your date range. If requests are before "
                        + date
                        + ", then data might not be available during the date range provided."
                    )
                else:
                    error_message.append(
                        "Data not available given current date range")

            # update start date to be one past the end date
            start_date = (
                datetime.strptime(end_date, "%Y%m%d") + timedelta(days=1)
            ).strftime("%Y%m%d")

    if error:
        error_message.append("Start date must be after end date")
    # metadata
    metadata["num_of_floods"] = num_of_floods

    # overall average of all water levels
    metadata["overall_average"] = "{:.3f}".format(
        get_average(all_flood_levels))
    metadata["all_water_levels"] = all_flood_levels
    metadata["all_water_level_dates"] = all_water_level_dates
    metadata["missing_water_level_dates"] = missing_water_level_dates
    metadata["error"] = error_message
    # store data in json
    flood_collection_data_json["data"] = flood_collection
    flood_collection_data_json["metadata"] = metadata

    ret = json.dumps(flood_collection_data_json)
    return ret


@app.route("/getPredictions")
def get_predictions():
    start_date = request.args["start_date"]
    end_date = request.args["end_date"]
    station_id = request.args["station_id"]
    datum = request.args["datum"]

    number_of_requests, date_range, error = get_num_of_req_and_date_range(
        start_date, end_date
    )

    prediction_collection_data_json = {}
    data = {}
    all_prediction_levels = []
    all_prediction_level_dates = []
    missing_water_level_dates = []

    for x in range(number_of_requests):
        if date_range == 0:
            break
        else:
            date_range, end_date = update_date_range(
                number_of_requests, date_range, start_date, end_date
            )

        try:
            resJson = request_basic_range(
                start_date, end_date, station_id, "predictions", datum
            ).json()

            index = 0

            try:
                num_of_datapoints = len(resJson["predictions"])

                for resJson in resJson["predictions"]:
                    index = index + 1
                    all_prediction_level_dates.append(resJson["t"])
                    if resJson["v"] == "":
                        missing_water_level_dates.append(resJson["t"])
                    else:
                        all_prediction_levels.append(resJson["v"])
            except KeyError:
                missing_water_level_dates.append(start_date + "-" + end_date)
        except:
            missing_water_level_dates.append(start_date + "-" + end_date)

        # update start date to be one past the end date
        start_date = (
            datetime.strptime(end_date, "%Y%m%d") + timedelta(days=1)
        ).strftime("%Y%m%d")

    data["all_prediction_levels"] = all_prediction_levels
    data["all_prediction_level_dates"] = all_prediction_level_dates
    data["missing_water_level_dates"] = missing_water_level_dates

    prediction_collection_data_json["data"] = data

    ret = json.dumps(prediction_collection_data_json)
    return ret


def get_data_from_noaa_json(resJson, MHHW_Levels, MLLW_Levels, MHW_Levels, MLW_Levels):
    for resJson in resJson["datums"]:
        if(resJson["name"] == "MHHW"):
            MHHW_Levels.append(resJson["value"])
        if(resJson["name"] == "MLLW"):
            MLLW_Levels.append(resJson["value"])
        if(resJson["name"] == "MHW"):
            MHW_Levels.append(resJson["value"])
        if(resJson["name"] == "MLW"):
            MLW_Levels.append(resJson["value"])


@app.route("/getMeanData")
def get_mean_data():
    start_date = request.args["start_date"]
    end_date = request.args["end_date"]
    station_id = request.args["station_id"]
    # product = request.args["product"]

    number_of_requests = num_of_req_for_mean_data(
        start_date, end_date
    )

    mean_collection_data_json = {}
    data = {}
    all_MHHW_levels = []
    # all_MHHW_level_dates = []
    all_MLLW_levels = []
    # all_MLLW_level_dates = []
    all_MHW_levels = []
    # all_MHW_level_dates = []
    all_MLW_levels = []
    all_MLW_level_dates = []
    missing_water_level_dates = []

    resJson = request_basic_range_metadata(station_id).json()

    get_data_from_noaa_json(resJson, all_MHHW_levels,
                            all_MLLW_levels, all_MHW_levels, all_MLW_levels)

    for x in range(number_of_requests - 1):
        all_MHHW_levels.append(all_MHHW_levels[0])
        all_MLLW_levels.append(all_MLLW_levels[0])
        all_MHW_levels.append(all_MHW_levels[0])
        all_MLW_levels.append(all_MLW_levels[0])

    data["all_MHHW_levels"] = all_MHHW_levels
    # data["all_MHHW_level_dates"] = all_MHHW_level_dates
    data["all_MLLW_levels"] = all_MLLW_levels
    # data["all_MLLW_level_dates"] = all_MLLW_level_dates
    data["all_MHW_levels"] = all_MHW_levels
    # data["all_MHW_level_dates"] = all_MHW_level_dates
    data["all_MLW_levels"] = all_MLW_levels
    data["all_MLW_level_dates"] = all_MLW_level_dates
    # data["missing_water_level_dates"] = missing_water_level_dates

    mean_collection_data_json["data"] = data

    ret = json.dumps(mean_collection_data_json)
    return ret
