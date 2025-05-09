const safetyData = {
  '2022-23': [4, 268, 28, 860, 86, 0],
  '2023-24': [21, 347, 67, 1762, 478, 21],
  '2024-25': [44, 631, 102, 4070, 3356, 4]
};

const labels = ['Near Miss', 'No of Visits*', 'Training (MVTC)', 'TBT/PEP Talks', 'Deviation', 'First Aid Cases'];

let chartInstance;

function renderChart(year) {
  const ctx = document.getElementById('safetyPie').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: safetyData[year],
        backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948']

      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Safety Indicators for FY ${year}`,
          font: { size: 14 }
        }
      }
    }
  });
}

function updateChart() {
  const selectedYear = document.getElementById('fySelect').value;
  renderChart(selectedYear);
}

renderChart('2024-25');



