# coding=utf-8
from init import *

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
    print '------------------------------'
    xfeature = request.args['xfeature']
    yfeature = request.args['yfeature']
    opt = dict()
    opt['main_series'] = {}
    for sectorid in sectors:
        one_sector = grouped.get_group(sectorid)[[xfeature, yfeature, 'SECTOR', 'WEEK']].values.tolist()
        opt['main_series'][sectorid] = one_sector
    opt['xfeature'] = xfeature
    opt['yfeature'] = xfeature
    opt['legends'] = sectors
    return json.dumps(opt)

@app.route('/get_option')
def get_option():
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
    main_series = d[[xfeature, yfeature, 'WEEK', 'week_start_date', 'week_end_date']].values.tolist()
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
