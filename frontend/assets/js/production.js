const apiUrl = "http://localhost:3000/production";

const coalTripFactors = { 'Scania': 32, 'BB': 36, 'Eicher': 32 };
const OBTripFactors = {
    'Soft': { 'Scania': 16, 'Volvo': 16, 'BB': 16, 'Eicher': 13.7 },
    'Hard': { 'Scania': 18, 'Volvo': 18, 'BB': 16, 'Eicher': 14.4 }
};
document.getElementById('logoutBtn').addEventListener('click', function(event) {
    event.preventDefault();
    localStorage.removeItem('token'); 
    window.location.href = '/';
});

function preventBack() {
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", function () {
        window.history.pushState(null, "", window.location.href);
    });
}

preventBack();
document.addEventListener("DOMContentLoaded", function () {
    addTripRow();
});


function addTripRow(trip = {}) {
    let tableBody = document.getElementById("trip-body");
    let row = document.createElement("tr");

    row.innerHTML = `
        <td> 
            <select class="material" onchange="updateRow(this)">
                <option value="">Select Material</option>
                <option value="Coal" ${trip.material === "Coal" ? "selected" : ""}>Coal</option>
                <option value="OB" ${trip.material === "OB" ? "selected" : ""}>OB</option>
            </select>
        </td>
        <td>
            <select class="material_type" style="display: ${trip.material === "OB" ? "block" : "none"};" onchange="calculateTotal()">
                <option value="">Select Material Type</option>
                <option value="Hard" ${trip.materialType === "Hard" ? "selected" : ""}>Hard</option>
                <option value="Soft" ${trip.materialType === "Soft" ? "selected" : ""}>Soft</option>
            </select>
        </td>
        <td>
            <select class="vehicle" onchange="calculateTotal()">
                <option value="">Select Vehicle</option>
                <option value="Scania" ${trip.vehicle === "Scania" ? "selected" : ""}>Scania</option>
                <option value="BB" ${trip.vehicle === "BB" ? "selected" : ""}>BB</option>
                <option value="Eicher" ${trip.vehicle === "Eicher" ? "selected" : ""}>Eicher</option>
                <option value="Volvo" ${trip.vehicle === "Volvo" ? "selected" : ""}>Volvo</option>
            </select>
        </td>
        <td>
            <select class="destination" style="display: ${trip.material === "Coal" ? "block" : "none"};">
                <option value="Mine to Wharfwall" ${trip.destination === "Mine to Wharfwall" ? "selected" : ""}>Mine to Wharfwall</option>
                <option value="Mine to Stockyard" ${trip.destination === "Mine to Stockyard" ? "selected" : ""}>Mine to Stockyard</option>
            </select>
        </td>
        <td><input type="number" class="tripCount" value="${trip.tripCount || ''}" oninput="calculateTotal()"></td>
        <td>
            <div class="action-buttons">
                <button type="button" class="btn-add" onclick="addTripRow()">Add Trip</button>
                <button class="btn-delete" onclick="deleteRow(this)">Delete</button>
            </div>
        </td>
    `;

    tableBody.appendChild(row);
    let rows = tableBody.querySelectorAll('tr');
   // let lastRow = rows[rows.length - 1];
    
    
    rows.forEach((r, index) => {
        if (index !== rows.length - 1) {
            let addButton = r.querySelector('.btn-add');
            if (addButton) {
                addButton.remove(); 
            }
        }
    });
}


function deleteRow(button) {
    button.closest("tr").remove();
    calculateTotal();
}

