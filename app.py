from flask import Flask, render_template, redirect, url_for, jsonify, request
from flask_pymongo import PyMongo
from flask_cors import CORS
# import updatedb

app = Flask(__name__)
CORS(app)

app.config["DEBUG"] = True

# sets up end point
app.config["MONGO_URI"] = "mongodb://localhost:27017/WDI_db"
mongo = PyMongo(app)
wdi_db = mongo.db.data


@app.route("/")
def index():
    return render_template("index.html")

# Explains how to use api


@app.route("/api/v1/home")
def apiHome():
    return render_template("api.html")

# Actual data


@app.route("/api/v1/data", methods=['GET'])
def serveData():
    return jsonify(list(wdi_db.find({}, {'_id': 0})))


@app.route("/api/v1/bar", methods=['GET'])
def serveDataBar():
    return jsonify(list(wdi_db.find({}, {'_id': 0})))


if __name__ == "__main__":
    app.run(debug=True)
