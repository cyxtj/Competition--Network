# coding=utf-8
from flask import Flask, render_template, request
from flask.ext.bootstrap import Bootstrap
import numpy as np
import scipy.stats as stats
import pandas as pd
import json


app = Flask(__name__)
bootstrap = Bootstrap(app)

from load_data import *

@app.route('/')
def index():
    return render_template('index.html', heads=t.columns, table=t.values, sector23 = sector23_dict, features=sector_week_index.columns)

@app.route('/all')
def all_sectors():
    return render_template('explore_all_sector.html', heads=t.columns, table=t.values, sector23 = sector23_dict, features=sector_week_index.columns)


@app.route('/one')
def one_sector():
    return render_template('explore_one_sector.html', heads=t.columns, table=t.values, sector23 = sector23_dict, features=sector_week_index.columns)

@app.route('/get_option_all_sector')
def get_option_all_sector():
    print '-------------get_option_all_sector-----------------'
    print request.args.to_dict()
    print '---------------------------------------------------'
    xfeature = request.args['xfeature']
    yfeature = request.args['yfeature']
    opt = dict()
    opt['main_series'] = {}
    opt['corr_series'] = []
    opt['y_increase'] = {}
    for j, sectorid in enumerate(sectors):
        one_sector = grouped.get_group(sectorid)[[xfeature, yfeature, 'SECTOR', 'WEEK']]
        opt['main_series'][str(sectorid)] = one_sector.values.tolist()
        yi = increase(one_sector.iloc[:, 1])
        opt['y_increase'][str(sectorid)] = yi
        r, p = stats.pearsonr(one_sector.iloc[:, 0], one_sector.iloc[:, 1])
        opt['corr_series'].append([sectorid, round(r, 3), round(p, 4), yi])

    opt['corr_cdf'] = corr_cdf(opt['corr_series'])
    opt['xfeature'] = xfeature
    opt['yfeature'] = yfeature
    opt['legend'] = [str(i) for i in sectors]
    opt['title'] = ''
    return json.dumps(opt)

@app.route('/get_option')
def get_option():
    print '------------get_option one sector------------------'
    print request.args.to_dict()
    print '---------------------------------------------------'
    xfeature = request.args['xfeature']
    yfeature = request.args['yfeature']
    sectorid = int(request.args['sectorid'])
    idx = sector_week_index.SECTOR == sectorid
    d = sector_week_index[idx]
    opt = dict()
    main_series = d[[xfeature, yfeature, 'WEEK', 'week_start_date', 'week_end_date']].values.tolist()
    opt['xfeature'] = xfeature
    opt['yfeature'] = xfeature
    opt['main_series'] = main_series
    opt['legend'] = [sectorid]
    opt['title'] = 'Sector %i'%sectorid
    opt['subtitle'] = 'Subsectors: %s'%sector23_dict[sectorid]
    return json.dumps(opt)

def option_dict():
    pass

def increase(x):
    a = range(x.shape[0])
    r, p = stats.pearsonr(a, x)
    return r

def corr_cdf(corr_series):
    a = np.array(corr_series)
    corr = a[:, 1]
    n = corr.shape[0]
    corr.sort()
    cdf = []    # cdf: [ [probability, frequency], ...]
    pre = -1.1
    cdf.append([corr[0], 1./n])
    for i in range(1, n):
        if corr[i] >=0:
            break
        if cdf[-1][0] != corr[i]:
            cdf.append([corr[i], 1./n + cdf[-1][1]])
        else:
            cdf[-1][1] += 1./n
    cdf2 = []
    cdf2.append([corr[-1], 1./n])
    for i in range(1, n):
        if corr[-i] < 0:
            break
        if cdf2[-1][0] != corr[-i]:
            cdf2.append([corr[-i], 1./n + cdf2[-1][1]])
        else:
            cdf2[-1][1] += 1./n
    cdf2.reverse()
    cdf.extend(cdf2)
    return cdf




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
