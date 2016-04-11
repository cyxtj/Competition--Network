% this script combine indexes into one excel table
% so that it will be easier to view and do further research

load('INDEXES1.mat');
load('INDEXES2.mat');
load('INDEXES4.mat');

x = dlmread('INDEXES3.txt', ',', 1, 0);
eff_diam_T = mean(x(:, 4: 7), 2);
eff_diam_U = mean(x(:, 10: 13), 2);
INDEXES3 = table(x(:, 1), x(:, 2), x(:, 3), x(:, 9), x(:, 8), x(:, 14), eff_diam_T, eff_diam_U, ...
'VariableNames', {'WEEK', 'SECTOR', 'diam_T', 'diam_U', 'cc_T', 'cc_U', 'eff_diam_T', 'eff_diam_U'});
%'WEEK', 'SECTORID', 'diam_T', 'e1_T', 'e2_T', 'e3_T', 'e4_T', 'cc_T', diam, e1, e2, e3, e4, cc 

indexes = innerjoin(INDEXES1, INDEXES2, 'Keys', {'WEEK', 'SECTOR'});
indexes = innerjoin(indexes, INDEXES3, 'Keys', {'WEEK', 'SECTOR'});
indexes = innerjoin(indexes, INDEXES4, 'Keys', {'WEEK', 'SECTOR'});

%writetable(indexes, 'index-each-sector-week.xlsx');

