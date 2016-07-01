var xfeature = 'HHI';
var yfeature = 'CPC';
// 基于准备好的dom，初始化echarts图表
var mainChart = echarts.init(document.getElementById('main'));
var heatChart = echarts.init(document.getElementById('heatmap'));

var corrChart = echarts.init(document.getElementById('corr-fig'));
var corrCdfChart = echarts.init(document.getElementById('corr-cdf'));
var main_col_index = {
	'X' : 0,
	'Y' : 1,
	'SECTOR' : 2,
	'WEEK' : 3
};
var xaxis_type = 'value';
var yaxis_type = 'value';
var main_option = {};
var corr_option = {};
var corr_cdf_option = {};
var heat_option = {};
var heatmap_param = {
	nbins : [50, 50]
};
var RESPONSE = {};
var usertype;
var figure_on = {
	'main' : false,
	'corr' : false,
	'corr_cdf' : false,
	'heatmap' : true
};
var figures = {
	'main' : mainChart,
	'corr' : corrChart,
	'corr_cdf' : corrCdfChart,
	'heatmap' : heatChart
};

$(document).ready(function () {
	$("#xoptionlist").children("#" + xfeature)[0].className += " active";
	$("#yoptionlist").children("#" + yfeature)[0].className += " active";
	usertype = $("#usertype").text();
	request_fresh();

});

function switch_figure(figure_name) {
	if (figure_on[figure_name]) {
		figures[figure_name].clear();
	} else {
		switch (figure_name) {
		case 'main':
			fresh(RESPONSE);
		case 'corr':
			fresh_corr(RESPONSE);
		case 'corr_cdf':
			fresh_corr_cdf(RESPONSE);
		case 'heatmap':
			fresh_heatmap(RESPONSE);
		}
	}
}
// request the data to show according to : current_sectorid, xfeature, yfeature
// and the refresh the figure.
function request_fresh(scroll) {
	//mainChart.showLoading();
	var data = {
		'xfeature' : xfeature,
		'yfeature' : yfeature
	};
	$.getJSON('/get_option_all_sector/' + usertype, data, function (d, status) {
		RESPONSE = d;
		console.log("hello" + xfeature + "----" + yfeature);
		if (figure_on['main']) {
			fresh(d);
		}
		if (figure_on['corr']) {
			fresh_corr(d);
		}
		if (figure_on['corr_cdf']) {
			fresh_corr_cdf(d);
		}
		if (figure_on['heatmap']) {
			fresh_heatmap(d);
		}

		console.log("finish plot" + xfeature + "----" + yfeature + "2");
		// mainChart.hideLoading();
		// scroll to figure
		if (scroll == true) {
			//window.scroll(0, findPos(document.getElementById("main")));
		}
	});

}

// refresh the figure accoarding to option_data
function fresh(option_data) {

	main_option = {
		grid : {
			x : '5%',
			x2 : 150,
			y : '18%',
			y2 : '10%'
		},
		title : {
			text : '图1：' + xfeature + ' - ' + yfeature,
		},
		tooltip : {
			formatter : function (params) {
				return 'Sector: ' + params.value[main_col_index.SECTOR] + '<br/> ' +
				'week: ' + params.value[main_col_index.WEEK] + '<br/> ' +
				xfeature + ': ' + params.value[main_col_index.X] + '<br/> ' +
				yfeature + ': ' + params.value[main_col_index.Y];
			}
		},
		animation : false,
		legend : {
			show : false,
			data : option_data.legend,
			left : 'right',
			orient : 'vertical',
			itemGap : 5,
			itemHeight : 10
		},
		toolbox : {
			show : true,
			feature : {
				mark : {
					show : true
				},
				dataZoom : {
					show : true
				},
				restore : {
					show : true
				},
				saveAsImage : {
					show : true
				}
			}
		},
		/*
		dataZoom: [{
		type: 'slider',
		show: true,
		realtime : false,
		xAxisIndex: [0],
		start: 0,
		end: 100
		},{
		type: 'slider',
		show: true,
		realtime : false,
		yAxisIndex: [0],
		left: '93%',
		start: 0,
		end: 100
		}
		],

		calculable : true,
		 */
		xAxis : [{
				type : xaxis_type,
				name : xfeature,
			}
		],
		yAxis : [{
				type : yaxis_type,
				//scale : false,
				name : yfeature,
			}
		],
		series : series_gen(option_data.legend, option_data.main_series),
	};
	mainChart.setOption(main_option);
}

