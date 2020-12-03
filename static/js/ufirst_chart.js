// Load the Visualization API and the controls package.
google.charts.load('current', {'packages':['corechart', 'controls','table']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawDashboard);

function drawDashboard() {
        // Create our data table.

        var main_data = new google.visualization.DataTable();
        main_data.addColumn('string', 'PROPOSAL ID'); //0
        main_data.addColumn('string', 'STATUS'); //1
        main_data.addColumn('string', 'REPORTING CATEGORY'); //2
        main_data.addColumn('string', 'TITLE'); //3
        main_data.addColumn('string', 'PI'); //4
        main_data.addColumn('string', 'DEPARTMENT'); //5
        main_data.addColumn('string', 'FUNDING SOURCE'); //6
        main_data.addColumn('number', 'TOTAL DIRECT'); //7
        main_data.addColumn('number', 'TOTAL INDIRECT'); //8
        main_data.addColumn('number', 'GRAND TOTAL');//9

        main_data_rows = result_data;
        main_data.addRows(main_data_rows);

        create_table_and_draw(main_data, true, 1)

        changeOptions = function(args,cat) {
            var total_proposals_updated = 0;
            var total_direct_updated = 0;
            var total_indirect_updated = 0;
            var grand_total_updated = 0;
            if(args==null){
                document.getElementById("reporting_category").value = "0";
                document.getElementById("status").value = "0";
                document.getElementById("pi").value = "0";
                document.getElementById("dept").value = "0";
                document.getElementById("total_proposals").innerHTML = total_proposals;
                document.getElementById("total_direct").innerHTML = total_direct;
                document.getElementById("total_indirect").innerHTML = total_indirect;
                document.getElementById("grand_total").innerHTML = grand_total;
            }
              category = document.getElementById("reporting_category").value;
              status = document.getElementById("status").value;
              pi = document.getElementById("pi").value;
              dept = document.getElementById("dept").value;
              filters = [];
               if(category!="0"){
                filters.push({column:2,value:category})
               }
               if(status!="0"){
                filters.push({column:1,value:status})
               }
               if(pi!="0"){
                filters.push({column:4,value:pi})
               }
               if(dept!="0"){
                filters.push({column:5,value:dept})
               }

          if(filters.length>0){
                main_data_temp = new google.visualization.DataTable();
                main_data_temp.addColumn('string', 'PROPOSAL ID'); //0
                main_data_temp.addColumn('string', 'STATUS'); //1
                main_data_temp.addColumn('string', 'REPORTING CATEGORY'); //2
                main_data_temp.addColumn('string', 'TITLE'); //3
                main_data_temp.addColumn('string', 'PI'); //4
                main_data_temp.addColumn('string', 'DEPARTMENT'); //5
                main_data_temp.addColumn('string', 'FUNDING SOURCE'); //6
                main_data_temp.addColumn('number', 'TOTAL DIRECT'); //7
                main_data_temp.addColumn('number', 'TOTAL INDIRECT'); //8
                main_data_temp.addColumn('number', 'GRAND TOTAL');//9

                rows = main_data.getFilteredRows(filters);
                   for(var i=0;i<rows.length;i++){
                        var row_idx = rows[i];
                        total_proposals_updated = total_proposals_updated + 1;
                        total_direct_updated = total_direct_updated + main_data_rows[row_idx][7];
                        total_indirect_updated = total_indirect_updated + main_data_rows[row_idx][8];
                        grand_total_updated = grand_total_updated + main_data_rows[row_idx][9];
                        main_data_temp.addRow(main_data_rows[row_idx]);
                   }
               create_table_and_draw(main_data_temp, false, cat)
               document.getElementById("total_proposals").innerHTML = total_proposals_updated;
               document.getElementById("total_direct").innerHTML = "$"+formatNumber(total_direct_updated);
               document.getElementById("total_indirect").innerHTML = "$"+formatNumber(total_indirect_updated);
               document.getElementById("grand_total").innerHTML = "$"+formatNumber(grand_total_updated);
          }else{
               create_table_and_draw(main_data, false, cat);
          }
        };
      }

function create_table_and_draw(data, fill_options, category){
       colors = ['#F28E2B', '#A0CBE8', '#4E79A7', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];

       if(fill_options){
            var reporting_category_id = document.getElementById("reporting_category");
            for(i=0; i<data.getDistinctValues(2).length; i++){
                var option = document.createElement("option");
                    option.text = data.getDistinctValues(2)[i];
                    option.value = data.getDistinctValues(2)[i];
                    reporting_category_id.add(option);
            }

            // fill status js
            var status = document.getElementById("status");
            for(i=0; i<data.getDistinctValues(1).length; i++){
                var option = document.createElement("option");
                    option.text = data.getDistinctValues(1)[i].slice(2, data.getDistinctValues(1)[i].length);
                    option.value = data.getDistinctValues(1)[i];
                    status.add(option);
            }
            var pi = document.getElementById("pi");
            for(i=0; i<data.getDistinctValues(4).length; i++){
                var option = document.createElement("option");
                    option.text = data.getDistinctValues(4)[i];
                    option.value = data.getDistinctValues(4)[i];
                    pi.add(option);
            }
             var dept = document.getElementById("dept");
            for(i=0; i<data.getDistinctValues(5).length; i++){
                var option = document.createElement("option");
                    option.text = data.getDistinctValues(5)[i];
                    option.value = data.getDistinctValues(5)[i];
                    dept.add(option);
            }
       }
       pie_data_1 = create_group(data,[category],0,"count");
       for (var i = 0; i < pie_data_1.getNumberOfRows(); i++) {
            pie_data_1.setCell(i,0,pie_data_1.getValue(i,0).slice(2, pie_data_1.getValue(i,0).length));
       }

       pie_data_2 = create_group(data,[2],0,"count");

       column_data_1 = create_group(data,[category],7,"sum");
       for (var i = 0; i < column_data_1.getNumberOfRows(); i++) {
            column_data_1.setCell(i,0,column_data_1.getValue(i,0).slice(2, column_data_1.getValue(i,0).length));
       }

       column_data_2 = create_group(data,[category],8,"sum");
        for (var i = 0; i < column_data_2.getNumberOfRows(); i++) {
            column_data_2.setCell(i,0,column_data_2.getValue(i,0).slice(2, column_data_2.getValue(i,0).length));
       }

       column_data_3 = create_group(data,[category],9,"sum");
        for (var i = 0; i < column_data_3.getNumberOfRows(); i++) {
            column_data_3.setCell(i,0,column_data_3.getValue(i,0).slice(2, column_data_3.getValue(i,0).length));
       }

        var column_data = new google.visualization.DataTable();
        column_data.addColumn('string', 'STATUS');
        column_data.addColumn('number', 'TOTAL DIRECT');
        column_data.addColumn('number', 'TOTAL INDIRECT');
        column_data.addColumn('number', 'GRAND TOTAL');
        rows = [];
        for (var i = 0; i < column_data_1.getNumberOfRows(); i++) {
                  rows.push([column_data_1.getValue(i,0),column_data_1.getValue(i,1),column_data_2.getValue(i,1),column_data_3.getValue(i,1)]);
        }
        column_data.addRows(rows);

       var table_view = new google.visualization.DataView(data);
       table_data = table_view.toDataTable();
        for (var i = 0; i < table_data.getNumberOfRows(); i++) {
                  table_data.setCell(i,1,table_data.getValue(i,1).slice(2, table_data.getValue(i,1).length));
        }


        draw_column_chart(['chart_column',column_data], colors)
        draw_donut(['chart_pie',pie_data_1], colors,3);
        draw_donut(['chart_pie_1',pie_data_2], colors,3);
        draw_table(['chart_table_1',table_data]);
}