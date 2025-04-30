function preventBack() {
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", function () {
        window.history.pushState(null, "", window.location.href);
    });
}

preventBack();

document.addEventListener("DOMContentLoaded", () => {
    const reportDateInput = document.getElementById("reportDate");
    if (reportDateInput) {
        const today = new Date();
        today.setDate(today.getDate() - 1);
        const yesterday = today.toISOString().split("T")[0];

        reportDateInput.value = yesterday;
        fetchReports(yesterday);

        reportDateInput.addEventListener("change", () => fetchReports(reportDateInput.value));
    }
});


async function fetchReports(selectedDate) {
    if (!selectedDate) return;

    try {
        const response = await fetch(`/reports/reports-data?date=${selectedDate}`);
        const data = await response.json();
        if (!data) return;

        const { daily = [], monthly = [], yearly = [], inception = [] } = data;

        const updateValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatValue(value);
            }
        };

        const getPitData = (dataset, pit, field) => {
            if (!dataset || !Array.isArray(dataset)) return 0;
            const entry = dataset.find(entry => entry.pit.toLowerCase() === pit.toLowerCase());
            return entry && entry[field] !== undefined ? parseFloat(entry[field]) || 0 : 0;
        };

        const formatValue = (value) => {
            return Number.isInteger(value) ? value : value.toFixed(2);
        };

        // calculation of daily asking rate for current financial year

        const no_of_remaining_days=getRemainingDaysInFinancialYear(selectedDate);
        const current_actual_coal_production=getPitData(yearly, "West Pit", "yearly_total_coal") + getPitData(yearly, "East Pit", "yearly_total_coal");
        const target_coal_production=11000000;
        const target_ob_removal=46429379;

        const daily_asking_rate=(target_coal_production-current_actual_coal_production)/no_of_remaining_days;

        
        updateValue('coalProductiondailyAsking',Math.round(daily_asking_rate));
        updateValue('coalProductionyearlyTarget',target_coal_production);
        updateValue('OBRemovalyearlyTarget',target_ob_removal);
        

        const selected = new Date(selectedDate);
        const options = { day: '2-digit', month: 'numeric', year: 'numeric' };

        const formattedDate = selected.toLocaleDateString('en-GB', options);
        const monthName = selected.toLocaleString('en-US', { month: 'long' });
        const year = selected.getFullYear();


        document.getElementById('sectionDate').textContent = formattedDate;
        document.getElementById('sectionMonth').textContent = ` ${monthName}`;
        document.getElementById('sectionYear').textContent = year;
        document.getElementById('sectionInception').textContent = '';


        //for DPR Coal Production
        updateValue("coalProductiondailyWest", getPitData(daily, "West Pit", "daily_total_coal"));
        updateValue("coalProductiondailyEast", getPitData(daily, "East Pit", "daily_total_coal"));
        updateValue("coalProductiondailyTotal", getPitData(daily, "West Pit", "daily_total_coal") + getPitData(daily, "East Pit", "daily_total_coal"));

        updateValue("coalProductionmonthlyWest", getPitData(monthly, "West Pit", "monthly_total_coal"));
        updateValue("coalProductionmonthlyEast", getPitData(monthly, "East Pit", "monthly_total_coal"));
        updateValue("coalProductionmonthlyTotal", getPitData(monthly, "West Pit", "monthly_total_coal") + getPitData(monthly, "East Pit", "monthly_total_coal"));

        updateValue("coalProductionyearlyWest", getPitData(yearly, "West Pit", "yearly_total_coal"));
        updateValue("coalProductionyearlySouthExt",getPitData(yearly, "South Pit Extension", "yearly_total_coal"));
        updateValue("coalProductionyearlyEast", getPitData(yearly, "East Pit", "yearly_total_coal"));
        updateValue("coalProductionyearlyTotal",  getPitData(yearly, "South Pit Extension", "yearly_total_coal")+getPitData(yearly, "West Pit", "yearly_total_coal") + getPitData(yearly, "East Pit", "yearly_total_coal"));

        updateValue("coalProductionSinceInceptionWest", getPitData(inception, "West Pit", "inception_total_coal"));
        updateValue("coalProductionSinceInceptionSouthExt", getPitData(inception, "South Pit Extension", "inception_total_coal"));
        updateValue("coalProductionSinceInceptionEast", getPitData(inception, "East Pit", "inception_total_coal"));
        updateValue("coalProductionSinceInceptionSouth", getPitData(inception, "South Pit", "inception_total_coal"));
        updateValue("coalProductionSinceInceptionTotal",
            getPitData(inception, "West Pit", "inception_total_coal") +
            getPitData(inception, "South Pit Extension", "inception_total_coal") +
            getPitData(inception, "East Pit", "inception_total_coal") +
            getPitData(inception, "South Pit", "inception_total_coal"));

        // for  Dpr OB Removal
       
        updateValue("OBRemovaldailyWest", getPitData(daily, "West Pit", "daily_total_ob"));
        updateValue("OBRemovaldailyEast", getPitData(daily, "East Pit", "daily_total_ob"));
        updateValue("OBRemovaldailyTotal", getPitData(daily, "West Pit", "daily_total_ob") + getPitData(daily, "East Pit", "daily_total_ob"));

        updateValue("OBRemovalmonthlyWest", getPitData(monthly, "West Pit", "monthly_total_ob"));
        updateValue("OBRemovalmonthlyEast", getPitData(monthly, "East Pit", "monthly_total_ob"));
        updateValue("OBRemovalmonthlyTotal", getPitData(monthly, "West Pit", "monthly_total_ob") + getPitData(monthly, "East Pit", "monthly_total_ob"));

        updateValue("OBRemovalyearlyWest", getPitData(yearly, "West Pit", "yearly_total_ob"));
        updateValue("OBRemovalyearlyEast", getPitData(yearly, "East Pit", "yearly_total_ob"));
        updateValue("OBRemovalyearlySouthExt", getPitData(yearly, "South Pit Extension", "yearly_total_ob"));
        updateValue("OBRemovalyearlyTotal", getPitData(yearly, "West Pit", "yearly_total_ob") + getPitData(yearly, "South Pit Extension", "yearly_total_ob")  +getPitData(yearly, "East Pit", "yearly_total_ob"));

        updateValue("OBRemovalSinceInceptionWest", getPitData(inception, "West Pit", "inception_total_ob"));
        updateValue("OBRemovalSinceInceptionSouthExt", getPitData(inception, "South Pit Extension", "inception_total_ob"));
        updateValue("OBRemovalSinceInceptionEast", getPitData(inception, "East Pit", "inception_total_ob"));
        updateValue("OBRemovalSinceInceptionSouth", getPitData(inception, "South Pit", "inception_total_ob"));
        updateValue("OBRemovalSinceInceptionTotal",
            getPitData(inception, "West Pit", "inception_total_ob") +
            getPitData(inception, "South Pit Extension", "inception_total_ob") +
            getPitData(inception, "East Pit", "inception_total_ob") +
            getPitData(inception, "South Pit", "inception_total_ob"));

    } catch (error) {
        console.error("Error fetching reports data:", error);
    }
}


