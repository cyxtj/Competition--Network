% We can see from graph that in most sectors, CPC and NUser
% has a good linear correlation.
% But each sector has its own slope.
% Which property or properties in a sector is related to this slope?

combine_indexes;
indexes.userPer_80perClick = indexes.userNumber_80percentClick ./ indexes.NUser * 100;


% compute the slope of each sector
D = [indexes.SECTOR, indexes.NUser, indexes.CPC, indexes.cc_U, indexes.NUser, indexes.userPer_80perClick];
grouped = group_by_label(D, 1);
sectors = cell2mat(grouped.keys);

% cc_U is a stable property of a sector most of time.
Slopes = [];
for i = 1: length(sectors)
    sector = sectors(i);
    d = grouped(sector);
    if (corr((1:89)', d(:, 2)) > 0)
        x = d(:, 2);
        cpc = d(:, 3);
        cc_U = d(:, 4);
        user = d(:, 5);
        userp_80perClk = d(:, 6);
        [rho, p] = corr(x, cpc);
        meancc_U = mean(cc_U);
        meanuser = mean(user);
        meancpc = mean(cpc);
        meanuserp_80perClk = mean(userp_80perClk);
        b = regress(cpc, [x, ones(size(x))]); b1 = b(1); b2 = b(2);
        if (rho>0.3 && p<0.005 && b1>0)
            Slopes = [Slopes; [sector, meancc_U, meanuser, meancpc, b1, b2, rho, p, meanuserp_80perClk]];
        end
    end
end



s = Slopes(:, 5);
cc = Slopes(:, 2);
meanu = Slopes(:, 3);
meancpc = Slopes(:, 4);
meanuserper = Slopes(:, 9);
logs = log(s);
logu = log(meanu);
coef = regress(logs, [logu, ones(size(meanu))]);
s2 = s / exp(coef(2)) ./ (meanu.^ coef(1));       % this should be close to 1
s3 = s ./ meancpc .* meanu;
figure;hist(s2, 20);
figure;hist(s3, 20);
figure;hist(logs, 20);


% adjust slope according to: s2 = s / exp(b(2)) ./ (u.^ b(1));
% cpc' = (cpc - b2) * meanuser
newD = [];
for i = 1: length(sectors)
    sector = sectors(i);
    d = grouped(sector);
    if (corr((1:89)', d(:, 2)) > 0)
        cpc = d(:, 3);
        user = d(:, 5);
        meanuser = mean(user);
        b = regress(cpc, [u80, ones(size(u80))]); b1 = b(1); b2 = b(2);
        newcpc = (cpc - b2) * meanuser * 130;
        if (b1>0)
            x = [user, newcpc];
            x(:, 3) = sector;
            newD = [newD; x];
        end
    end
    
end
plot_color_by_sector(newD(:, 1), newD(:, 2), newD(:, 3))