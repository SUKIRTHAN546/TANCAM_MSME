from flask import Flask, render_template, request, jsonify
from db import get_db

app = Flask(__name__)

# --- HTML Routes ---

@app.route("/")
def dashboard():
    return render_template("dashboard.html")

@app.route("/orders")
def orders():
    return render_template("orders.html")

@app.route("/inventory")
def inventory():
    return render_template("inventory.html")

@app.route("/wip")
def wip():
    return render_template("wip.html")

# --- API Routes ---

@app.route("/health")
def health():
    return {"status": "ok"}

@app.route("/api/orders", methods=["GET", "POST"])
def orders_api():
    db = get_db()
    if request.method == "POST":
        data = request.json
        db.execute(
            "INSERT INTO orders (item_name, quantity, due_date, status) VALUES (?, ?, ?, ?)",
            (data["item_name"], data["quantity"], data["due_date"], "Pending")
        )
        db.commit()
        return jsonify({"message": "Order added"})

    orders = db.execute("SELECT * FROM orders").fetchall()
    return jsonify([dict(o) for o in orders])

# MOVED THIS UP: This route must be defined BEFORE app.run()
@app.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    try:
        db = get_db()
        db.execute("DELETE FROM orders WHERE id = ?", (order_id,))
        db.commit()
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"Error: {e}") # This helps you see errors in the terminal
        return jsonify({"error": str(e)}), 500

# --- Start the Server ---



@app.route("/api/status")
def stock_status():
    db = get_db()

    inventory = db.execute("SELECT * FROM inventory").fetchall()

    orders = db.execute("""
        SELECT item_name, SUM(quantity) AS qty
        FROM orders
        WHERE status='Pending'
        GROUP BY item_name
    """).fetchall()

    wip = db.execute("""
        SELECT item_name, SUM(wip_qty) AS qty
        FROM wip
        GROUP BY item_name
    """).fetchall()

    order_map = {o["item_name"]: o["qty"] for o in orders}
    wip_map = {w["item_name"]: w["qty"] for w in wip}

    result = []

    for i in inventory:
        available = (
            i["stock_qty"]
            + wip_map.get(i["item_name"], 0)
            - order_map.get(i["item_name"], 0)
        )

        if available < 0:
            status = "RED"
        elif available < i["min_level"]:
            status = "YELLOW"
        else:
            status = "GREEN"

        result.append({
            "item": i["item_name"],
            "available": available,
            "status": status
        })

    return jsonify(result)
    

if __name__ == "__main__":
    # app.run should ALWAYS be at the very bottom of the file
    app.run(debug=True)