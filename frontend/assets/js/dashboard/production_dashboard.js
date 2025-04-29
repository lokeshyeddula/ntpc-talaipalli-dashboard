document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("/dashboard/production-data");
        if (!response.ok) throw new Error("Failed to fetch production data.");
        const data = await response.json();

        const {
            yearly_coal,
            yearly_ob,
            inception_coal,
            inception_ob,
            pitWiseCoal,
            monthlyCoalOB
        } = data;

        document.getElementById("coal-yearly-kpi-card").textContent = Math.round(yearly_coal) + " Tons";
        document.getElementById("ob-yearly-kpi-card").textContent = Math.round(yearly_ob) + " m³";
        document.getElementById("coal-since-inception-kpi-card").textContent = (inception_coal / 1e6).toFixed(2) + " M Tons";
        document.getElementById("ob-since-inception-kpi-card").textContent = (inception_ob / 1e6).toFixed(2) + " Mm³";
        document.getElementById("StrippingRatio-since-inception-kpi-card").textContent = (inception_ob / inception_coal).toFixed(2);

        const pitWiseCanvas = document.getElementById("pit-wise-coal-bar-chart");
        const pitWiseCtx = pitWiseCanvas?.getContext("2d");
        if (pitWiseCanvas) {
            pitWiseCanvas.width = pitWiseCanvas.offsetWidth;
            pitWiseCanvas.height = pitWiseCanvas.offsetHeight;
        }

        if (pitWiseCoal && pitWiseCtx) {
            const financialYears = [...new Set(pitWiseCoal.map(p => p.financial_year))];
            const pits = [...new Set(pitWiseCoal.map(p => p.pit))];
            const pitColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFC733", "#A833FF", "#33FFF5"];
            let barChart;

            const updatePitWiseChart = (selectedYear) => {
                const filteredYears = selectedYear ? [selectedYear] : financialYears;

                const datasets = pits.map((pitName, index) => ({
                    label: pitName,
                    data: filteredYears.map(year => {
                        const entry = pitWiseCoal.find(p => p.financial_year === year && p.pit === pitName);
                        return entry ? entry.yearly_total_coal / 1e6 : 0;
                    }),
                    backgroundColor: pitColors[index % pitColors.length],
                    borderRadius: 5,
                    barThickness: 30
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
                                grid: { display: false }
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Total Coal Production (M Tons)" },
                                grid: { color: "#f0f0f0" }
                            }
                        },
                        plugins: {
                            legend: { position: 'top' },
                            tooltip: { mode: 'index', intersect: false }
                        },
                        animation: {
                            duration: 800,
                            easing: 'easeOutQuart'
                        }
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

            selectElement.addEventListener("change", (e) => updatePitWiseChart(e.target.value));
            window.addEventListener('resize', () => barChart?.resize());
        }

        const monthlyCoalObCanvas = document.getElementById("monthly-coal-ob-line-chart");
        const monthlyCoalObCtx = monthlyCoalObCanvas?.getContext("2d");
        if (monthlyCoalObCanvas) {
            monthlyCoalObCanvas.width = monthlyCoalObCanvas.offsetWidth;
            monthlyCoalObCanvas.height = monthlyCoalObCanvas.offsetHeight;
        }

        if (monthlyCoalOB && monthlyCoalObCtx) {
            const monthlyYears = [...new Set(monthlyCoalOB.map(entry => entry.financial_year))];
            const monthNames = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
            const monthNumberArray = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
            let lineChart;

            const updateMonthlyCoalObChart = (selectedYear) => {
                const filteredData = selectedYear
                    ? monthlyCoalOB.filter(entry => entry.financial_year === selectedYear)
                    : monthlyCoalOB;

                const coalData = monthNumberArray.map(m => {
                    const entry = filteredData.find(d => d.month_number === m);
                    return entry ? +(entry.monthly_total_coal).toFixed(2) : 0;
                });

                const obData = monthNumberArray.map(m => {
                    const entry = filteredData.find(d => d.month_number === m);
                    return entry ? +(entry.monthly_total_ob).toFixed(2) : 0;
                });

                let start = 0, end = coalData.length - 1;
                while (start < coalData.length && coalData[start] === 0 && obData[start] === 0) start++;
                while (end > start && coalData[end] === 0 && obData[end] === 0) end--;

                const trimmedMonths = monthNames.slice(start, end + 1);
                const trimmedCoalData = coalData.slice(start, end + 1);
                const trimmedObData = obData.slice(start, end + 1);

                if (lineChart) lineChart.destroy();

                lineChart = new Chart(monthlyCoalObCtx, {
                    type: 'line',
                    data: {
                        labels: trimmedMonths,
                        datasets: [
                            {
                                label: 'Coal (Tons)',
                                data: trimmedCoalData,
                                borderColor: '#151716',
                                backgroundColor: 'rgba(255, 87, 51, 0.1)',
                                tension: 0.4,
                                pointRadius: 5,
                                pointHoverRadius: 7
                            },
                            {
                                label: 'OB (m³)',
                                data: trimmedObData,
                                borderColor: '#8B4513',
                                backgroundColor: 'rgba(51, 255, 87, 0.1)',
                                tension: 0.4,
                                pointRadius: 5,
                                pointHoverRadius: 7
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                title: { display: true, text: "Month" },
                                grid: { color: "#f5f5f5" }
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Production" },
                                grid: { color: "#f5f5f5" }
                            }
                        },
                        plugins: {
                            legend: { position: 'top' },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y}`
                                }
                            }
                        },
                        animation: {
                            duration: 1000,
                            easing: 'easeOutQuart'
                        }
                    }
                });
            };

            const today = new Date();
            const fyStartYear = today.getMonth() + 1 >= 4 ? today.getFullYear() : today.getFullYear() - 1;
            const currentFY = String(fyStartYear).slice(2) + '-' + String(fyStartYear + 1).slice(2);

            updateMonthlyCoalObChart(currentFY);

            const selectElementLine = document.getElementById("financial-year-line-select");
            monthlyYears.forEach(year => {
                const option = document.createElement("option");
                option.value = year;
                option.textContent = year;
                selectElementLine.appendChild(option);
            });

            selectElementLine.value = currentFY;
            selectElementLine.addEventListener("change", (e) => updateMonthlyCoalObChart(e.target.value));
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
