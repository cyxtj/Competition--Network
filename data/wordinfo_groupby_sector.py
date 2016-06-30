# coding=utf8

# top word info in form: wid, info, subsector, sector, cost
# in each sector, sort words by cost descending, 
# output: 
#    [
#       [sector1, [word1, word2, ...]]
#       [sector2, [word1, word2, ...]]
#    ]

import pandas as pd
import h5py

infilename = 'topwords/all-months-topwords_info.csv'
outfilename = 'topwords/all-months-sector-topwords-info.csv'
# infilename = 'last-month-topwords_info.csv'
# outfilename = 'last-month-sector-topwords-info.csv'

D = pd.read_csv(infilename, names=['wid', 'info', 'subs', 'sector', 'cost'], 
        index_col=None)
fout = open(outfilename, 'w')

result = []
gd = D.groupby('sector')
for (sectorid, d) in gd:
    d = d.sort_values(by='cost', ascending=False)
    fout.write('%i,%s\n'%(sectorid, '-'.join(d['info'].values.tolist()[:10])))

fout.close()

