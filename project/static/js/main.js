function addOrder() {
    fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            item_name: document.getElementById("item").value,
            quantity: document.getElementById("qty").value,
            due_date: document.getElementById("date").value
        })
    }).then(() => loadOrders());
}

function loadOrders() {
    fetch("/api/orders")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("orderList");
            list.innerHTML = "";
            data.forEach(o => {
                list.innerHTML += `<li>${o.item_name} - ${o.quantity} - ${o.due_date}</li>`;
            });
        });
}

loadOrders();
