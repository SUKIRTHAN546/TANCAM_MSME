from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)
DB_NAME = "supply_chain.db"

def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # Allows accessing columns by name (e.g. row['item_name'])
    return conn

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

@app.route("/api/orders", methods=["GET", "POST"])
def orders_api():
    db = get_db()
    if request.method == "POST":
        data = request.json
        # Matches schema: item_name, quantity, due_date, status
        db.execute(
            "INSERT INTO orders (item_name, quantity, due_date, status) VALUES (?, ?, ?, ?)",
            (data["item_name"], data["quantity"], data["due_date"], "Pending")
        )
        db.commit()
        return jsonify({"message": "Order added"})

    # GET request
    orders = db.execute("SELECT * FROM orders").fetchall()
    return jsonify([dict(o) for o in orders])

@app.route("/api/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    try:
        db = get_db()
        db.execute("DELETE FROM orders WHERE id = ?", (order_id,))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ... existing code ...

@app.route("/api/inventory", methods=["GET", "POST"])
def inventory_api():
    db = get_db()
    
    if request.method == "POST":
        data = request.json
        try:
            db.execute(
                "INSERT INTO inventory (item_name, stock_qty, min_level) VALUES (?, ?, ?)",
                (data["item_name"], data["stock_qty"], data["min_level"])
            )
            db.commit()
            return jsonify({"msg": "Inventory added"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # GET Request: Fetch all inventory items
    items = db.execute("SELECT * FROM inventory").fetchall()
    return jsonify([dict(i) for i in items])

@app.route("/api/inventory/<int:id>", methods=["DELETE"])
def delete_inventory(id):
    db = get_db()
    db.execute("DELETE FROM inventory WHERE id = ?", (id,))
    db.commit()
    return jsonify({"success": True})

@app.route("/api/wip", methods=["GET", "POST"])
def wip_api():
    db = get_db()

    if request.method == "POST":
        data = request.json
        try:
            db.execute(
                "INSERT INTO wip (item_name, wip_qty) VALUES (?, ?)",
                (data["item_name"], data["wip_qty"])
            )
            db.commit()
            return jsonify({"msg": "WIP added"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # GET Request: Fetch all WIP items
    items = db.execute("SELECT * FROM wip").fetchall()
    return jsonify([dict(i) for i in items])

@app.route("/api/wip/<int:id>", methods=["DELETE"])
def delete_wip(id):
    db = get_db()
    db.execute("DELETE FROM wip WHERE id = ?", (id,))
    db.commit()
    return jsonify({"success": True})

# ... existing code ...


@app.route("/api/status")
def stock_status():
    db = get_db()
    
    # 1. Get Inventory
    inventory = db.execute("SELECT * FROM inventory").fetchall()
    
    # 2. Get Pending Orders (Summed by item)
    orders = db.execute("""
        SELECT item_name, SUM(quantity) as qty 
        FROM orders 
        WHERE status='Pending' 
        GROUP BY item_name
    """).fetchall()

    # 3. Get WIP (Summed by item) - Using 'wip_qty'
    wip = db.execute("""
        SELECT item_name, SUM(wip_qty) as qty 
        FROM wip 
        GROUP BY item_name
    """).fetchall()

    # Convert lists to dictionaries for easy lookup
    order_map = {row["item_name"]: row["qty"] for row in orders}
    wip_map   = {row["item_name"]: row["qty"] for row in wip}

    results = []
    
    for item in inventory:
        name = item["item_name"]
        stock = item["stock_qty"]     # Matches schema
        min_lvl = item["min_level"]   # Matches schema
        
        incoming_wip = wip_map.get(name, 0)
        outgoing_orders = order_map.get(name, 0)

        # Calculation: Available = Stock + WIP - Pending Orders
        available = stock + incoming_wip - outgoing_orders

        # Determine Status Color
        if available < 0:
            status = "RED"    # Deficit
        elif available < min_lvl:
            status = "YELLOW" # Below safety stock
        else:
            status = "GREEN"  # Healthy

        results.append({
            "item": name,
            "available": available,
            "status": status
        })

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)