function series_gen(sectors, all_sectors_data) {

	var series = [];
	var n = sectors.length;
	for (var i = 0; i < n; i++) {
		var sectorid = sectors[i];
		var one_sector_option = {
			name : sectorid,
			type : 'scatter',
			//symbol : 'circle',
			large : true,
			symbolSize : 3,
			data : all_sectors_data[sectorid],
			//color: '#ff0000',
		}
		series.push(one_sector_option);
	}
	return series;
}

// scroll the window to the given obj.
function findPos(obj) {
	//Finds y value of given object
	var curtop = 0;
	if (obj.offsetParent) {
		do {
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
		return [curtop];
	}
};

// when click button on "Feature of x-axis", change the x feature to draw
function change_xfeature(e) {
	xfeature = e.getAttribute("id");
	console.log(xfeature);
	request_fresh(true);
}

// when click button on "Feature of y-axis", change the y feature to draw
function change_yfeature(e) {
	yfeature = e.getAttribute("id");
	console.log(yfeature);
	request_fresh(true);
}

function change_xaxis_type(type) {
	xaxis_type = type;
	fresh(main_option);
}
function change_yaxis_type(type) {
	yaxis_type = type;
	fresh(main_option);
}

/**
/* figure 'corr-fig' draw the correlation between xfeature and yfeature of each sector
 **/
// refresh the figure accoarding to option_data
function fresh_corr(option_data) {
	corr_option = {
		grid : {
			x : '5%',
			x2 : 150,
			y : '18%',
			y2 : '10%'
		},
		title : {
			text : '图2：' + xfeature + ' - ' + yfeature + ' pearson correlation of each sector',
		},
		tooltip : {
			formatter : function (params) {
				return 'Sector: ' + params.value[0] + '<br/> ' +
				'corr: ' + params.value[1] + '<br/> ' +
				'p-value' + ': ' + params.value[2] + '<br/> ' +
				'increase ratio' + ': ' + params.value[3] + '<br/> ' +
				option_data.sector_idname_dict[params.value[0]] + '<br/> ' +
				option_data.sector_23_dict[params.value[0]].substring(0, 40) + '...<br/> ';
			}
		},
		animation : false,
		visualMap : [{
				dimension : 2,
				min : 0,
				max : 0.01,
				precision : 4,
				text : ['size: p-value'],
				textGap : 30,
				calculable : true,
				inRange : {
					//color: ['#121122', 'rgba(3,4,5,0.4)', 'red'],
					symbolSize : [5, 20]
				},
				handelPosition : 'right',
				top : '10%',
				right : '3%',
			}, {
				dimension : 3,
				min : -1,
				max : 1,
				precision : 2,
				text : ['color : \n' + yfeature + ' increase ratio'],
				textGap : 30,
				calculable : true,
				inRange : {
					color : ['green', 'yellow', 'red']

				},
				bottom : '10%',
				right : '3%',

			}
		],
		toolbox : {
			show : true,
			feature : {
				dataZoom : {
					show : true
				},
				restore : {
					show : true
				},
				saveAsImage : {
					show : true
				}
			}
		},

		xAxis : [{
				type : 'value',
				name : 'sector',
				nameLocation : 'middle',
				nameGap : 25,
				scale : true,
			}
		],
		yAxis : [{
				type : 'value',
				min : -1,
				max : 1,
				interval : 0.1,
				name : 'Pearson correlation coefficient',
			}
		],
		series : corr_series_gen(option_data.legend, option_data.corr_series),
	};
	corrChart.setOption(corr_option);
}

function corr_series_gen(sectors, all_sectors_data) {
	var series = [];
	var n = sectors.length;
	var one_sector_option = {
		name : 'correlation',
		type : 'scatter',
		data : all_sectors_data,
	}
	series.push(one_sector_option);

	return series;
}

/**
/* figure of correlation cdf
 **/
function fresh_corr_cdf(option_data) {
	corr_cdf_option = {
		grid : {
			x : '5%',
			x2 : 150,
			y : '18%',
			y2 : '10%'
		},
		title : {
			text : '图3：' + xfeature + ' - ' + yfeature + ' pearson correlation cdf',
		},
		tooltip : {},
		animation : false,
		toolbox : {
			show : true,
			feature : {
				dataZoom : {
					show : true
				},
				restore : {
					show : true
				},
				saveAsImage : {
					show : true
				}
			}
		},

		xAxis : [{
				type : 'value',
				name : 'correlation coefficient',
				nameLocation : 'middle',
				min : -1,
				max : 1,
				interval : 0.1,
				nameGap : 25,
			}
		],
		yAxis : [{
				type : 'value',
				min : 0,
				max : 1,
				interval : 0.1,
				name : 'cdf',
			}
		],
		series : [{
				type : 'line',
				data : option_data.corr_cdf,
			}
		],
	};
	corrCdfChart.setOption(corr_cdf_option);
}

function change_bins() {
	heatmap_param['nbins'][0] = parseInt($("#xbins").val());
	heatmap_param['nbins'][1] = parseInt($("#ybins").val());
	fresh_heatmap(RESPONSE);
}
function maxmin_dim_z(d, z) {
	max = -100000000;
	min = -max;
	for (i = 0; i < d.length; i++) {
		max = (max > d[i][z]) ? max : d[i][z];
		min = (min < d[i][z]) ? min : d[i][z];
	}
	return [max, min];
}
function myrange(n, a, b, interval) {
	var range = [];
	for (i = 0; i < n; i++) {
		range[i] = Math.round((a * i + b)*10000)/10000;
	}
	return range;
}
function fresh_heatmap(option_data) {
	var series = [];
	var n = option_data.legend.length;
	for (var i = 0; i < n; i++) {
		var sectorid = option_data.legend[i];
		series = series.concat(option_data.main_series[sectorid].slice()); // make a copy;
	}
	var xmaxmin = maxmin_dim_z(series, 0);
	var ymaxmin = maxmin_dim_z(series, 1);
	var xbinsize = (xmaxmin[0] - xmaxmin[1]) / heatmap_param['nbins'][0];
	var ybinsize = (ymaxmin[0] - ymaxmin[1]) / heatmap_param['nbins'][1];
	console.log(xmaxmin);
	console.log(xbinsize);

	var data = hist2d(series, [xbinsize, ybinsize]);
	var maxcount = 0;
	for (i = 0; i < data.length; i++) {
		maxcount = (maxcount > data[i][2]) ? maxcount : data[i][2];
	}
	heatmap_param['maxcount'] = maxcount;
	var xData = myrange(heatmap_param['nbins'][0], xbinsize, xmaxmin[1]);
	var yData = myrange(heatmap_param['nbins'][1], ybinsize, ymaxmin[1]);
	console.log(xData);
	heat_option = {
		tooltip : {},
        title : {
			text : '图4：' + xfeature + ' - ' + yfeature + ' heatmap',
		},
		xAxis : {
			type : 'category',
			data : xData
		},
		yAxis : {
			type : 'category',
			data : yData
		},
		visualMap : {
			min : 0,
			max : heatmap_param['maxcount'],
			calculable : true,
			realtime : false,
            orient: 'horizontal',
        right: '50px',
        top: '30px'
			/*
			inRange: {
			color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
			}
			 */
		},
		series : [{
				name : 'Gaussian',
				type : 'heatmap',
				data : data,
				itemStyle : {
					emphasis : {
						borderColor : '#333',
						borderWidth : 1
					}
				},
				progressive : 1000,
				animation : false
			}
		]
	};
	heatChart.setOption(heat_option);
}