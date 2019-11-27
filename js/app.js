/* global echarts */
/*****************************************************************************************
 *
 *                      k3vl4r
 *                      ver: 0.1
 *                      rel: 1
 *
 *
 ******************************************************************************************/
$(document).ready(function () {

    function onlyUnique(value, index, self) {
        //console.log(index + " " + value[0]['name']);
        return self.indexOf(value) === index;
    }


    $.getJSON("mapData.json", function (mapData) {

        myMapData = mapData;

        $.getJSON("myGeo.json", function (myGeo) {

            myGeoData = myGeo;

            geoCoordMap = {
                'New York': [-74.005974, 40.712776],
                'Los Angeles': [-118.243683, 34.052235],
                'loc3': [107.7539, 30.1904],
                'loc4': [139.710164, 35.706962],
                'London': [-0.127758, 51.507351],
                'Russia': [105.318756, 61.524010]
            };

            //geoCoordMap['Mountain View,CA,US'] = [-122.0748, 37.4043];
            geoCoordMap[myGeoData['city'] + "," + myGeoData['region'] + "," + myGeoData['country']] = [-77.4457, 38.8867];


            CQData = [];

            GZData = [];

            NNData = [
                //[{name: 'Mountain View,CA,US', value: 100}, {name: "Russia", value: 80}]
            ];

            Destinations = [];

            for (i = 0; i < mapData.length; i++) {
                geoCoordMap[mapData[i]['name']] = [mapData[i]['value'][0], mapData[i]['value'][1]];
                Destinations.push(mapData[i]);
                NNData.push([{
                    name: mapData[i]['name'],
                    value: 100
                }, {name: myGeoData['city'] + "," + myGeoData['region'] + "," + myGeoData['country'], value: 80}]);

            }

            Destinations.push({
                name: "You:" + myGeoData['city'] + "," + myGeoData['region'] + "," + myGeoData['country'],
                value: [myGeoData['ll'][1], myGeoData['ll'][0]]
            });

            geoCoordMap["You:" + myGeoData['city'] + "," + myGeoData['region'] + "," + myGeoData['country']] = myGeoData['ll'];

            NNDataCleaned = NNData.filter(onlyUnique);

            function convertData(data) {

                res = [];
                for (i = 0; i < data.length; i++) {

                    dataItem = data[i];
                    let [fromCoord, toCoord] = [geoCoordMap[dataItem[1].name], geoCoordMap[dataItem[0].name]];

                    if (fromCoord && toCoord)
                        res.push([fromCoord, toCoord]);
                }
                return res;
            }

            let [series2d, series3d] = [[], []];
            [['loc3', CQData], ['loc2', GZData], ['loc1', NNData]].forEach(function (item) {

                series2d.push(
                    {
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            fontSize: 24,
                            show: true,
                            position: 'right',
                            formatter: '{b}'
                        },
                        itemStyle: {
                            normal: {
                                color: '#f5f802'
                            }
                        },
                        data: item[1].map(function (dataItem) {

                            return {
                                name: dataItem[1].name,
                                value: geoCoordMap[dataItem[1].name],
                                symbolSize: dataItem[1].value / 4
                            };
                        })
                    },
                    {
                        type: 'effectScatter',
                        coordinateSystem: 'geo',
                        rippleEffect: {
                            brushType: 'stroke'
                        },
                        label: {
                            show: true,
                            position: 'left',
                            fontSize: 18,
                            formatter: '{b}'
                        },
                        itemStyle: {
                            normal: {
                                color: '#ff0000'
                            }
                        },
                        data: [{
                            name: item[0],
                            value: geoCoordMap[item[0]],
                            symbolSize: parseInt(Math.random() * 20 + 10),
                            label: {
                                position: 'right'
                            }
                        }]
                    }
                );

                series3d.push(
                    {
                        type: 'lines3D',
                        effect: {
                            show: true,
                            period: 3,
                            trailLength: 0.1
                        },
                        lineStyle: {
                            color: '#9ae5fc',
                            width: 1,
                            opacity: 0.6
                        },
                        tooltip: {
                            show: true,
                            trigger: 'item',
                            formatter() {
                                console.log(3);
                                return 'jhfjdsagfjsdgfisdgfiusagfuiasgf';
                            }
                        },
                        data: convertData(item[1])
                    },
                    {
                        type: 'scatter3D',
                        name: 'location',
                        coordinateSystem: 'globe',
                        blendMode: 'lighter',
                        symbolSize: 10,
                        itemStyle: {
                            color: '#0276f3',
                            opacity: 1
                        },
                        label: {
                            show: true,
                            formatter: param => param.data.name
                        },
                        data: Destinations
                    }
                );
            });

            chart = echarts.init(document.createElement('canvas'), null, {
                width: 1024,
                height: 768
            });

            chart.setOption({
                zlevel: 9999,
                backgroundColor: 'rgba(3, 28, 72, 0.3)',
                tooltip: {
                    backgroundColor: 'red',
                    alwaysShowContent: true,
                    formatter(item) {

                        console.log(item);
                        return 'jhfjdsagfjsdgfisdgfiusagfuiasgf';
                    }
                },
                geo: {
                    type: 'map',
                    map: 'world',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    zoom: 0,
                    boundingCoords: [[-180, 90], [180, -90]],
                    roam: false,
                    itemStyle: {
                        borderColor: '#000d2d',
                        areaColor: '#2455ad',
                        emphasis: {
                            areaColor: '#357cf8'
                        }
                    },
                    label: {
                        fontSize: 24
                    }
                },
                series: series2d
            });

            let option = {
                tooltip: {
                    show: true,
                    alwaysShowContent: true,
                    formatter(item) {

                        console.log(1);
                        return item.name;
                    }
                },
                globe: {
                    top: 'middle',
                    left: 'center',
                    baseTexture: 'img/earth.jpg',
                    heightTexture: 'img/bathymetry_bw_composite_4k.jpg',
                    displacementScale: 0.1,
                    shading: 'lambert',
                    environment: 'img/starfield.jpg',
                    viewControl: {
                        distance: 100,
                        autoRotate: true,
                        center: [0, 0, 0],
                        targetCoord: [myGeoData['ll'][1] - 50, myGeoData['ll'][0]]
                    }
                },
                roam: true,
                series: series3d
            };

            echarts.init(document.getElementById("container")).setOption(option, true);

            //setTimeout(function(){ alert("Test"); }, 3000);


        });

    });


});