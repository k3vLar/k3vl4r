$(document).ready(function () {

    function updateData() {

        console.log("TEST");

    }

    $.getJSON("mapData.json", function (mapData) {

        myMapData = mapData;

        for (i = 0; i < myMapData.length; i++) {
            var Item = myMapData[i]['name'].split(",");
            $("#UITable tbody").append("<tr>" +
                    "<td>" + myMapData[i]['ip'] + "</td>"
                    + "<td>" + myMapData[i]['port'] + "</td>"
                    + "<td>" + Item[0] + "</td>"
                    + "<td>" + Item[1] + "</td>"
                    + "<td>" + Item[2] + "</td>"
                    + "<td>" + myMapData[i]['value'][0] + "," + myMapData[i]['value'][1] + "</td>"
                    + "</tr>");

        }

        $.getJSON("myGeo.json", function (myGeo) {

            myGeoData = myGeo;

            $('#UITable').DataTable({
                dom: 'Bfrtip',
                buttons: [
                    {
                        extend: 'copyHtml5'
                    },
                    {
                        extend: 'excelHtml5'
                    },
                    {
                        extend: 'csvHtml5'
                    },
                    {
                        extend: 'pdfHtml5',
                        title: 'k3vl4r ' + moment().format('MMMM-Do-YYYY-h-mm-ss-a'),
                        orientation: 'landscape',
                        pageSize: 'LEGAL',
                        customize: function (doc) {
                            doc['header'] = (function () {
                                return {
                                    columns: [
                                        {
                                            fontSize: 14,
                                            text: 'Custom PDF export with dataTables'
                                        }
                                    ],
                                    margin: 20
                                }
                            });
                            doc.content[1].table.widths = Array(doc.content[1].table.body[0].length + 1).join('*').split('');
                        }
                    }
                ]
            });

        });

    });

    setInterval(updateData(), 1000);

});
