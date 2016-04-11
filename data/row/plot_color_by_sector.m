function plot_color_by_sector(x, y, sector)
figure();
hold on;
group_dic = group_by_label([x, y, sector], 3);
keys = group_dic.keys();
l = [];
for i = 1: length(keys)
    key = keys{i};
    sector_data = group_dic(key);
    plot(sector_data(:, 1), sector_data(:, 2), '.', 'Color', random('unif', 0, 1, 1, 3));
    l = [l; num2str(key)];
end
legend(l);
legend('hide');