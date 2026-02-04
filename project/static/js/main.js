// Unified function to fetch and display orders for BOTH pages
function loadOrdersData() {
    const dashboardTable = document.getElementById("dashboardOrderList");
    const ordersTable = document.getElementById("orderList");
    
    // Determine which table we are currently looking at
    const activeTable = dashboardTable || ordersTable;
    if (!activeTable) return;

    fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
            activeTable.innerHTML = "";
            let unitSum = 0;

            data.forEach(o => {
                unitSum += parseInt(o.quantity) || 0;
                
                // Add rows with the Delete button (o.id must be sent from backend)
                activeTable.innerHTML += `
                    <tr>
                        <td><strong>${o.item_name}</strong></td>
                        <td>${o.quantity}</td>
                        <td>${o.due_date}</td>
                        <td><span class="badge status-pending">Pending</span></td>
                        <td>
                            <button class="btn-delete" onclick="deleteOrder(${o.id})">Delete</button>
                        </td>
                    </tr>`;
            });

            // Update Dashboard metrics only if those elements exist
            if (document.getElementById("totalOrders")) {
                document.getElementById("totalOrders").innerText = data.length;
                document.getElementById("totalUnits").innerText = unitSum;
                document.getElementById("pendingCount").innerText = data.length;
            }
        })
        .catch(err => console.error("Error loading data:", err));
}

// Function to handle adding an order
function addOrder() {
    const item = document.getElementById("item").value;
    const qty = document.getElementById("qty").value;
    const date = document.getElementById("date").value;

    if(!item || !qty || !date) {
        alert("Please fill in all fields");
        return;
    }

    fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_name: item, quantity: qty, due_date: date })
    }).then(() => {
        window.location.reload(); 
    });
}

// Global Delete Function
function deleteOrder(orderId) {
    if (confirm("Are you sure you want to delete this order?")) {
        fetch(`/api/orders/${orderId}`, {
            method: "DELETE",
        })
        .then(res => {
            if (res.ok) {
                // Refresh the data without a full page reload
                loadOrdersData();
            } else {
                alert("Server error: Check if the DELETE route exists in app.py");
            }
        })
        .catch(err => console.error("Delete failed:", err));
    }
}

// Single entry point
document.addEventListener("DOMContentLoaded", loadOrdersData);