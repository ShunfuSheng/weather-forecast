/**
 * Created by Administrator on 2016/11/10.
 */

$(function () {
    //使用vue框架
    var weather = new Vue({
        el: '#write',
        data: {
            weather_data: []
        }
    });


    //配置highcharts图表
    var title = {
        text: '城市日均气温曲线'
    };
    var xAxis = {
        categories: ['Thurs', 'Fri', 'Sat', 'Sun', 'Mon', 'Tues', 'Wed',
        'Thurs', 'Fri', 'Sat', 'Sun']
    };
    var yAxis = {
        title: {
            text: 'Temperature (\xB0C)'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }]
    };
    //设置鼠标指向时显示的数据单位
    var tooltip = {
        valueSuffix: '\xB0C'
    };
    //设置城市名的位置和显示方式
    var legend ={
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    };

    var json = {};
    json.title = title;
    json.xAxis = xAxis;
    json.yAxis = yAxis;
    json.tooltip = tooltip;
    json.legend = legend;


    //ajax的公共配置
    $.ajaxSetup({
        type: 'get',
        dataType: 'json',
        //请求头中的数据
        headers: {
            apikey:'6df030858631cb00d3a2ab0da6f013e1'
        },
        error: function (err) {
            console.dir(err);
        }
    });

    //获取城市信息
    $('#myForm').submit(function (e) {
        e.preventDefault();
        $.ajax({
            url: 'http://apis.baidu.com/apistore/weatherservice/cityinfo',
            data: {cityname: $(this).find('input').val()},
            success: function (response) {
                //获取城市名和代号
                var cityName = response.retData.cityName;
                var cityCode = response.retData.cityCode;

                //获取天气数据
                $.ajax({
                    url: 'http://apis.baidu.com/apistore/weatherservice/recentweathers',
                    data: {cityname: cityName, cityid: cityCode},
                    success: function (res) {
                        // console.dir(res);
                        var allDate = [];
                        //获取历史
                        for(var index in res.retData.history){
                            allDate.push(res.retData.history[index]);
                        }
                        //获取今日
                        // var today = res.retData.today;
                        // allDate.push(today);
                        //获取未来
                        for(var index in res.retData.forecast){
                            allDate.push(res.retData.forecast[index]);
                        }

                        var now = new Date();
                        var year = now.getFullYear();
                        var month = now.getMonth()+1;

                        //放数据
                        //存储highchart图表数据，先清空
                        var tempData = [];
                        //存储vue绑定数据，先清空
                        var tempData2 = []
                        allDate.forEach(function (ele) {
                            if(ele.date.includes('日')){
                                var newDate = ele.date.replace('日','');
                                ele.date = year + '-' + month + '-' + newDate;
                            }
                            tempData2.push(ele);
                            //添加平均气温到highcharts中
                            var aveTemp = (Number(ele.hightemp.replace('℃', '')) + Number(ele.lowtemp.replace('℃', '')))/2
                            tempData.push(aveTemp);
                        })

                        //将数据更新到vue中
                        weather.weather_data = tempData2;

                        //将曲线图显示在页面上
                        json.series = [{
                            name: cityName,
                            data: tempData
                        }];
                        $('#contain').highcharts(json);
                    }
                });
            }
        });
    });


})
