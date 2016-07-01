var xfeature = 'HHI';
var yfeature = 'CPC';
// 基于准备好的dom，初始化echarts图表
var mainChart = echarts.init(document.getElementById('main'));
var corrChart = echarts.init(document.getElementById('corr-fig'));
var corrCdfChart = echarts.init(document.getElementById('corr-cdf'));
var main_col_index = {'X':0, 'Y':1, 'SECTOR':2, 'WEEK':3};
var xaxis_type = 'value';
var yaxis_type = 'value';
var main_option = {};
var corr_option = {};
var corr_cdf_option = {};
var OPTION = {};
var usertype;

$(document).ready(function() {
    usertype = $("#usertype").text();
    request_fresh();
    
});

// request the data to show according to : current_sectorid, xfeature, yfeature
// and the refresh the figure.
function request_fresh(scroll){
	//mainChart.showLoading();
	var data = {'xfeature': xfeature, 'yfeature': yfeature};
	$.getJSON('/get_option_all_sector/'+usertype, data, function (d, status) {
        OPTION = d;
        console.log("hello"+xfeature+"----"+yfeature);
        fresh(d);
		fresh_corr(d);
		fresh_corr_cdf(d);
        console.log("hello"+xfeature+"----"+yfeature + "2");
        // mainChart.hideLoading();
        // scroll to figure
        if(scroll==true){
            window.scroll(0, findPos(document.getElementById("main")));
        }
	});
    
}

// refresh the figure accoarding to option_data
function fresh(option_data){
    
main_option = {
	grid: {
        x: '5%',
        x2: 150,
        y: '18%',
        y2: '10%'
    },
	title : {
		text :  '图1：' + xfeature + ' - ' + yfeature ,
	},
	tooltip : {
		formatter : function (params) {
			return 'Sector: ' + params.value[main_col_index.SECTOR] + '<br/> ' +
					'week: ' + params.value[main_col_index.WEEK] + '<br/> ' + 
					xfeature +': ' + params.value[main_col_index.X] + '<br/> ' + 
					yfeature + ': ' + params.value[main_col_index.Y];
		}
	},
	animation: false,
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
	dataZoom: [
        {
            type: 'slider',
            show: true,
			realtime : false, 
            xAxisIndex: [0],
            start: 0,
            end: 100
        },
        {
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


function series_gen(sectors, all_sectors_data){
    
	var series = [];
	var n = sectors.length;
	for(var i=0; i<n; i++){
		var sectorid = sectors[i];
		var one_sector_option = {
			name : sectorid,
			type : 'scatter',
			//symbol : 'circle',
			large : true,
			symbolSize: 3,
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
function change_xfeature(e){
	xfeature = e.getAttribute("id");
	console.log(xfeature);
	request_fresh(true);
}

// when click button on "Feature of y-axis", change the y feature to draw
function change_yfeature(e){
	yfeature = e.getAttribute("id");
	console.log(yfeature);
	request_fresh(true);
}

function change_xaxis_type(type){
		xaxis_type = type;
		fresh(main_option);
}
function change_yaxis_type(type){
		yaxis_type = type;
		fresh(main_option);
}


/**
/* figure 'corr-fig' draw the correlation between xfeature and yfeature of each sector
**/
// refresh the figure accoarding to option_data
function fresh_corr(option_data){
corr_option = {
	grid: {
        x: '5%',
        x2: 150,
        y: '18%',
        y2: '10%'
    },
	title : {
		text :  '图2：' + xfeature + ' - ' + yfeature + ' pearson correlation of each sector',
	},
	tooltip : {
		formatter : function (params) {
			return 'Sector: ' + params.value[0] + '<br/> ' +
					'corr: ' + params.value[1] + '<br/> ' +
					'p-value' +': ' + params.value[2] + '<br/> ' + 
					'increase ratio' +': ' + params.value[3] + '<br/> ' + 
                    option_data.sector_idname_dict[params.value[0]] + '<br/> ' + 
                    option_data.sector_23_dict[params.value[0]].substring(0, 40) + '...<br/> ';
		}
	},
	animation: false,
	visualMap: [
	{
        dimension : 2,
		min : 0,
		max : 0.01,
		precision : 4, 
		text : ['size: p-value'],
		textGap: 30,
		calculable : true, 
        inRange: {
            //color: ['#121122', 'rgba(3,4,5,0.4)', 'red'],
            symbolSize: [5, 20]
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
		textGap: 30,
		calculable : true, 
		inRange : {
			color : ['green', 'yellow', 'red']
			
		}, 
		bottom : '10%', 
		right : '3%', 
		
	}],
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

function corr_series_gen(sectors, all_sectors_data){
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
function fresh_corr_cdf(option_data){
corr_cdf_option = {
	grid: {
        x: '5%',
        x2: 150,
        y: '18%',
        y2: '10%'
    },
	title : {
		text : '图3：' + xfeature + ' - ' + yfeature + ' pearson correlation cdf',
	},
	tooltip : {}, 
	animation: false,
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
		data: option_data.corr_cdf,
	}],
	};
    corrCdfChart.setOption(corr_cdf_option);
}
