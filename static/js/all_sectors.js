
var xfeature = 'HHI';
var yfeature = 'CPC';
// 基于准备好的dom，初始化echarts图表
var myChart = echarts.init(document.getElementById('main'));
request_fresh();
var col_index = {'X':0, 'Y':1, 'SECTOR':2, 'WEEK':3};
var xaxis_type = 'value';
var yaxis_type = 'value';
var OPTION_DATA = {};

// request the data to show according to : current_sectorid, xfeature, yfeature
// and the refresh the figure.
function request_fresh(scroll){
	var data = {'xfeature': xfeature, 'yfeature': yfeature};
	$.getJSON('get_option_all_sector', data, function (option_data, status) {
		OPTION_DATA = option_data;
        fresh(option_data)
	});
	// scroll to figure
	if(scroll==true){
		window.scroll(0, findPos(document.getElementById("main")));
	}
	
}

// refresh the figure accoarding to option_data
function fresh(option_data){
	option = {
	title : {
		text : xfeature + '-' + yfeature + ' each week ' + option_data.title,
        subtext : option_data.subtitle, 
	},
	tooltip : {
		formatter : function (params) {
			return 'Sector: ' + params.value[col_index.SECTOR] + '<br/> ' +
					'week: ' + params.value[col_index.WEEK] + '<br/> ' + 
					xfeature +': ' + params.value[col_index.X] + '<br/> ' + 
					yfeature + ': ' + params.value[col_index.Y];
		}
	},
	animation: false,
	/*legend : {
		data : option_data.legends
	},*/
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

	calculable : true,
	xAxis : [{
			type : xaxis_type,
			name : xfeature,
		}
	],
	yAxis : [{
			type : yaxis_type,
			scale : false,
			name : yfeature,
		}
	],
	series : series_gen(option_data.legends, option_data.main_series),
	};

    myChart.setOption(option);
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
			
			data : all_sectors_data[sectorid],
			color: '#ff0000',
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
		fresh(OPTION_DATA);
}
function change_yaxis_type(type){
		yaxis_type = type;
		fresh(OPTION_DATA);
}