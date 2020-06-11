function formatNumber(num) {
       return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function create_group(data_to_group, group_by_arr, index,op_type){
       if(op_type=="sum"){
            var group_temp = google.visualization.data.group(
              data_to_group,
              group_by_arr,
              [{'column': index, 'aggregation': google.visualization.data.sum, 'type': 'number'}]
            );
        }else{
             var group_temp = google.visualization.data.group(
              data_to_group,
              group_by_arr,
              [{'column': index, 'aggregation': google.visualization.data.count, 'type': 'number'}]
            );
        }
  return  group_temp;
}

function create_group(data_to_group, group_by_arr, index,op_type){
       if(op_type=="sum"){
            var group_temp = google.visualization.data.group(
              data_to_group,
              group_by_arr,
              [{'column': index, 'aggregation': google.visualization.data.sum, 'type': 'number'}]
            );
        }else{
             var group_temp = google.visualization.data.group(
              data_to_group,
              group_by_arr,
              [{'column': index, 'aggregation': google.visualization.data.count, 'type': 'number'}]
            );
        }
  return  group_temp;
}

String.prototype.format = function () {
          var i = 0, args = arguments;
          return this.replace(/{}/g, function () {
            return typeof args[i] != 'undefined' ? args[i++] : '';
          });
};

function create_legend(legend_id,table_result, colors_legend,split){
        var result = '<table class="table table-sm border rounded"><tbody><tr class="m-0 p-0">';
        var string = '<td class="m-0 p-0"><span class="badge text-white p-1 m-1" style="background-color:{}">{}</span><span class="h6">{}</span></td>';
        table_result_len = table_result.getNumberOfRows();
        for(var i=0;i<table_result_len;i++){
            if(i%split==0){
             result = result +"</tr>";
             result = result +"<tr>";
            }
            result = result + string.format(colors_legend[i],table_result.getValue(i,1),table_result.getValue(i,0));
        }
        if(table_result.getNumberOfRows()%split!=0){
            result = result+"<td></td>";
        }
        result = result+"</tr></tbody></table>";
        document.getElementById(legend_id).innerHTML=result;
}

function create_column_legend(legend_id,table_result, colors_legend,split){
        var result = '<table class="table border rounded table-sm"><tbody><tr class="m-0 p-0">';
        var string = '<td class="m-0 p-0"><span class="badge text-white p-1 m-1" style="background-color:{}">{}</span><span class="h6">{}</span></td>';
        table_result_len = table_result.getNumberOfRows();
        result_numbers=[];
        for(var color_idx=0;color_idx<table_result.getNumberOfColumns()-1;color_idx++){
            result_numbers.push(0);
         }
        for(var i=0;i<table_result_len;i++){
            for(var color_idx=0;color_idx<table_result.getNumberOfColumns()-1;color_idx++){
                result_numbers[color_idx] =  result_numbers[color_idx]+table_result.getValue(i,color_idx+1);
             }
        }
        for(var color_idx=0;color_idx<table_result.getNumberOfColumns()-1;color_idx++){
            if(color_idx%split==0){
             result = result +"</tr>";
             result = result +"<tr>";
            }
            result = result + string.format(colors_legend[color_idx],formatNumber(result_numbers[color_idx]),table_result.getColumnLabel(color_idx+1));
        }
        if((table_result.getNumberOfColumns()-1)%split!=0){
            result = result+"<td></td>";
        }
        result = result+"</tr></tbody></table>";
        document.getElementById(legend_id).innerHTML=result;
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
                if(filters[j][0]>=5){
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
              row.push(read_from[i][7]);
              row.push(read_from[i][5]);
              row.push(read_from[i][10]);
              row.push(read_from[i][8]);
              rows_temp.push(row);
        }
    }
    return rows_temp;
}


function draw_table(table_data){
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
            dataTable: table_data[1],
             options: {
                    backgroundColor: { fill:'transparent' },
                    'width': '100%',
                     alternatingRowStyle: false,
                     cssClassNames: cssClassNames,
                     allowHtml: true,
             }
          });
    tablePie.draw();
}


function draw_donut(donut_data, color_data, split){
          if(color_data.length==0){
            color_data =['#F28E2B', '#A0CBE8', '#4E79A7', '#FFBE7D', '#59A14F', '#8CD17D', '#B6992D', '#F1CE63', '#499894', '#86BCB6', '#E15759', '#FF9D9A', '#79706E', '#BAB0AC', '#D37295', '#FABFD2', '#B07AA1', '#D4A6C8', '#9D7660', '#D7B5A6'];
          }
          var chart_donut = new google.visualization.ChartWrapper({
            chartType: 'PieChart',
            containerId: donut_data[0],
            dataTable: donut_data[1],
            options: {
                     width:'100%',
                     backgroundColor: { fill:'transparent' },
                     colors: color_data,
                     pieSliceText: 'value',
                     legend: { position: 'none'},
                     chartArea:{left:0,right:0, top:0, bottom:0}
            }
          });
          chart_donut.draw();
          create_legend(donut_data[0]+"_legend",donut_data[1],chart_donut.getOptions()["colors"],split);
}

function draw_column_chart(column_data, color_data){
    var columnChart = new google.visualization.ChartWrapper({
            chartType: 'ColumnChart',
            containerId: column_data[0],
            dataTable: column_data[1],
            options: {
                'width': '100%',
                lineWidth: 4,
                backgroundColor: { fill:'transparent' },
                colors: color_data,
                intervals: { 'style':'line' },
                legend: {position:'none',maxLines:3,alignment:'center'},
                chartArea:{left:100,bottom:30,right:10, top:10},
                hAxis:{gridLines:column_data[1].getNumberOfColumns()}
            }
          });
          columnChart.draw();
          create_column_legend(column_data[0]+"_legend",column_data[1],columnChart.getOptions()["colors"],3);
}
