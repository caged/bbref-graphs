(function main() {

  // Types of statistics that are suitable for graphing
  var STAT_TYPES = [
    'mp', 'fg', 'fga', 'fg%', '3p', '3pa', '3p%', 'ft', 'fta', 'ft%','orb',
    'drb', 'trb', 'ast', 'stl', 'blk', 'tov', 'pf', 'pts', 'gmsc', 'ts%',
    'efg%', 'orb%', 'drb%', 'trb%', 'ast%', 'stl%', 'blk%', 'tov%','usg%',
    'ortg', 'drtg'
  ]

  var INFO_TYPES = ['opp', 'date']

  // Helper for use in event bindings
  var bind = function(func, context) {
    return Function.prototype.bind.apply(func, [].slice.call(arguments, 1))
  }

  var format = d3.time.format('%Y-%m-%d')

  // Build or show the chart
  //
  // container - The container holding the table
  // table     - The statistics table
  function showChart(container, table) {
    var width = table.node().offsetWidth,
        height = 400

    if(table.node().querySelectorAll('tbody tr').length > 60)
      width = 1200

    table.style('display', 'none')

    if(container.select('div.graph').node() == null) {
      var data    = toData(table),
          player  = d3.select('#info_box p.margin_top span.bold_text').text().split(' '),
          name    = player[0] + " " + player[player.length - 1],
          stats   = d3.keys(data[0]).filter(function(d) { return d != 'info' }),
          padt    = 30, padr = 10, padb = 70, padl = 20,
          stat    = 'pts',
          curData = filterStat(stat, data),
          x       = d3.scale.ordinal().rangeRoundBands([0, width], 0.2),
          y       = d3.scale.linear().range([height, 0]),
          xAxis   = d3.svg.axis().scale(x).tickSize(8).tickFormat(function(i) {
            return d3.time.format('%m/%d')(curData[i][1].date) + ' ' + curData[i][1].opp
          }),
          yAxis   = d3.svg.axis().scale(y).orient("left").tickSize(-width + padl + padr)

      var path = d3.svg.line()
        .x(function(d, i) { return x(i) + x.rangeBand() / 2 })
        .y(function(d) { return y(d) })

      var div = container.append('div')
        .attr('class', 'graph')
        .style('width', width + padl + padr + 'px')
        .style('border', '1px solid #ccc')
        .style('padding', '0 0 0 10px')

      var h3 = div.append('h3')
        .style('padding', '10px')
        .style('border-bottom', '1px solid #ccc')
        .style('margin', 0)

      h3.append('span')
        .attr('class', 'player')
        .text(name + ": ")

      var subject = h3.append('span')
        .attr('class', 'subject')

      var select = h3.append('select')
        .style('float', 'right')

      select.selectAll('option')
          .data(stats)
      .enter().append('option')
        .text(function(d) { return d })
        .attr('selected', function(d) { return d == stat ? 'selected' : null })

      var vis = div.append('svg')
        .attr('class', 'bbref-chart')
        .attr('width', width + padl + padr)
        .attr('height', height + padt + padb)
      .append('g')
        .attr('transform', 'translate(' + padl + ',' + padt + ')')

      vis.append("g")
        .attr("class", "y axis")

      vis.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')

      vis.append('path')
        .attr('class', 'average')

      function render(entries, curstat) {
        var max = d3.max(entries, function(d) { return d[0] }),
            averages = rollingAverageForStat(entries)

        x.domain(d3.range(entries.length))
        y.domain([0, max * 1.1])

        vis.select('.y.axis').call(yAxis)
        vis.select('.x.axis').call(xAxis)
        vis.selectAll('.x.axis text')
          .attr('transform', 'translate(' + -((x.rangeBand() / 2) + 10) + ',30), rotate(-65)')
          .attr('text-anchor', 'end')

        subject.text(stat.toUpperCase())

        var bargroups = vis.selectAll('g.bar')
          .data(entries)

        var g = bargroups.enter().append('g')
          .attr('class', 'bar')
          .attr('transform', function(d, i) { return 'translate(' + x(i) + ',0)'})

        rect = g.append('rect')
          .attr('width', x.rangeBand())

        g.append('text')
          .attr('class', 'barlabel')
          .attr('text-anchor', 'middle')
          .attr('x', x.rangeBand() / 2)

        bargroups.select('rect')
          .attr('height', function(d) { return height - y(d[0])})
          .attr('y', function(d) { return y(d[0]) })

        bargroups.select('text')
          .text(function(d) { return d[0] })
          .style('display', function(d) {
            if(isNaN(d[0])) return 'none'
          })

        if(entries.length > 40) {
          bargroups.select('text')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'start')
            .attr('x', function(d) { return -y(d[0]) + 5 })
            .attr('y', (x.rangeBand() + 2) / 1.5 )
            //.attr('x', function(d) { return y(d[0]) - 5 })
          // g.select('text.barlabel')
          //   .attr('transform', 'translate(')
        } else {
          bargroups.select('text')
            .attr('y', function(d) { return y(d[0]) - 5 })
        }

        vis.select('path.average')
          .attr('d', path(averages))

        bargroups.exit().remove()
      }

      render(curData, stat)

      select.on('change', function(event) {
        stat = this.options[this.selectedIndex].text
        curData = filterStat(stat, data)

        render(curData, stat)
      })

    } else {
      container.select('div.graph')
        .style('display', 'block')
    }
  }

  function filterStat(stat, data) {
    return data.map(function(d) {
        return [d[stat], d.info]
     }).filter(function(d) { return d[0] != undefined && !isNaN(d[0]) })
  }

  // Hide the chart
  //
  // container - The container for the table
  // table     - The table holding the statistics
  function hideChart(container, table) {
    table.style('display', 'table')
    container.select('div.graph').style('display', 'none')
  }

  // Chart link was clicked
  //
  // link - the anchor element that triggered the event
  // event - the event object
  function onChartLinkClick(link, event) {
    event.preventDefault()
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

  function minutesToDecimal(val) {
    var mp = val.split(':').map(Number)
    return parseFloat(d3.format('.2f')(((mp[0] * 60) + mp[1]) / 60))
  }

  function percentageToNumber(val) {
    if(val == '') {
      val = NaN
    } else {
      if((/^\./).test(val) || parseFloat(val) == 1) {
        val = (parseFloat(val) * 100).toFixed(1)
      } else {
        val = parseFloat(val)
      }
    }

    return val
  }

  function rollingAverageForStat(entries) {
    var values = entries.map(function(d) { return d[0] }),
        averages = [],
        total    = 0.0
    values.forEach(function(val, idx) {
      total += parseFloat(val)
      averages.push(parseFloat(d3.format('.1f')(total / (idx + 1))))
    })

    return averages
  }
  // Build an array of objects from an HTML table
  //
  // table - d3 selection
  //
  // Returns an array or games [{game}, {game}, ...]
  function toData(table) {
    var dateidx = null,
        headers = table.selectAll('thead th'),
        rows    = table.selectAll('tbody tr'),
        data    = []

    headers.each(function(el, idx) {
      if(this.innerText.toLowerCase() == 'date')
        dateidx = idx + 1
    })

    // We want to have dates before we decide to continue
    if(!dateidx) {
      return console.log('No Date found in table')
    }

    // Get the stat labels
    var labels = headers.map(function(hdrs) {
      return hdrs.map(function(hdr) { return hdr.innerText.toLowerCase() })
    })[0]

    rows.each(function() {
      var obj = {}
      d3.select(this).selectAll('td').each(function(cell, idx) {
        var label = labels[idx],
            val = this.innerText

        if(STAT_TYPES.indexOf(label) != -1) {
          // convert minutes played to decimal
          if(label == 'mp') {
            val = minutesToDecimal(val)
          // Convert percentage decimals to integers
          } else if(label.indexOf('%') != -1) {
            val = percentageToNumber(val)
          // Floats strings to floats and number strings to numbers
          } else {
            val = val.indexOf('.') == -1 ? ~~val : parseFloat(val)
          }

          obj[label] = val
        } else if(INFO_TYPES.indexOf(label) != -1) {
          if(typeof obj.info == "undefined") obj.info = {}
          if(label == 'date') val = format.parse(val)
          obj.info[label] = val
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
    a.className = 'bbref-chart-link'
    a.addEventListener('click', bind(onChartLinkClick, heading, a))
    heading.appendChild(a)
  }

})()