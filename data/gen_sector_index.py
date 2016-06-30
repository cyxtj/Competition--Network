# coding=utf8

# this script generate the final table of sector level information
# includes: 
#    1. average indexes
#    2. sector name
#    3. subsector names
#    4. sector top words

import pandas as pd
import h5py

folder = 'indexes/RU100/'
input_index_fname = folder + 'index-each-sector-week.h5'
input_col_fname = folder + 'column_names.txt'
output_sector_fname = folder + 'sector-info.csv'

# 1. average indexes
fc = open(input_col_fname, 'r')
columns = fc.readline().strip().split(',')
fc.close()

f = h5py.File(input_index_fname, 'r')
sector_week_index = pd.DataFrame(f['indexes'].value, columns=columns)

gd = sector_week_index.groupby('SECTOR')
sector_index = gd[['NUser', 'NClick', 'CPC', 'Revenue']].mean()
sector_index[['NClick', 'Revenue']] /= 10000
sector_index = sector_index.astype(int)
sector_index.columns = [u'NUser', u'NClick/万', u'CPC', u'Revenue/万']

# 2.& 3. sector name and subsector names, in file 'sector23.csv'
# sector-id, sector-name, subsector-name
sector23 = pd.read_csv('sector23.csv', index_col=0)

# 4. sector top words
allmonth = pd.read_csv('topwords/all-months-sector-topwords-info.csv', 
        names=['words'])
# lastmonth = pd.read_csv('last-month-sector-topwords-info.csv', 
#         names=['lastinfo'], index_col=None)


# join 1.2.3.4
A = sector_index.join(sector23, how='inner')
B = A.join(allmonth, how='inner')

B.to_csv(output_sector_fname, index_label='sector', encoding='utf8')
