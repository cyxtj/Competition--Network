# coding=utf-8
import numpy as np
import pandas as pd
import h5py


t = pd.read_excel('data/index-each-sector.xls', 'Sheet1')
t.SECTOR = t.SECTOR.astype(int)
for col in t.columns[2:]:
    t[col] = t[col].round(4)
t.sort_values(by='SECTOR', inplace=True)

# sector_week_index = pd.read_excel('index-each-sector-week.xlsx', 'Sheet1')
folder = 'data/week/' 

fc = open(folder+'column_names.txt', 'r')
columns = fc.readline().strip().split(',')
fc.close()

f = h5py.File(folder+'index-each-sector-week.h5', 'r')
sector_week_index = pd.DataFrame(f['indexes'].value, columns=columns)
sector_week_index['HHI'] = sector_week_index['HHI'].round(2)
sector_week_index['CPC'] = sector_week_index['CPC'].round(2)
for col in sector_week_index.columns[2:]:
    sector_week_index[col] = sector_week_index[col].round(2)

sector2_3 = pd.read_excel('data/sector23.xlsx', 'Sheet1')
sector23_dict = {i[1][0]: i[1][2] for i in sector2_3.iterrows()}
sectoridname_dict = {i[1][0]: i[1][1] for i in sector2_3.iterrows()}

grouped = sector_week_index.groupby('SECTOR')
sectors = sector_week_index['SECTOR'].unique().astype(int).tolist()
sectors = sorted(sectors)

f = open(r'data\feature_desc.txt', 'r')
feature_desc = []
for l in f:
    [feature, desc] = l.strip().split(',')
    feature_desc.append([feature.decode('utf8'),desc.decode('utf8')])

f.close()
