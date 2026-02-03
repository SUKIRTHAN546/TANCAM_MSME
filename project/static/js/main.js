function addOrder() {
    const itemName = document.getElementById("item").value;
    const quantity = document.getElementById("qty").value;
    const dueDate = document.getElementById("date").value;

    if (!itemName || !quantity || !dueDate) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            item_name: itemName,
            quantity: quantity,
            due_date: dueDate
        })
    }).then(() => {
        // Clear inputs
        document.getElementById("item").value = "";
        document.getElementById("qty").value = "";
        document.getElementById("date").value = "";
        // Reload table
        loadOrders();
    });
}

function loadOrders() {
    fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("orderList");
            list.innerHTML = ""; // Clear existing table rows

            data.forEach(o => {
                const row = `
                    <tr>
                        <td><strong>${o.item_name}</strong></td>
                        <td>${o.quantity}</td>
                        <td>${o.due_date}</td>
                        <td style="text-align: center;">
                            <span class="badge status-pending">Pending</span>
                        </td>
                    </tr>
                `;
                list.innerHTML += row;
            });
        });
}

// Initial load
document.addEventListener("DOMContentLoaded", loadOrders);

function loadDashboardData() {
    fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById("dashboardOrderList");
            const totalOrdersEl = document.getElementById("totalOrders");
            const totalUnitsEl = document.getElementById("totalUnits");
            const pendingCountEl = document.getElementById("pendingCount");

            if (!tableBody) return; // Exit if not on the dashboard page

            tableBody.innerHTML = "";
            let totalUnits = 0;

            data.forEach(o => {
                // Calculate Total Units
                totalUnits += parseInt(o.quantity) || 0;

                // Create Table Row
                const row = `
                    <tr>
                        <td><strong>${o.item_name}</strong></td>
                        <td>${o.quantity}</td>
                        <td>${o.due_date}</td>
                        <td><span class="badge status-pending">Pending</span></td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });

            // Update Metric Cards
            totalOrdersEl.innerText = data.length;
            totalUnitsEl.innerText = totalUnits;
            pendingCountEl.innerText = data.length; // Currently all are pending
        })
        .catch(err => console.error("Error loading dashboard:", err));
}

// Ensure it loads on start
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
    
    // If you have the loadOrders function for the orders.html page, keep it here too:
    if (document.getElementById("orderList")) {
        loadOrders(); 
    }
});