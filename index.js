(function main() {

  var ALLOWED_TYPES = [
    'GS','MP', 'FG', 'FGA', 'FG%', '3P', '3PA', '3P%', 'FT', 'FTA', 'FT%',
    'ORB', 'DRB', 'TRB', 'AST', 'STL', 'BLK', 'TOV', 'PF', 'PTS', 'GmSc',
    'TS%', 'eFG%', 'ORB%', 'DRB%', 'TRB%', 'AST%', 'STL%', 'BLK%', 'TOV%',
    'USG%', 'ORtg', 'DRtg'
  ]

  // Helper for use in event bindings
  var bind = function(func, context) {
    return Function.prototype.bind.apply(func, [].slice.call(arguments, 1))
  }

  function showChart(container, table) {
    table.style('display', 'none')

    if(container.select('div.graph').node() == null) {
      container.insert('div')
        .attr('class', 'graph')
        .text('chart')
    } else {
      container.select('div.graph')
        .style('display', 'block')
    }
  }

  function hideChart(container, table) {
    table.style('display', 'table')
    container.select('div.graph').style('display', 'none')
  }

  // Chart link was clicked
  function onChartLinkClick(link, event) {
    var container = d3.select(this.parentNode),
        table     = container.select('.stats_table')

    if(table.style('display') == 'none') {
      hideChart.apply(this, [container, table, event])
      link.innerText = 'Chart'
    } else {
      showChart.apply(this, [container, table, event])
      link.innerText = 'Table'
    }
  }



  var headings = document.querySelectorAll('#basic_div .table_heading, #advanced_div .table_heading'),
      i = 0,
      len = headings.length

  for(i; i < len; i++) {
    var heading = headings[i]
        a = document.createElement('a')

    a.innerText = 'Chart'
    a.href = '#chart'
    a.addEventListener('click', bind(onChartLinkClick, heading, a))

    heading.appendChild(a)
  }

})()