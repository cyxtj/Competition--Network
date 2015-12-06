# coding=utf-8

from flask import Flask, render_template, request
from flask.ext.bootstrap import Bootstrap
import pandas as pd
import json


app = Flask(__name__)
bootstrap = Bootstrap(app)

t = pd.read_excel('index-each-sector.xls', 'Sheet1')
t.SECTOR = t.SECTOR.astype(int)
for col in t.columns[2:]:
    t[col] = t[col].round(2)

sector_week_index = pd.read_excel('index-each-sector-week.xlsx', 'Sheet1')
sector_week_index['HHI'] = sector_week_index['HHI'].round(2)
sector_week_index['CPC'] = sector_week_index['CPC'].round(2)

sector2_3 = pd.read_excel('sector23.xlsx', 'Sheet1')
sector23_dict = {i[1][0]: i[1][1] for i in sector2_3.iterrows()}

@app.route('/')
def index():
    global t
    return render_template('index.html', heads=t.columns, table=t.values, sector23 = sector23_dict, features=sector_week_index.columns)

@app.route('/get_option')
def get_option():
    global t
    print '------------------------------'
    print request.args
    print request.args.to_dict()
    print request.args['xfeature']
    print type(request.args)
    print '------------------------------'
    xfeature = request.args['xfeature']
    yfeature = request.args['yfeature']
    sectorid = int(request.args['sectorid'])
    idx = sector_week_index.SECTOR == sectorid
    d = sector_week_index[idx]
    opt = dict()
    main_series = d[[xfeature, yfeature, 'WEEK']].values.tolist()
    opt['xfeature'] = xfeature
    opt['yfeature'] = xfeature
    opt['main_series'] = main_series
    opt['legends'] = [sectorid]
    opt['title'] = 'Sector %i'%sectorid
    opt['subtitle'] = 'Subsectors: %s'%sector23_dict[sectorid]
    return json.dumps(opt)

def option_dict():
    pass


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
