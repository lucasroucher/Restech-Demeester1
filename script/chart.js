var defaultChartContainer = '#main';

var defaultChartWidth = 900;
var defaultChartHeight = 420;

var defaultGutterHeight = 50;

var margin = { top: 20, right: 20, bottom: 30, left: 50 };

var epsilon = 1;

var defaultYmin = 4;
var defaultYmax = 8.5;

var windowResized = true;
var actualWidth;

$(window).on('resize', function() {
    windowResized = true;
});

function chartData(study, options) {
    console.log('chartData');

    options = options || {};

    var data = window.DATA = study.data;

    var chartContainer = options.container || defaultChartContainer;

    // Give the browser some time to calculate the layout.
    setTimeout(drawChart, 100);

    function drawChart() {
        console.log('drawChart');

        clearChart(options);

        var chartWidth = options.width || defaultChartWidth;
        var chartHeight = options.height || defaultChartHeight;

        var width  = chartWidth - margin.left - margin.right;
        var height = chartHeight - margin.top - margin.bottom;

        var gutterHeight = options.gutterHeight || defaultGutterHeight;

        var x = getXScale();
        var y = getYScale();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickFormat(d3.time.format(options.xTickFormat || '%H:%M'));

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        function getXScale() {
            var x = d3.time.scale();
            x.domain(options.xDomain || d3.extent(data, function(d) { return d.when; }));
            x.range([ 0, width ]);
            x.nice();
            return x;
        }

        function getYScale() {
            var y = d3.scale.linear();
            if (options.showAllY) {
                y.domain(d3.extent(data, function (d) {
                    return d.val;
                }));
            } else if (options.yDomain) {
                y.domain(options.yDomain);
            } else {
                y.domain([ defaultYmin, defaultYmax ]);
            }
            y.range([ height - gutterHeight, 0 ]);
            return y;
        }

        var simplified = simplifyData();

        function simplifyData() {
            console.log('simplifyData');

            var timer = startTimer();

            var simplified = simplify(data.map(function(d) {
                // return [ x(d.when), y(d.val), d.val !== null ];
                return { x: x(d.when), y: y(d.val), n: d.val !== null };
            }), epsilon).map(function(p) {
                return [ p.x, p.y, p.n ];
            });

            timer('simplify time');

            console.log('data points before simplifying: ' + data.length);
            console.log('data points after simplifying: ' + simplified.length);

            return simplified;
        }

        var line = d3.svg.line();

        line.defined(function(d) {
            return d[2];
        });

        var svgElement = d3.select(chartContainer)
            .append('svg')
                .attr('viewBox', '0 0 ' + chartWidth + ' ' + chartHeight)
                .attr('preserveAspectRatio', 'none')
                .attr('width', chartWidth)
                .attr('height', chartHeight);

        var svg = svgElement
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var clip = svg.append('defs').append('svg:clipPath')
            .attr('id', 'clip')
            .append('svg:rect')
            .attr('id', 'clip-rect')
            .attr('x', '0')
            .attr('y', '0')
            .attr('width', width + margin.left)
            .attr('height', height - gutterHeight);

        addSeverity(y(6.5), y(8), 'normal');
        addSeverity(y(6), y(6.5), 'mild');
        addSeverity(y(5.5), y(6), 'moderate');
        addSeverity(height - gutterHeight, y(5.5), 'severe');

        function addSeverity(from, to, zone) {
            svg.append('rect')
                .attr('class', 'severity ' + zone)
                .attr('x', 0)
                .attr('y', to)
                .attr('width', width)
                .attr('height', from - to);
        }

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis)
        .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('pH');

        svg.selectAll('line.htick')
            .data(x.ticks(xAxis.ticks()[0] * 2))
          .enter().append('line')
            .attr('class', 'htick')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', height - gutterHeight);

        svg.selectAll('line.vtick')
            .data(y.ticks(yAxis.ticks()[0] * 2))
          .enter().append('line')
            .attr('class', 'vtick')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', y)
            .attr('y2', y);

        svg.append('g')
                .attr('clip-path', 'url(#clip)')
            .append('path')
                .datum(simplified)
                .attr('class', 'line')
                .attr('d', line);

        addRanges(study.supines, 'supine');
        addRanges(study.meals, 'meal');
        addRanges(study.coughPeriods, 'cough');
        addRanges(study.heartburnPeriods, 'heartburn');
        addRanges(study.symptoms[0], 'symptom1');
        addRanges(study.symptoms[1], 'symptom2');
        addRanges(study.symptoms[2], 'symptom3');

        function addRanges(ranges, type) {
            var topY = height - (gutterHeight - 2);
            var bottomY = height - 2;
            var checked = $('#legend [data-flag=' + type + ']').prop('checked');
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                var width = x(range.end.when) - x(range.start.when);
                svg.append('rect')
                    .attr({
                        class: 'flag ' + type,
                        x: x(range.start.when),
                        y: topY,
                        width: Math.max(width, 1),
                        height: bottomY - topY
                    })
                    .style('display', checked ? 'block' : 'none');
            }
        }

        if (options.interactive !== false) {
            var curRadius = 3;

            var cur = svg.append('circle')
                    .attr('class', 'cur')
                    .attr('r', curRadius);

            svg.append('rect')
                    .attr('class', 'sel');

            svgElement.append('rect')
                    .attr('class', 'overlay')
                    .attr('width', chartWidth)
                    .attr('height', chartHeight);

            var mouseIsDown = false;
            var mouseDownAt;
            var mouseLastAt;
            var firstDatumIndex;
            var lastDatumIndex;
            var lastClientX;

            $('rect.overlay')
                .on('mousedown', function(e) {
                    mouseIsDown = true;
                    mouseDownAt = mouseLastAt = getScaledOffsetX(e);
                    firstDatumIndex = lastDatumIndex = getClosestDatumIndexToMouse(e);
                    cur.style('display', 'none');
                    console.log('mouse down at: ' + mouseDownAt);
                })
                .on('mouseup', function(e) {
                    if (mouseIsDown) {
                        mouseLastAt = getScaledOffsetX(e);
                        lastDatumIndex = getClosestDatumIndexToMouse(e);
                        updateSel();
                        mouseIsDown = false;
                        console.log('mouse up at: ' + mouseLastAt);
                        console.log(getSel());
                    }
                })
                .on('mousemove', function(e) {
                    if (e.clientX === lastClientX) {
                        return;
                    }

                    lastClientX = e.clientX;

                    mouseLastAt = getScaledOffsetX(e);
                    lastDatumIndex = getClosestDatumIndexToMouse(e);

                    var datum = data[lastDatumIndex];

                    if (datum) {
                        if (mouseIsDown) {
                            updateSel();
                        } else {
                            var when = datum.when;
                            var pH = datum.val;

                            if (pH !== null) {
                                $('#message').text(pH.toFixed(2) + ' pH at ' + d3.time.format('%a %b %e %Y %H:%M:%S')(when));
                            }

                            if (cur.style('display') !== '') {
                                cur.style('display', '');
                            }

                            cur.attr('cx', x(when));
                            cur.attr('cy', y(pH));
                        }
                    }
                })
                .on('mouseout', function(e) {
                    if (mouseIsDown) {
                        if (mouseLastAt < mouseDownAt) {
                            mouseLastAt = 0;
                            lastDatumIndex = 0;
                        } else {
                            mouseLastAt = width;
                            lastDatumIndex = data.length - 1;
                        }
                        updateSel();
                        mouseIsDown = false;
                        console.log('mouseout');
                    }
                    cur.style('display', 'none');
                });

            updateLeftRight(data);
        }

        function getScaledOffsetX(e) {
            if (windowResized) {
                actualWidth = $(e.target).get(0).getBoundingClientRect().width;
                //actualWidth = $(e.target).offsetParent().width();
                widthFactor = chartWidth / actualWidth;
                console.log('actualWidth: ' + actualWidth, ', widthFactor: ' + widthFactor);
                windowResized = false;
            }

            return e.offsetX * widthFactor - margin.left;
        }

        function updateSel() {
            var left = Math.min(firstDatumIndex, lastDatumIndex);
            var right = Math.max(firstDatumIndex, lastDatumIndex);
            leftDatumIndex = left;
            rightDatumIndex = right;

            var selLeft = Math.min(mouseDownAt, mouseLastAt);
            var selRight = Math.max(mouseDownAt, mouseLastAt);

            selLeft = Math.max(selLeft + margin.left, margin.left);
            selRight = Math.min(selRight, width) + margin.left;

            $('.sel').attr('x', selLeft - margin.left)
                     .attr('y', 0)
                     .attr('width', Math.max(0, selRight - selLeft))
                     .attr('height', height);

            if (selLeft < selRight) {
                var count = d3.format('n')(rightDatumIndex - leftDatumIndex + 1);
                var start = d3.time.format('%X')(data[leftDatumIndex].when);
                var end = d3.time.format('%X')(data[rightDatumIndex].when);
                $('#message').text('From  ' + start + '  To ' + end);
            } else {
                $('#message').text('');
            }
        }

        function getClosestDatumIndexToMouse(e) {
            var offsetX = getScaledOffsetX(e);

            var when;
            var leftOrRight = 1;

            if (offsetX < 0) {
                when = data[0].when;
            } else if (offsetX >= width) {
                when = data[data.length - 1].when;
                leftOrRight = 0;
            } else {
                when = x.invert(offsetX);
            }

            var bisect = d3.bisector(function(d) { return d.when; });
            return bisect[leftOrRight ? 'left' : 'right'](data, when) - (leftOrRight ? 0 : 1);
        }
    }
}

function updateLeftRight(data) {
    if (data.length >= 2) {
        $('#start').text(d3.time.format('%a %b %e %Y %H:%M:%S')(data[0].when));
        $('#end').text(d3.time.format('%a %b %e %Y %H:%M:%S')(data[data.length - 1].when));
    }
}

function toggleFlags(type, show) {
    $('rect.' + type).toggle(show);
}

function clearChart(options) {
    options = options || {};
    var container = options.container || defaultChartContainer;
    $(container).find('svg').remove();
    // $('#message').empty();
    // leftDatumIndex = rightDatumIndex = undefined;
}

var leftDatumIndex;
var rightDatumIndex;

function getSel() {
    if (leftDatumIndex === undefined || rightDatumIndex === undefined) {
        return null;
    }
    return {
        left: leftDatumIndex,
        right: rightDatumIndex
    };
}

function clearSel() {
    leftDatumIndex = undefined;
    rightDatumIndex = undefined;
}
