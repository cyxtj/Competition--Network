# coding=utf-8
import numpy as np
import pandas as pd
import h5py

folders_names = [
        ['data/week-RU100/', 'RU100'], 
        ['data/week/', 'ALL'], 
        ['data/week-pc/', 'pc'], 
        ['data/week-mobile/', 'mobile']]
D = {}
for folder, name in folders_names:
    # Load data
    # sector,NUser,NClick/万,CPC,Revenue/万,sector-name,subsector-names,words
    sector_info_table = pd.read_csv(folder+'sector-info.csv', index_col=None, encoding='utf8')
    fc = open(folder+'column_names.txt', 'r')
    columns = fc.readline().strip().split(',')
    fc.close()
    f = h5py.File(folder+'index-each-sector-week.h5', 'r')
    sector_week_index = pd.DataFrame(f['indexes'].value, columns=columns)

    # Preprocesses
    # 一些sector 数据量太少，使用RU20时需要删除
    if 'RU20' in folder:
        sectors_remove = [5301, 5403, 6905, 5405, 6005, 6710]
        idx = np.ones(sector_week_index.shape[0]).astype(bool)
        for s in sectors_remove:
            idx = np.bitwise_and(idx, sector_week_index['SECTOR']!=s)
        sector_week_index = sector_week_index[idx]
    if name == 'mobile':
        print 'mobile delete first 19 weeks'
        sector_week_index = sector_week_index[sector_week_index['WEEK']>19]


    for col in sector_week_index.columns:
        sector_week_index['log-'+col] = np.log(sector_week_index[col])\
                .fillna(0.0001).round(4)
        if col in ['cc_U']:
            continue
        sector_week_index[col] = sector_week_index[col].round(2)

    sector2_3 = sector_info_table[['sector', 'sector-name', 'subsector-names']]
    sector23_dict = {i[1][0]: '\n'.join([i[1][2]])
            for i in sector2_3.iterrows()}
    sectoridname_dict = {i[1][0]: i[1][1] for i in sector2_3.iterrows()}

    grouped = sector_week_index.groupby('SECTOR')
    sectors = sector_week_index['SECTOR'].unique().astype(int).tolist()
    sectors = sorted(sectors)
    D[name] = {
            'sector_info_table': sector_info_table, 
            'sector_week_index': sector_week_index,
            'sector23_dict': sector23_dict,
            'sectoridname_dict': sectoridname_dict,
            'grouped': grouped,
            'sectors': sectors,
            }

f = open(r'data/feature_desc.txt', 'r')
feature_desc = []
for l in f:
    [feature, desc] = l.strip().split(',')
    feature_desc.append([feature.decode('utf8'),desc.decode('utf8')])

f.close()
