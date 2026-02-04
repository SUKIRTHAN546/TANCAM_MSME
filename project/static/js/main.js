document.addEventListener("DOMContentLoaded", () => {
    // Check which page we are on and load specific data
    if (document.getElementById("inventoryList")) loadInventoryTable();
    if (document.getElementById("wipList")) loadWipTable();
    if (document.getElementById("orderList") || document.getElementById("dashboardOrderList")) loadOrdersData();
    if (document.getElementById("statusList")) loadStockStatus();
});

// --- Inventory Logic ---
function loadInventoryTable() {
    fetch("/api/inventory")
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("inventoryList");
            tbody.innerHTML = "";
            data.forEach(i => {
                // Determine row color based on min_level
                let statusBadge = `<span class="badge status-ok">OK</span>`;
                if (i.stock_qty < i.min_level) {
                    statusBadge = `<span class="badge status-low">Low Stock</span>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${i.item_name}</strong></td>
                        <td>${i.stock_qty}</td>
                        <td>${i.min_level}</td>
                        <td>${statusBadge}</td>
                        <td><button class="btn-delete" onclick="deleteItem('inventory', ${i.id})">Remove</button></td>
                    </tr>
                `;
            });
        });
}

// --- WIP Logic ---
function loadWipTable() {
    fetch("/api/wip")
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("wipList");
            tbody.innerHTML = "";
            data.forEach(i => {
                tbody.innerHTML += `
                    <tr>
                        <td><strong>${i.item_name}</strong></td>
                        <td>${i.wip_qty}</td>
                        <td><button class="btn-delete" onclick="deleteItem('wip', ${i.id})">Remove</button></td>
                    </tr>
                `;
            });
        });
}

// --- Generic Delete Function ---
function deleteItem(type, id) {
    if(confirm("Are you sure you want to delete this item?")) {
        fetch(`/api/${type}/${id}`, { method: "DELETE" })
        .then(res => {
            if(res.ok) window.location.reload(); 
        });
    }
}

// --- EXISTING FUNCTIONS (Keep these as they were) ---

function addInventory() {
    const item = document.getElementById("inv_item").value;
    const stock = document.getElementById("inv_stock").value;
    const min = document.getElementById("inv_min").value;

    if (!item || !stock) { alert("Please enter Item and Stock"); return; }

    fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_name: item, stock_qty: stock, min_level: min || 0 })
    }).then(res => {
        if (res.ok) window.location.reload(); 
    });
}

function addWip() {
    const item = document.getElementById("wip_item").value;
    const qty = document.getElementById("wip_qty").value;

    if (!item || !qty) { alert("Please enter Item and Qty"); return; }

    fetch("/api/wip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_name: item, wip_qty: qty })
    }).then(res => {
        if (res.ok) window.location.reload();
    });
}

function loadOrdersData() {
    const dashboardTable = document.getElementById("dashboardOrderList");
    const ordersTable = document.getElementById("orderList");
    const activeTable = dashboardTable || ordersTable;
    if (!activeTable) return;

    fetch("/api/orders").then(res => res.json()).then(data => {
        activeTable.innerHTML = "";
        let totalUnits = 0; let pendingCount = 0;
        data.forEach(o => {
            totalUnits += parseInt(o.quantity) || 0;
            if(o.status === "Pending") pendingCount++;
            activeTable.innerHTML += `<tr><td><strong>${o.item_name}</strong></td><td>${o.quantity}</td><td>${o.due_date}</td><td><span class="badge status-pending">${o.status}</span></td><td><button class="btn-delete" onclick="deleteItem('orders', ${o.id})">Delete</button></td></tr>`;
        });
        if (document.getElementById("totalOrders")) {
            document.getElementById("totalOrders").innerText = data.length;
            document.getElementById("totalUnits").innerText = totalUnits;
            document.getElementById("pendingCount").innerText = pendingCount;
        }
    });
}

function loadStockStatus() {
    const list = document.getElementById("statusList");
    if (!list) return;
    fetch("/api/status").then(res => res.json()).then(data => {
        list.innerHTML = "";
        if (data.length === 0) list.innerHTML = "<li>No inventory data found.</li>";
        data.forEach(i => {
            let color = i.status === "RED" ? "#e74c3c" : i.status === "YELLOW" ? "#f39c12" : "#27ae60";
            list.innerHTML += `<li style="border-left: 5px solid ${color}; padding-left: 10px; margin-bottom: 5px;"><strong>${i.item}</strong>: ${i.available} available <span style="color:${color}; font-weight:bold;">(${i.status})</span></li>`;
        });
    });
}

function addOrder() {
    const item = document.getElementById("item").value;
    const qty = document.getElementById("qty").value;
    const date = document.getElementById("date").value;
    if (!item || !qty || !date) { alert("Fill all fields"); return; }
    fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_name: item, quantity: qty, due_date: date })
    }).then(res => { if (res.ok) window.location.reload(); });
}