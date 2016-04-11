function group_dict = group_by_label(data, label_col)
% Group the data by label_col.
% input:
%   data: matrix
%   label_col: scalar, which column is label
% output:
%   return a Map where key is label, value is data with that label
    data = sortrows(data, label_col);
    labeldiff = [0; diff(data(:, label_col))];
    label_split_start_idx = find(labeldiff);
    num_group = size(label_split_start_idx, 1) + 1;
    label_split_end_idx = [label_split_start_idx - 1; size(data, 1)];
    label_split_start_idx = [1; label_split_start_idx];
    
    group_labels = zeros(num_group, 1);
    group_datas = cell(num_group, 1);
    for i = 1:num_group
        group_data = data(label_split_start_idx(i): label_split_end_idx(i), :);
        group_labels(i) = group_data(1, label_col);
        group_datas{i} = group_data;
    end
    group_dict = containers.Map(group_labels, group_datas);
