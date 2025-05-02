document.addEventListener("DOMContentLoaded", async () => {

        const response = await fetch("/dashboard/safety-data");
        if (!response.ok) throw new Error("Failed to fetch production data.");
        const data = await response.json();
        console.log(data)
        }


