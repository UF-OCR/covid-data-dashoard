// Load the Visualization API and the controls package.
google.charts.load('current', {'packages':['corechart', 'controls','table']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawDashboard);

function drawDashboard() {
    colors = ['#F28E2B', '#A0CBE8', '#4E79A7', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];
    var main_data = new google.visualization.DataTable();
    main_data.addColumn('string', 'IRB');//0
    main_data.addColumn('string', 'REPORTING CATEGORY');//1
    main_data.addColumn('string', 'PROTOCOL_NO');//2
    main_data.addColumn('string', 'TITLE');//3
    main_data.addColumn('string', 'PHASE');//4
    main_data.addColumn('string', 'NCT LINK');//5
    main_data.addColumn('string', 'STATUS');//6
    main_data.addColumn('number', 'ENROLLMENT');//7
    main_data_rows = result_data;
    main_data.addRows(main_data_rows);
    var pie_data_1 = create_group(main_data,[1],0,"count");
    var rc = document.getElementById("reporting_category");
    for(i=0; i<pie_data_1.getDistinctValues(0).length; i++){
                        if(pie_data_1.getDistinctValues(0)[i]!=null){
                                var option = document.createElement("option");
                                option.text = pie_data_1.getDistinctValues(0)[i];
                                option.value = pie_data_1.getDistinctValues(0)[i];
                                rc.add(option);
                        }
    }
    draw_donut(['pie_chart_1',pie_data_1], colors);
    pie_data_2 = create_group(main_data,[4],0,"count");
    draw_donut(['pie_chart_2',pie_data_2], colors);
    pie_data_3 = create_group(main_data,[6],0,"count");
    draw_donut(['pie_chart_3',pie_data_3], colors);
    main_data.sort([{column: 6,desc:true}]);
    draw_table(['table_1',main_data],true);
    changeOptions = function(args) {
          var total_protocols_changed = 0;
          var total_enrollments_changed = 0;
          if(args==0){
            document.getElementById("reporting_category").value = "0";
          }
          category = document.getElementById("reporting_category").value;
          if(category!="0"){
                var main_data_temp = new google.visualization.DataView(main_data);
                rows = main_data.getFilteredRows([{column:1,value:category}]);
                main_data_temp.setRows(rows);
                   for(var i=0;i<rows.length;i++){
                        total_protocols_changed = total_protocols_changed + 1;
                        total_enrollments_changed = total_enrollments_changed + main_data_temp.getValue(i,7);
                   }
               pie_data_temp = create_group(main_data_temp,[1],0,"count");
               draw_donut(['pie_chart_1',pie_data_temp], colors);
               pie_data_temp = create_group(main_data_temp,[4],0,"count");
               draw_donut(['pie_chart_2',pie_data_temp], colors);
               pie_data_temp = create_group(main_data_temp,[6],0,"count");
               draw_donut(['pie_chart_3',pie_data_temp], colors);
               draw_table(['table_1',main_data_temp],false);
               document.getElementById("total_count").innerHTML = total_protocols_changed;
               document.getElementById("total_enrolled").innerHTML = total_enrollments_changed;
          }else{
                draw_donut(['pie_chart_1',pie_data_1], colors);
                draw_donut(['pie_chart_2',pie_data_2], colors);
                draw_donut(['pie_chart_3',pie_data_3], colors);
                draw_table(['table_1',main_data],true);
                document.getElementById("total_count").innerHTML = total_protocols;
                document.getElementById("total_enrolled").innerHTML = total_enrollments;
          }
    }
}

function draw_donut(donut_data, color_data){
          var chart_donut = new google.visualization.ChartWrapper({
            chartType: 'PieChart',
            containerId: donut_data[0],
            dataTable: donut_data[1],
            options: {
                     width:'100%',
                     colors: color_data,
                     pieSliceText: 'value',
                     legend: { position: 'none'},
                     backgroundColor: { fill:'transparent' },
                     chartArea:{left:0,right:0, top:0, bottom:0}
            }
          });
          chart_donut.draw();
          create_legend(donut_data[0]+"_legend",donut_data[1],chart_donut.getOptions()["colors"],2)
}


function draw_table(table_data, format){
    if(format){
      var format_url = new google.visualization.PatternFormat('<a href="{1}" target="_blank">{0}</a>');
        // extract the third column for format_url variable
        var table_data_temp =  table_data[1]
        format_url.format(table_data_temp, [3,5]);
        empty_links = table_data_temp.getFilteredRows([{column:5,value:""}]);
        for(var i=0; i<empty_links.length;i++){
            table_data_temp.setFormattedValue(empty_links[i], 3, table_data[1].getValue(empty_links[i], 3));
        }
        var view = new google.visualization.DataView(table_data_temp);
    }else{
        var view = table_data[1];
    }
    view.hideColumns([5]);
    var cssClassNames = {
        'headerRow': '',
        'tableRow': '',
        'headerCell': 'bold m-1',
        'tableCell': '',
        'rowNumberCell': 'm-1',
        'hoverTableRow': ''
    };
    var tablePie = new google.visualization.ChartWrapper({
            chartType: 'Table',
            containerId: table_data[0],
            dataTable: view,
             options: {
                    'width': '100%',
                     backgroundColor: { fill:'transparent' },
                     alternatingRowStyle: false,
                     cssClassNames: cssClassNames,
                     allowHtml: true,
             }
          });
          tablePie.draw();
}