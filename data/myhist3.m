function myhist3(x, y, bins, interp)
if(bins(1)==0)
    if(length(x)<400)
        bins = [10, 10];
    elseif(length(x)<2000)
        bins = [30, 30];
    else
        bins = [50, 50];
    end
end
dat = [x, y];
n = hist3(dat, bins);
n1 = n';
n1(size(n, 1)+1, size(n, 2)+1) = 0;
xb = linspace(min(dat(:, 1)), max(dat(:, 1)), size(n, 1)+1);
yb = linspace(min(dat(:, 2)), max(dat(:, 2)), size(n, 2)+1);
if(interp)
    pcolor(xb, yb, n1);shading interp;
else
    pcolor(xb, yb, n1);shading flat;
end
