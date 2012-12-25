(function main() {

  var ALLOWED_TYPES = [
    'mp', 'fg', 'fga', 'fg%', '3p', '3pa', '3p%', 'ft', 'fta', 'ft%','orb',
    'drb', 'trb', 'ast', 'stl', 'blk', 'tov', 'pf', 'pts', 'gmsc', 'ts%',
    'efg%', 'orb%', 'drb%', 'trb%', 'ast%', 'stl%', 'blk%', 'tov%','usg%',
    'ortg', 'drtg'
  ]

  var DATE_LABEL = 'date'

  // Helper for use in event bindings
  var bind = function(func, context) {
    return Function.prototype.bind.apply(func, [].slice.call(arguments, 1))
  }

  function showChart(container, table) {
    table.style('display', 'none')

    if(container.select('div.graph').node() == null) {
      div = container.insert('div')
        .attr('class', 'graph')
        .style('height', '500px')

      select = div.append('select')

      container.selectAll('thead th')
        .each(function(idx) {
          var stat = this.innerText
          if(ALLOWED_TYPES.indexOf(stat.toLowerCase()) != -1) {
            select.append('option')
              .attr('data-index', idx)
              .text(stat)
          }
        })

      // var dateidx = null
      // table.selectAll('thead th').each(function(el, idx) {
      //   if(this.innerText.toLowerCase() == DATE_LABEL)
      //     dateidx = idx + 1
      // })

      // var dates = table.selectAll('tbody td:nth-child(' + dateidx + ')')
      //   .map(function(els) {
      //     return els.map(function(el) { return el.innerText })
      //   })

      // console.log(dates)

      console.log(toData(table))

      var vis = div.select('.chart')
        .enter().append('svg')
          .attr('class', 'chart')

      select.on('change', function(event) {

      })

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

  function toData(table) {
    var dateidx = null,
        headers = table.selectAll('thead th'),
        rows    = table.selectAll('tbody tr'),
        data    = []

    headers.each(function(el, idx) {
      if(this.innerText.toLowerCase() == DATE_LABEL)
        dateidx = idx + 1
    })

    if(!dateidx) {
      console.log('No Date found in table')
      return
    }

    var labels = headers.map(function(hdrs) {
      return hdrs.map(function(hdr) { return hdr.innerText.toLowerCase() })
    })[0]

    rows.each(function() {
      var obj = {}
      d3.select(this).selectAll('td').each(function(cell, idx) {
        var label = labels[idx]
        if(ALLOWED_TYPES.indexOf(label) != -1) {
          var val = this.innerText

          if(label == 'mp') {
            var mp = val.split(':').map(Number),
                val = parseFloat(d3.format('.2f')(((mp[0] * 60) + mp[1]) / 60))
          } else {
            val = val.indexOf('.') == -1 ? ~~val : parseFloat(val)
          }

          obj[label] = val
        }
      })
      data.push(obj)
    })

    return data
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