//function to calculate no of remaining days 

function getRemainingDaysInFinancialYear(selectedDateStr) {
    const selectedDate = new Date(selectedDateStr);
    const today = new Date();

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const fyStart = currentMonth >= 4
        ? new Date(currentYear, 3, 1)
        : new Date(currentYear - 1, 3, 1);

    const fyEnd = currentMonth >= 4
        ? new Date(currentYear + 1, 2, 31)
        : new Date(currentYear, 2, 31);

    if (selectedDate < fyStart || selectedDate > fyEnd) {
        return null;
    }

    const diffInMs = fyEnd - selectedDate;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays;
}

function downloadExcel() {
    const selectedDate = document.getElementById("reportDate").value || "Report";
    const table = document.getElementById("reportTable");

  
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table, { raw: true });

    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Report");

    XLSX.writeFile(workbook, `Daily_Production_Report_${selectedDate}.xlsx`);
}
function downloadPDF() {
    const table = document.getElementById('reportTable');
    const selectedDate = document.getElementById("reportDate").value || "Report";


    const tableClone = table.cloneNode(true);
    const container = document.createElement("div");
    container.style.padding = "20px";
    container.style.background = "white";
    container.style.width = "210mm";
    container.style.minHeight = "297mm";
    container.appendChild(tableClone);


    document.body.appendChild(container);

    const opt = {
        margin: 0.2,
        filename: `DPR_Report_${selectedDate}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
            scale: 3,
            useCORS: true,
            scrollY: 0,
            scrollX: 0
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'landscape'
        },
        pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
        }
    };

    html2pdf()
        .set(opt)
        .from(container)
        .save()
        .then(() => {
            document.body.removeChild(container);
        });
}

const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeBtn.querySelector('i');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
  });
}
