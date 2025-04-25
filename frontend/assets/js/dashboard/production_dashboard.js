document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/dashboard/production-data");
        if (!response.ok) throw new Error("Failed to fetch production data.");
        const data = await response.json();

        const StrippingRatioSinceInception = data.inception_ob / data.inception_coal;

        document.getElementById("coal-yearly-kpi-card").textContent = Math.round(data.yearly_coal) + " Tons";
        document.getElementById("ob-yearly-kpi-card").textContent = Math.round(data.yearly_ob) + " m³";
        document.getElementById("coal-since-inception-kpi-card").textContent = (data.inception_coal / 1e6).toFixed(2) + " M Tons";
        document.getElementById("ob-since-inception-kpi-card").textContent = (data.inception_ob / 1e6).toFixed(2) + " Mm³";
        document.getElementById("StrippingRatio-since-inception-kpi-card").textContent = StrippingRatioSinceInception.toFixed(2);

        const pitWiseCanvas = document.getElementById("pit-wise-coal-bar-chart");
        const pitWiseCtx = pitWiseCanvas?.getContext("2d");
        if (pitWiseCanvas) {
            pitWiseCanvas.width = pitWiseCanvas.offsetWidth;
            pitWiseCanvas.height = pitWiseCanvas.offsetHeight;
        }

        if (data.pitWiseCoal && pitWiseCtx) {
            const financialYears = [...new Set(data.pitWiseCoal.map(pit => pit.financial_year))];
            const pits = [...new Set(data.pitWiseCoal.map(pit => pit.pit))];
            const pitColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFC733", "#A833FF", "#33FFF5"];

            let barChart;

            const updatePitWiseChart = (selectedYear) => {
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
                            x: { title: { display: true, text: "Financial Year" }, grid: { display: false }, barPercentage: 0.8, categoryPercentage: 0.6 },
                            y: { beginAtZero: true, title: { display: true, text: "Total Coal Production (M Tons)" }, grid: { display: false } }
                        },
                        plugins: { legend: { position: 'top' } }
                    }
                });
            };

            updatePitWiseChart();

            const selectElement = document.getElementById("financial-year-select");
            financialYears.forEach(year => {
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                selectElement.appendChild(option);
            });

            selectElement.addEventListener("change", (event) => {
                updatePitWiseChart(event.target.value);
            });

            window.addEventListener('resize', () => {
                if (barChart) barChart.resize();
            });
        }

        const monthlyCoalObCanvas = document.getElementById("monthly-coal-ob-line-chart");
        const monthlyCoalObCtx = monthlyCoalObCanvas?.getContext("2d");

        if (monthlyCoalObCanvas) {
            monthlyCoalObCanvas.width = monthlyCoalObCanvas.offsetWidth;
            monthlyCoalObCanvas.height = monthlyCoalObCanvas.offsetHeight;
        }

        if (data.monthlyCoalOB && monthlyCoalObCtx) {
            const MonthlyCoalOBfinancialYears = [...new Set(data.monthlyCoalOB.map(entry => entry.financial_year))];

            const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

            let lineChart;

            const updateMonthlyCoalObChart = (selectedYear) => {
                const filteredData = selectedYear
                    ? data.monthlyCoalOB.filter(entry => entry.financial_year === selectedYear)
                    : data.monthlyCoalOB;
                console.log("filtered data is "+filteredData)
                const coalData = months.map((month, index) => {
                           const correctedMonthNumber = (index + 1) % 12 + 1; // Correct the month number from 1-12
                           const entry = filteredData.find(d => d.month_number === correctedMonthNumber);
                           return entry ? entry.monthly_total_coal : 0;
                       });

                       const obData = months.map((month, index) => {
                           const correctedMonthNumber = (index + 1) % 12 + 1; // Correct the month number from 1-12
                           const entry = filteredData.find(d => d.month_number === correctedMonthNumber);
                           return entry ? entry.monthly_total_ob : 0;
                       });

                       console.log("coal data"+coalData)
                       console.log("ob data is"+obData)

                if (lineChart) lineChart.destroy();

                lineChart = new Chart(monthlyCoalObCtx, {
                    type: 'line',
                    data: {
                        labels: months,
                        datasets: [
                            { label: 'Coal Production (M Tons)', data: coalData, borderColor: '#FF5733', fill: false },
                            { label: 'OB Production (Mm³)', data: obData, borderColor: '#33FF57', fill: false }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: "Month" } },
                            y: { beginAtZero: true, title: { display: true, text: "Production" } }
                        },
                        plugins: { legend: { position: 'top' },tooltip: {enabled: true} }
                    }
                });
            };

            updateMonthlyCoalObChart(MonthlyCoalOBfinancialYears[4]);

            const selectElementLine = document.getElementById("financial-year-line-select");
            MonthlyCoalOBfinancialYears.forEach(year => {
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                selectElementLine.appendChild(option);
            });

            selectElementLine.addEventListener("change", (event) => {
                updateMonthlyCoalObChart(event.target.value);
            });
        }

    } catch (error) {
        console.error("Error loading chart data:", error);
    }
});

const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeBtn.querySelector('i');
        icon.classList.toggle('fa-sun');
        icon.classList.toggle('fa-moon');
    });
}
