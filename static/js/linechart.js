
var current_sectorid = 5101;
var xfeature = 'HHI';
var yfeature = 'CPC';
// 基于准备好的dom，初始化echarts图表
var myChart = echarts.init(document.getElementById('main'));
var option_data = {
	legends : '',
	main_data : []
};
var option = {
	
};


function change_sectorid(e) {
	// Draw the HHI-CPC figure,
	// called when click the radio input.
	var sectorid = Number(e.getAttribute("id"));
    current_sectorid = sectorid;
    console.log(current_sectorid);
	request_fresh();
};

function request_fresh(){
	var data = {'sectorid': current_sectorid, 'xfeature': xfeature, 'yfeature': yfeature};
	$.getJSON('get_option', data, function (option_data, status) {
        fresh(option_data)
	});
	// scroll to figure
	window.scroll(0, findPos(document.getElementById("main")));
}

function fresh(option_data){
    /* option.title.text = option_data.title;
    option.title.subtext = option_data.subtitle;
    option.legend.data = option_data.legends;
    option.series[0].data = option_data.main_series; */
	option = {
	title : {
		text : xfeature + '-' + yfeature + ' each week ' + option_data.title,
        subtext : option_data.subtitle, 
	},
	tooltip : {
		formatter : function (params) {
			return 'week: ' + params.value[2] + '<br/> ' + xfeature +': ' + params.value[0] + '<br/> ' + yfeature + ': ' + params.value[1];
		}
	},
	legend : {
		data : option_data.legends
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
			dataView : {
				show : true,
				readOnly : false
			},
			magicType : {
				show : true,
				type : ['line', 'bar']
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
			type : 'value',
			name : xfeature,
		}
	],
	yAxis : [{
			type : 'value',
			scale : false,
			name : yfeature,
		}
	],
	series : [{
			name : '数据1',
			type : 'line',
			symbol : 'circle',

			itemStyle : {
				normal : {
					color : function (p) {
						if (p.dataIndex >= 0) {
							if (p.data[2] < 45) {
								var c = 'rgba(' + Math.round(p.data[2] / 89 * 2 * 255) + ', 255, 0, 1)';
							} else {
								var c = 'rgba(255, ' + (255 - Math.round(p.data[2] / 89 * 255)) + ', 0, 1)';
							}

							return c;
						}
					},
					label : {
						show : true,
						position : 'inside',
						formatter : function (params) {
							if (params.value[2] % 5 == 0) {
								return params.value[2];
							} else {
								return '';
							}
						},
						textStyle : {
							fontSize : '11',
							fontFamily : '微软雅黑',
							fontWeight : 'bold',
							color : 'black'
						}
					},
					lineStyle : { // 系列级个性化折线样式，横向渐变描边
						width : 1,
						color : 'rgba(0,0,255,0.2)'

					}
				}
			},
			data : option_data.main_series,
			symbol : 'circle',
			//color: '#ff0000',
		}, ]
};

    myChart.setOption(option);
}
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


$(function () {
	// init tooltips
  $('[data-toggle="tooltip"]').tooltip()
})

function change_xfeature(e){
	xfeature = e.getAttribute("id");
	console.log(xfeature);
	request_fresh();
}
function change_yfeature(e){
	yfeature = e.getAttribute("id");
	console.log(yfeature);
	request_fresh();
}