function updateRow(materialSelect) {
    let row = materialSelect.closest("tr");
    let destinationField = row.querySelector(".destination");
    let materialTypeField = row.querySelector(".material_type");
    let vehicleSelect = row.querySelector(".vehicle");

    let selectedPit = document.getElementById("pitSelect").value;

    if (materialSelect.value === "Coal") {
        destinationField.style.display = "block";
        materialTypeField.style.display = "none";

        vehicleSelect.innerHTML = selectedPit === "East Pit"
            ? `<option value="BB">BB</option>`
            : `<option value="Eicher">Eicher</option>`;

        destinationField.innerHTML = selectedPit === "East Pit"
            ? `<option value="Mine to Stockyard">Mine to Stockyard</option>`
            : `<option value="">Select Destination</option>
               <option value="Mine to Wharfwall">Mine to Wharfwall</option>
               <option value="Mine to Stockyard">Mine to Stockyard</option>`;
    } else if (materialSelect.value === "OB") {
        destinationField.style.display = "none";
        materialTypeField.style.display = "block";

        vehicleSelect.innerHTML = selectedPit === "East Pit"
            ? `<option value="">Select Vehicle</option>
               <option value="BB">BB</option>
               <option value="Scania">Scania</option>
               <option value="Volvo">Volvo</option>`
            : `<option value="Eicher">Eicher</option>`;
    }

    calculateTotal();
}

function calculateTotal() {
    let totalCoal = 0, totalOB = 0;
    let rows = document.querySelectorAll("#trip-body tr");

    rows.forEach(row => {
        let material = row.querySelector(".material").value;
        let materialType = row.querySelector(".material_type")?.value || "";
        let vehicle = row.querySelector(".vehicle").value;
        let tripCount = parseInt(row.querySelector(".tripCount").value) || 0;

        if (material === "Coal" && coalTripFactors[vehicle]) {
            totalCoal += tripCount * coalTripFactors[vehicle];
        } else if (material === "OB" && OBTripFactors[materialType]?.[vehicle]) {
            totalOB += tripCount * OBTripFactors[materialType][vehicle];
        }
    });

    document.getElementById("total-coal").textContent = totalCoal;
    document.getElementById("total-ob").textContent = totalOB;
}


document.getElementById("date").addEventListener("change", fetchExistingTrips);
document.getElementById("pitSelect").addEventListener("change", fetchExistingTrips);
document.getElementById("shift").addEventListener("change", fetchExistingTrips);


async function fetchExistingTrips() {
    let date = document.getElementById("date").value;
    let pit = document.getElementById("pitSelect").value;
    let shift = document.getElementById("shift").value;

    if (!date || !pit || !shift) return;

    try {
        let response = await fetch(`${apiUrl}/fetch?date=${date}&pit=${pit}&shift=${shift}`, {
            headers: { "Accept": "application/json" }
        });

        let data = await response.json();
        document.getElementById("trip-body").innerHTML = "";

        if (data.trips.length > 0) {
            populateTripTable(data.trips);
        } else {
            addTripRow();
        }

        document.getElementById("total-coal").textContent = data.totalCoal || "0";
        document.getElementById("total-ob").textContent = data.totalOB || "0";

    } catch (error) {
        console.error("Error fetching existing trips:", error);
    }
}


function populateTripTable(trips) {
    let tableBody = document.getElementById("trip-body");
    tableBody.innerHTML = "";

    trips.forEach(trip => addTripRow(trip));
    calculateTotal();
}
document.getElementById("production-form-data").addEventListener("submit", async function (event) {
    event.preventDefault();

    const payload = {
        date: document.getElementById("date").value,
        pit: document.getElementById("pitSelect").value,
        shift: document.getElementById("shift").value,
        rainfall: document.getElementById('rainfall')?.value || null,
        remarks: document.getElementById('remarks')?.value || "",
        trips: Array.from(document.querySelectorAll("#trip-body tr")).map(row => ({
            material: row.querySelector(".material").value,
            materialType: row.querySelector(".material_type")?.value || "",
            vehicle: row.querySelector(".vehicle").value,
            destination: row.querySelector(".destination")?.value || "",
            tripCount: parseInt(row.querySelector(".tripCount").value) || 0
        }))
    };

    try {
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        let result = await response.json();
        console.log("Server Response:", result);

        if (response.ok) {
            alert(result.message);
        } else {
            alert("Error: " + (result.message || "Something went wrong"));
        }

        document.getElementById("production-form-data").reset();
        document.getElementById("trip-body").innerHTML = "";
        document.getElementById("total-coal").textContent = "0";
        document.getElementById("total-ob").textContent = "0";
        setTimeout(() => location.reload(), 500);
    } catch (error) {
        alert("Error submitting production data.");
        console.error("Error:", error);
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