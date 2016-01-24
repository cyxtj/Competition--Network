
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

grouped = sector_week_index.groupby('SECTOR')
sectors = sector_week_index['SECTOR'].unique().astype(int).tolist()
