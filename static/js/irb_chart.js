// Load the Visualization API and the controls package.
google.charts.load('current', {'packages':['corechart', 'controls','table']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawDashboard);

function drawDashboard() {
    var main_data = new google.visualization.DataTable();

    main_data.addColumn('string', 'IRB');//0
    main_data.addColumn('string', 'IRB COMMITTEE');//1
    main_data.addColumn('string', 'STATUS');//2
    main_data.addColumn('string', 'REPORTING CATEGORY');//3
    main_data.addColumn('string', 'REVIEW TYPE');//4
    main_data.addColumn('string', 'PI');//5
    main_data.addColumn('number', 'IRB SUBMISSIONS YEAR');//6
    main_data.addColumn('number', 'IRB SUBMISSIONS MONTH');//7


    main_data_rows = getRowsForTable(result_data, null);
    main_data.addRows(main_data_rows);

    create_table_and_draw(main_data, true,1);

    changeOptions = function(args,cat) {
          if(cat==null){
            current_pill = document.getElementsByClassName("nav-link font-weight-normal active");
            cat = current_pill[0].id;
            cat = parseInt(cat);
          }
          if(args==0){
            document.getElementById("reporting_category").value = "";
            document.getElementById("status").value="";
            document.getElementById("review_type").value="";
            document.getElementById("committee").value="";
            document.getElementById("range_start").value="";
            document.getElementById("range_end").value="";
            document.getElementById("pi").value="";
          }
           document.getElementById("1").classList.remove('active');
           document.getElementById("3").classList.remove('active');
           var picked = document.getElementById(""+cat);
           picked.classList.add('active');

          category = document.getElementById("reporting_category").value;
          status = document.getElementById("status").value;
          review_type = document.getElementById("review_type").value;
          committee = document.getElementById("committee").value;
          range_start = document.getElementById("range_start").value;
          range_end = document.getElementById("range_end").value;
          pi = document.getElementById("pi").value;

          filters = [];
          if(committee!=null&&committee!=""){
                filters.push([1,committee]);
          }

          if(status!=null&&status!=""){
                filters.push([2,status]);
          }

          if(category!=null&&category!=""){
                filters.push([3,category]);
          }

          if(review_type!=null&&review_type!=""){
                filters.push([4,review_type]);
          }
          if(pi!=null&&pi!=""){
                filters.push([5,pi]);
          }


          if(range_start!=null && range_start!=""){
            range_start = range_start.split("-");
            start_year= parseInt(range_start[0]);
            start_month = parseInt(range_start[1]);
            if(start_year!=null&&start_month!=null){
                filters.push([7,6,0,start_year,start_month]);
            }
             if(range_end!=null && range_end!=""){
                range_end = range_end.split("-");
                end_year= parseInt(range_end[0]);
                end_month = parseInt(range_end[1]);

                if(end_year!=null&&end_month!=null){
                  if(end_year>=start_year){
                      if(end_year == start_year){
                        if(end_month>start_month){
                            filters.push([7,6,1,end_year,end_month]);
                        }
                      }else{
                        filters.push([7,6,1,end_year,end_month]);
                      }
                  }
                }
              }
          }
          if(main_data.getNumberOfRows()>0){
            main_data.removeRows(0, main_data.getNumberOfRows());
          }
          if(filters.length>0){
            main_data_rows = getRowsForTable(result_data, filters);
          }else{
             main_data_rows = getRowsForTable(result_data, null);
          }
          main_data.addRows(main_data_rows);
          create_table_and_draw(main_data, false,cat,3);
     };
}

function create_table_and_draw(data, fill_options, categorize){
        colors = ['#F28E2B', '#A0CBE8', '#4E79A7', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];

        if(fill_options){
            var committee = document.getElementById("committee");
            for(i=0; i<data.getDistinctValues(1).length; i++){
                if(data.getDistinctValues(1)[i]!=""){
                      var option = document.createElement("option");
                        option.text = data.getDistinctValues(1)[i];
                        option.value = data.getDistinctValues(1)[i];
                        committee.add(option);
                }
            }
            var status = document.getElementById("status");
            for(i=0; i<data.getDistinctValues(2).length; i++){
                        if(data.getDistinctValues(2)[i]!=""){
                              var option = document.createElement("option");
                                option.text = data.getDistinctValues(2)[i];
                                option.value = data.getDistinctValues(2)[i];
                                status.add(option);
                        }
             }

             var reporting_category = document.getElementById("reporting_category");
             for(i=0; i<data.getDistinctValues(3).length; i++){
                    if(data.getDistinctValues(3)[i]!=""){
                          var option = document.createElement("option");
                           option.text = data.getDistinctValues(3)[i];
                           option.value = data.getDistinctValues(3)[i];
                           reporting_category.add(option);
                    }
              }

            var review_type = document.getElementById("review_type");
             for(i=0; i<data.getDistinctValues(4).length; i++){
                    if(data.getDistinctValues(4)[i]!=""){
                          var option = document.createElement("option");
                            option.text = data.getDistinctValues(4)[i];
                            option.value = data.getDistinctValues(4)[i];
                            review_type.add(option);
                    }
              }

              var pi = document.getElementById("pi");
            for(i=0; i<data.getDistinctValues(5).length; i++){
                        if(data.getDistinctValues(5)[i]!=""){
                              var option = document.createElement("option");
                                option.text = data.getDistinctValues(5)[i];
                                option.value = data.getDistinctValues(5)[i];
                                pi.add(option);
                        }
             }

        }

        var summary_snapshot = create_group(data,[categorize],0,"count");

        var timeline_1 = create_group(data,[7,6,categorize],0,"count");
        var timeline_data_1 = create_line_table(timeline_1);

        var total_count = 0;
        for(var i=0;i<summary_snapshot.getNumberOfRows(); i++){
            total_count = total_count + summary_snapshot.getValue(i,1);
        }
        document.getElementById("total_count").innerHTML = total_count;


        var table_data = new google.visualization.DataView(data);
        table_data = table_data.toDataTable();
        for(var i=0; i<table_data.getNumberOfRows();i++){
            table_data.setFormattedValue(i, 6, table_data.getValue(i, 6).toString());
            table_data.setFormattedValue(i, 7, table_data.getValue(i, 7).toString());
        }
        empty_links = table_data.getFilteredRows([{column:7,value:0}]);
        for(var i=0; i<empty_links.length;i++){
            table_data.setFormattedValue(empty_links[i], 6,"");
            table_data.setFormattedValue(empty_links[i], 7,"");
        }
        var format_dates = new google.visualization.PatternFormat('{1}-{0}');
        format_dates.format(table_data, [7,6]);
        table_data.removeColumn(6);
        table_data.sort([{column: 1}, {column: 6},{column: 2}]);
        draw_donut(["chart_pie", summary_snapshot],colors);
        draw_table(['chart_table_1',table_data]);
        draw_line(['chart_line_1',timeline_data_1],colors);

}


function draw_donut(donut_data, color_data){
          if(color_data.length==0){
            color_data =['#F28E2B', '#A0CBE8', '#4E79A7', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];
          }
          var chart_donut = new google.visualization.ChartWrapper({
            chartType: 'PieChart',
            containerId: donut_data[0],
            dataTable: donut_data[1],
            options: {
                     width:'100%',
                     colors: color_data,
                     pieSliceText: 'value',
                     legend: { position: 'none'},
                     chartArea:{left:0,right:0, top:0, bottom:0}
            }
          });
          chart_donut.draw();
          create_legend(donut_data[0]+"_legend",donut_data[1],chart_donut.getOptions()["colors"],2)
}

function draw_line(data,color_data){
          if(color_data.length==0){
            color_data =['#F28E2B', '#A0CBE8', '#4E79A7', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];
          }

          var chart = new google.visualization.ChartWrapper({
            chartType: 'BarChart',
            containerId: data[0],
            dataTable: data[1],
            width: '100%',
            height: 500,
            bar: { groupWidth: 180 },
            options: {
              colors: color_data,
              isStacked: true,
              legend: { position: 'none',alignment:"center",maxLines:3},
              chartArea:{left:80,right:0, top:0, bottom:25}
            }
          });
          create_column_legend(data[0]+"_legend",data[1],chart.getOptions()["colors"],2);
          chart.draw();
}

function create_line_table(group_table){;
    var timeline_data = new google.visualization.DataTable();
     timeline_data.addColumn('string', 'IRB Submissions');
      for(i=0; i<group_table.getDistinctValues(2).length; i++){
            if(group_table.getDistinctValues(2)[i]!=""){
                timeline_data.addColumn('number', group_table.getDistinctValues(2)[i]);
            }
       }
       timeline_data_rows = [];
       for(i=0; i<group_table.getNumberOfRows(); i++){
            if(group_table.getValue(i,1)!=0){
                timeline_data_row = [""];
                for(j=0; j<timeline_data.getNumberOfColumns()-1; j++){
                  timeline_data_row.push(0);
                }
                month = group_table.getValue(i,1)
                if(group_table.getValue(i,1)<10){
                  month = "0"+group_table.getValue(i,1);
                }
                timeline_data_row[0]=group_table.getValue(i,0)+"-"+month;
                for(j=1; j<timeline_data.getNumberOfColumns(); j++){
                    if(group_table.getValue(i,2) == timeline_data.getColumnLabel(j)){
                        timeline_data_row[j]=group_table.getValue(i,3);
                        if(i<group_table.getNumberOfRows()-1){
                                i++;
                                month = group_table.getValue(i,1);
                                if(group_table.getValue(i,1)<10){
                                  month = "0"+group_table.getValue(i,1);
                                }
                                compare=group_table.getValue(i,0)+"-"+month;
                                if(compare!= timeline_data_row[0]){
                                    i--;
                                    break;
                                }
                        }
                    }
                }
                timeline_data_rows.push(timeline_data_row);
            }
        }
     timeline_data.addRows(timeline_data_rows);
     return timeline_data;
}

function getRowsForTable(read_from, filters){
    rows_length = read_from.length-1;
    rows_temp = []
    var proceed = true;
    if(filters != null){
        proceed = false;
    }
    for(var i=1;i<read_from.length;i++){
        if(filters != null){
            for(var j=0;j<filters.length;j++){
                if(filters[j][0]>=6){
                    if(filters[j][2]==0){
                         if(read_from[i][filters[j][0]]>=filters[j][3]){
                            if(read_from[i][filters[j][0]]==filters[j][3]){
                                if(read_from[i][filters[j][1]]>=filters[j][4]){
                                    proceed = true;
                                 }else{
                                    proceed = false;
                                    break;
                                 }
                            }else{
                             proceed = true;
                            }
                         }else{
                            proceed = false;
                            break;
                        }
                    }else{
                       if(read_from[i][filters[j][0]]<=filters[j][3]){
                             if(read_from[i][filters[j][0]]==filters[j][3]){
                                if(read_from[i][filters[j][1]]<=filters[j][4]){
                                    proceed = true;
                                 }else{
                                    proceed = false;
                                    break;
                                 }
                            }else{
                             proceed = true;
                            }
                         }else{
                            proceed = false;
                            break;
                        }
                    }
                }else{
                    if(read_from[i][filters[j][0]]==filters[j][1]){
                        proceed = true;
                    }else{
                        proceed = false;
                        break;
                    }
                }
            }
        }
        if(proceed){
              row = [];
              row.push(read_from[i][0]);
              row.push(read_from[i][1]);
              row.push(read_from[i][2]);
              row.push(read_from[i][3]);
              row.push(read_from[i][4]);
              row.push(read_from[i][5]);
              row.push(read_from[i][6]);
              row.push(read_from[i][7]);
              rows_temp.push(row);
        }
    }
    return rows_temp;
}