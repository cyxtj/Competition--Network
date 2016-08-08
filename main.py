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
    return render_template('index.html')

@app.route('/all/<name>')
def all_sectors(name):
    sector_info_table   = D[name]['sector_info_table']  
    sector_week_index   = D[name]['sector_week_index'] 
    sector23_dict       = D[name]['sector23_dict']     
    sectoridname_dict   = D[name]['sectoridname_dict'] 
    grouped             = D[name]['grouped']           
    sectors             = D[name]['sectors']            
    return render_template('explore_all_sector.html', 
            usertype=name,
            features=sector_week_index.columns, feature_desc=feature_desc)


@app.route('/one/<name>')
def one_sector(name):
    sector_info_table   = D[name]['sector_info_table']  
    sector_week_index   = D[name]['sector_week_index'] 
    sector23_dict       = D[name]['sector23_dict']     
    sectoridname_dict   = D[name]['sectoridname_dict'] 
    grouped             = D[name]['grouped']           
    sectors             = D[name]['sectors']            
    return render_template('explore_one_sector.html', 
            usertype=name,
            heads=sector_info_table.columns, table=sector_info_table.values, sector23 = sector23_dict, 
            features=sector_week_index.columns, feature_desc=feature_desc)

@app.route('/get_option_all_sector/<name>')
def get_option_all_sector(name):
    sector_info_table   = D[name]['sector_info_table']  
    sector_week_index   = D[name]['sector_week_index'] 
    sector23_dict       = D[name]['sector23_dict']     
    sectoridname_dict   = D[name]['sectoridname_dict'] 
    grouped             = D[name]['grouped']           
    sectors             = D[name]['sectors']            
    print '-------------get_option_all_sector-----------------'
    print request.args.to_dict()
    print '---------------------------------------------------'
    xfeature = request.args['xfeature']
    yfeature = request.args['yfeature']
    opt = dict()
    opt['main_series'] = {}
    opt['corr_series'] = []
    opt['y_increase'] = {}
    opt['coef_series'] = []
    for j, sectorid in enumerate(sectors):
        one_sector = grouped.get_group(sectorid)[[xfeature, yfeature, 'SECTOR', 'WEEK']]
        opt['main_series'][str(sectorid)] = one_sector.values.tolist()
        y_increase, p = mypearsonr(one_sector.iloc[:, 1], np.arange(one_sector.shape[0]))
        opt['y_increase'][str(sectorid)] = round(y_increase, 4)
        r, p = mypearsonr(one_sector.iloc[:, 0], one_sector.iloc[:, 1])
        opt['corr_series'].append([sectorid, round(r, 3), round(p, 4), y_increase])
        a, b = my_ls_regression(one_sector.iloc[:, 0], one_sector.iloc[:, 1])
        opt['coef_series'].append( [sectorid, a, abs(r)] )


    opt['coef_median'] = np.median(np.array(opt['coef_series'])[:, 1])
    opt['corr_cdf'] = corr_cdf(opt['corr_series'])
    opt['sector_23_dict'] = sector23_dict
    opt['sector_idname_dict'] = sectoridname_dict
    opt['xfeature'] = xfeature
    opt['yfeature'] = yfeature
    opt['legend'] = [str(i) for i in sectors]
    opt['title'] = ''
    return json.dumps(opt)

@app.route('/get_option_one_sector/<name>')
def get_option(name):
    sector_info_table   = D[name]['sector_info_table']  
    sector_week_index   = D[name]['sector_week_index'] 
    sector23_dict       = D[name]['sector23_dict']     
    sectoridname_dict   = D[name]['sectoridname_dict'] 
    grouped             = D[name]['grouped']           
    sectors             = D[name]['sectors']            
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
    a, b = my_ls_regression(d[xfeature], d[yfeature])
    print 'a=%i, b=%i'%(a, b)
    opt['coef'] = [a, b]
    opt['xmin'] = d[xfeature].min()
    opt['xmax'] = d[xfeature].max()
    opt['xfeature'] = xfeature
    opt['yfeature'] = xfeature
    opt['main_series'] = main_series
    opt['legend'] = [sectorid]
    opt['title'] = 'Sector %i'%sectorid
    opt['subtitle'] = 'Subsectors: %s'%sector23_dict[sectorid]
    return json.dumps(opt)


def mypearsonr(x, y):
    r, p = stats.pearsonr(y, x)
    if np.isnan(r):
        r = 0
    return r, p

def corr_cdf(corr_series):
    # 图3所需数据，类似于概率累积图
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

def my_ls_regression(x, y):
    # least square regression, return slope
    # x is data, y is label
    # x and y are nx1 column vectors
    A = np.vstack([x, np.ones(x.shape[0])]).T
    result = np.linalg.lstsq(A, y)
    a, b = result[0]
    return round(a, 3), round(b, 3)



if __name__ == '__main__':
    app.run(debug=True)
