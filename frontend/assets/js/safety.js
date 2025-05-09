document.getElementById("safetyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const inputs = document.querySelectorAll("input[type='number']");
  const data = Array.from(inputs).map(input => input.value || "0");

  const response = await fetch("/safety/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ values: data })
  });

  if (response.ok) {
    alert("Data saved successfully.");
  } else {
    alert("Failed to save data.");
  }
});
