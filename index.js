(function main() {

  // Types of statistics that are suitable for graphing
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

  // Build or show the chart
  //
  // container - The container holding the table
  // table     - The statistics table
  function showChart(container, table) {
    var width = table.node().offsetWidth,
        height = 500

    table.style('display', 'none')

    if(container.select('div.graph').node() == null) {
      var data = toData(table),
          stats = d3.keys(data[0]),
          padt = 10, padr = 0, padb = 10, padl = 40,
          stat = ALLOWED_TYPES[Math.floor(Math.random() * ALLOWED_TYPES.length)],
          curData = data.map(function(d) { return d[stat] })
            .filter(function(d) { return d != undefined })

      var div = container.append('div')
        .attr('class', 'graph')
        .style('width', width + padl + padr + 'px')
        .style('border', '1px solid #ccc')

      var h3 = div.append('h3')
        .text(stat.toUpperCase())
        .style('padding', '10px')
        .style('border-bottom', '1px solid #ccc')
        .style('margin', 0)

      var select = h3.append('select')
        .style('float', 'right')

      select.selectAll('option')
          .data(stats)
      .enter().append('option')
        .text(function(d) { return d })

      var vis = div.append('svg')
        .attr('class', 'bbref-chart')
        .attr('width', width + padl + padr)
        .attr('height', height + padt + padb)
      .append('g')
        .attr('transform', 'translate(' + padl + ',' + padt + ')')

      function render(entries, curstat) {
        var max = d3.max(entries)
        var x = d3.scale.ordinal().domain(d3.range(entries.length)).rangeRoundBands([0, width - padl - padr], 0.1)
        var y = d3.scale.linear().domain([0, max]).range([height, 0])

        var xAxis = d3.svg.axis().scale(x).tickSize(8)
        var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(-width + padl + padr)

        yg = vis.append("g")
          .attr("class", "y axis")
          .call(yAxis)

        yg.selectAll('.y.axis line')
          .style('stroke', '#eee')
          .style('stroke-width', 1)

        yg.selectAll('.y.axis text')
          .style('fill', '#777')
          .style('font-family', 'Helvetica Neue, Helvetica, sans-serif')
          .style('font-size', '12px')

        var bargroups = vis.selectAll('g.bar')
          .data(entries)

        bargroups.exit().remove()
        bargroups.enter().append('g')
          .attr('transform', function(d, i) { return 'translate(' + x(i) + ',0)'})
          .attr('class', 'bar')

        rects = bargroups.append('rect')
          .attr('width', x.rangeBand())
          .attr('height', function(d) { return height - y(d)})
          .attr('y', function(d) { return y(d) })
          .style('fill', 'green')
          .style('fill-opacity', 0.5)
          .style('stroke', 'green')
          .style('stroke-width', 1)

        vis.select('path.domain')
          .style('display', 'none')
      }

      render(curData, stat)

      select.on('change', function(event) {
        stat = this.options[this.selectedIndex].text
        curData = data.map(function(d) { return d[stat] })
          .filter(function(d) { return d != undefined })

        h3.text(stat)
        render(curData, stat)
      })

    } else {
      container.select('div.graph')
        .style('display', 'block')
    }
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

          // convert minutes played to decimal
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