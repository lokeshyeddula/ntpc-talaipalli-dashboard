function preventBack() {
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", function () {
        window.history.pushState(null, "", window.location.href);
    });
}

preventBack();

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/dashboard/production-data");
        if (!response.ok) throw new Error("Failed to fetch production data.");
        const data = await response.json();

        console.log("Production Data:", data);
        const StrippingRatioSinceInception=data.inception_ob/data.inception_coal;

        document.getElementById("coal-yearly-kpi-card").textContent = Math.round(data.yearly_coal) + " Tons";
        document.getElementById("ob-yearly-kpi-card").textContent = Math.round(data.yearly_ob) + " m³";
        document.getElementById("coal-since-inception-kpi-card").textContent = (data.inception_coal / 1e6).toFixed(2) + " M Tons";
        document.getElementById("ob-since-inception-kpi-card").textContent = (data.inception_ob / 1e6).toFixed(2) + " Mm³";

        document.getElementById("StrippingRatio-since-inception-kpi-card").textContent = StrippingRatioSinceInception.toFixed(2);



        const pitWiseCanvas = document.getElementById("pit-wise-coal-bar-chart");
        const pitWiseCtx = pitWiseCanvas?.getContext("2d");

        // Set canvas size based on container
        if (pitWiseCanvas) {
            pitWiseCanvas.width = pitWiseCanvas.offsetWidth;
            pitWiseCanvas.height = pitWiseCanvas.offsetHeight;
        }

        if (data.pitWiseCoal && pitWiseCtx) {
            const financialYears = [...new Set(data.pitWiseCoal.map(pit => pit.financial_year))];
            const pits = [...new Set(data.pitWiseCoal.map(pit => pit.pit))];
            const pitColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFC733", "#A833FF", "#33FFF5"];

            let barChart;

            const updateChart = (selectedYear) => {
                const filteredYears = selectedYear ? [selectedYear] : financialYears;

                const datasets = pits.map((pitName, index) => ({
                    label: pitName,
                    data: filteredYears.map(year => {
                        const entry = data.pitWiseCoal.find(p => p.financial_year === year && p.pit === pitName);
                        return entry ? entry.yearly_total_coal / 1e6 : 0;
                    }),
                    backgroundColor: pitColors[index % pitColors.length],
                    borderWidth: 1
                }));

                if (barChart) barChart.destroy();

                barChart = new Chart(pitWiseCtx, {
                    type: 'bar',
                    data: {
                        labels: filteredYears,
                        datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: { display: true, text: "Financial Year" },
                                grid: { display: false },
                                barPercentage: 0.8,
                                categoryPercentage: 0.6
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Total Coal Production (M Tons)" },
                                grid: { display: false }
                            }
                        },
                        plugins: {
                            legend: { position: 'top' }
                        }
                    }
                });
            };

            updateChart();

            const selectElement = document.getElementById("financial-year-select");
            financialYears.forEach(year => {
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                selectElement.appendChild(option);
            });

            selectElement.addEventListener("change", (event) => {
                updateChart(event.target.value);
            });

            // Optional: resize handler
            window.addEventListener('resize', () => {
                if (barChart) barChart.resize();
            });
        } else {
            console.warn("No pit-wise coal data available.");
        }
    } catch (error) {
        console.error("Error loading chart data:", error);
    }
});

// Dark mode toggle
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeBtn.querySelector('i');
        icon.classList.toggle('fa-sun');
        icon.classList.toggle('fa-moon');
    });
}


var points = 450;
var maxPoints = 600;
var percent = points / maxPoints * 100;
var ratio = percent / 100;
var pie = d3.layout
  .pie()
  .value(function(d) {
    return d;
  })
  .sort(null);
var w = 150,
  h = 150;
var outerRadius = w / 2 - 10;
var innerRadius = 75;
var color = ["#ececec", "rgba(156,78,176,1)", "#888888"];
var colorOld = "#F00";
var colorNew = "#0F0";
var arc = d3.svg
  .arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius)
  .startAngle(0)
  .endAngle(Math.PI);

var arcLine = d3.svg
  .arc()
  .innerRadius(innerRadius)
  .outerRadius(outerRadius)
  .startAngle(0);

var svg = d3
  .select("#loyalty")
  .append("svg")
  .attr({
    width: w,
    height: h,
    class: "shadow"
  })
  .append("g")
  .attr({
    transform: "translate(" + w / 2 + "," + h / 2 + ")"
  });

var path = svg
  .append("path")
  .attr({
    d: arc,
    transform: "rotate(-90)"
  })
  .style({
    fill: color[0]
  });

var pathForeground = svg
  .append("path")
  .datum({ endAngle: 0 })
  .attr({
    d: arcLine,
    transform: "rotate(-90)"
  })
  .style({
    fill: function(d, i) {
      return color[1];
    }
  });

var middleCount = svg
  .append("text")
  .datum(0)
  .text(function(d) {
    return d;
  })
  .attr({
    class: "middleText",
    "text-anchor": "middle",
    dy: 0,
    dx: 5
  })
  .style({
    fill: d3.rgb("#000000"),
    "font-size": "36px"
  });

var oldValue = 0;
var arcTween = function(transition, newValue, oldValue) {

  transition.attrTween("d", function(d) {
    var interpolate = d3.interpolate(d.endAngle, Math.PI * (newValue / 100));
    var interpolateCount = d3.interpolate(oldValue, newValue);

    return function(t) {
      d.endAngle = interpolate(t);
      // change percentage to points before rendering text
      middleCount.text(Math.floor(interpolateCount(t)/100*maxPoints));

      return arcLine(d);
    };
  });
};

pathForeground
  .transition()
  .duration(750)
  .ease("cubic")
  .call(arcTween, percent, oldValue, points);