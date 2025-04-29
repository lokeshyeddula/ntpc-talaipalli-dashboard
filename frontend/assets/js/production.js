const apiUrl = " /production";

// Trip Factors
const coalTripFactors = { 'Scania': 32, 'BB': 36, 'Eicher': 32 };
const OBTripFactors = {
    'Soft': { 'Scania': 16, 'Volvo': 16, 'BB': 16, 'Eicher': 13.7 },
    'Hard': { 'Scania': 18, 'Volvo': 18, 'BB': 16, 'Eicher': 14.4 }
};

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = '/';
});

// Prevent Back Button
function preventBack() {
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', () => history.pushState(null, '', location.href));
}
preventBack();

// On Load
document.addEventListener('DOMContentLoaded', () => {
    addTripRow();
});

// Trip Factor Fetcher
function getTripFactor(material, type, vehicle) {
    return material === 'Coal'
        ? coalTripFactors[vehicle] || ''
        : OBTripFactors[type]?.[vehicle] || '';
}

// Update Trip Factor
function updateTripFactor(el) {
    const row = el.closest('tr');
    const material = row.querySelector('.material').value;
    const type = row.querySelector('.material_type')?.value;
    const vehicle = row.querySelector('.vehicle').value;
    const factor = getTripFactor(material, type, vehicle);
    row.querySelector('.trip-factor').textContent = factor || '-';
}

// Add Trip Row
function addTripRow(trip = {}) {
    const tableBody = document.getElementById("trip-body");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <select class="material" onchange="updateRow(this)">
                <option value="">Select Material</option>
                <option value="Coal" ${trip.material === "Coal" ? "selected" : ""}>Coal</option>
                <option value="OB" ${trip.material === "OB" ? "selected" : ""}>OB</option>
            </select>
        </td>
        <td>
            <select class="material_type" style="display: ${trip.material === "OB" ? "block" : "none"};" onchange="updateTripFactor(this); calculateTotal();">
                <option value="">Select Material Type</option>
                <option value="Hard" ${trip.materialType === "Hard" ? "selected" : ""}>Hard</option>
                <option value="Soft" ${trip.materialType === "Soft" ? "selected" : ""}>Soft</option>
            </select>
        </td>
        <td>
            <select class="vehicle" onchange="updateTripFactor(this); calculateTotal();">
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
        <td><span class="trip-factor">${getTripFactor(trip.material, trip.materialType, trip.vehicle) || '-'}</span></td>
        <td>
            <div class="action-buttons">
                <button type="button" class="btn-add" onclick="addTripRow()">Add Trip</button>
                <button class="btn-delete" onclick="deleteRow(this)">Delete</button>
            </div>
        </td>
    `;

    tableBody.appendChild(row);

    // Remove extra 'Add' buttons except last row
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((r, i) => {
        if (i !== rows.length - 1) {
            r.querySelector('.btn-add')?.remove();
        }
    });
}

// Delete Row
function deleteRow(button) {
    button.closest('tr').remove();
    calculateTotal();
}

// Update Row on Material Change
function updateRow(select) {
    const row = select.closest('tr');
    const destination = row.querySelector(".destination");
    const materialType = row.querySelector(".material_type");
    const vehicle = row.querySelector(".vehicle");

    const selectedPit = document.getElementById("pitSelect").value;
    const isCoal = select.value === "Coal";

    destination.style.display = isCoal ? "block" : "none";
    materialType.style.display = isCoal ? "none" : "block";

    if (isCoal) {
        vehicle.innerHTML = selectedPit === "East Pit"
            ? `<option value="BB">BB</option>`
            : `<option value="Eicher">Eicher</option>`;

        destination.innerHTML = selectedPit === "East Pit"
            ? `<option value="Mine to Stockyard">Mine to Stockyard</option>`
            : `<option value="Mine to Wharfwall">Mine to Wharfwall</option>
               <option value="Mine to Stockyard">Mine to Stockyard</option>`;
    } else {
        vehicle.innerHTML = selectedPit === "East Pit"
            ? `<option value="">Select Vehicle</option>
               <option value="BB">BB</option>
               <option value="Scania">Scania</option>
               <option value="Volvo">Volvo</option>`
            : `<option value="Eicher">Eicher</option>`;
    }

    updateTripFactor(select);
    calculateTotal();
}

// Calculate Totals
function calculateTotal() {
    let totalCoal = 0, totalOB = 0;

    document.querySelectorAll("#trip-body tr").forEach(row => {
        const material = row.querySelector(".material").value;
        const type = row.querySelector(".material_type")?.value || "";
        const vehicle = row.querySelector(".vehicle").value;
        const trips = parseInt(row.querySelector(".tripCount").value) || 0;

        if (material === "Coal") {
            totalCoal += trips * (coalTripFactors[vehicle] || 0);
        } else if (material === "OB") {
            totalOB += trips * (OBTripFactors[type]?.[vehicle] || 0);
        }
    });

    document.getElementById("total-coal").textContent = totalCoal;
    document.getElementById("total-ob").textContent = totalOB;
}

// Fetch Existing Data
["date", "pitSelect", "shift"].forEach(id =>
    document.getElementById(id)?.addEventListener("change", fetchExistingTrips)
);

async function fetchExistingTrips() {
    const date = document.getElementById("date").value;
    const pit = document.getElementById("pitSelect").value;
    const shift = document.getElementById("shift").value;

    if (!date || !pit || !shift) return;

    try {
        const res = await fetch(`${apiUrl}/fetch?date=${date}&pit=${pit}&shift=${shift}`);
        const data = await res.json();

        document.getElementById("trip-body").innerHTML = "";

        if (data.trips?.length) {
            populateTripTable(data.trips);
        } else {
            addTripRow();
        }

        document.getElementById("total-coal").textContent = data.totalCoal || "0";
        document.getElementById("total-ob").textContent = data.totalOB || "0";

    } catch (err) {
        console.error("Error fetching trips:", err);
    }
}

// Populate Trips
function populateTripTable(trips) {
    document.getElementById("trip-body").innerHTML = "";
    trips.forEach(trip => addTripRow(trip));
    calculateTotal();
}

// Submit Form
document.getElementById("production-form-data")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const payload = {
        date: document.getElementById("date").value,
        pit: document.getElementById("pitSelect").value,
        shift: document.getElementById("shift").value,
        rainfall: document.getElementById("rainfall")?.value || null,
        remarks: document.getElementById("remarks")?.value || "",
        trips: Array.from(document.querySelectorAll("#trip-body tr")).map(row => ({
            material: row.querySelector(".material").value,
            materialType: row.querySelector(".material_type")?.value || "",
            vehicle: row.querySelector(".vehicle").value,
            destination: row.querySelector(".destination")?.value || "",
            tripCount: parseInt(row.querySelector(".tripCount").value) || 0
        }))
    };

    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        alert(res.ok ? result.message : "Error: " + (result.message || "Something went wrong"));

        document.getElementById("production-form-data").reset();
        document.getElementById("trip-body").innerHTML = "";
        document.getElementById("total-coal").textContent = "0";
        document.getElementById("total-ob").textContent = "0";

        setTimeout(() => location.reload(), 500);
    } catch (err) {
        alert("Error submitting production data.");
        console.error("Error:", err);
    }
});

// Theme Toggle
document.getElementById('themeToggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('#themeToggle i');
    icon.classList.toggle('fa-sun');
    icon.classList.toggle('fa-moon');
});
