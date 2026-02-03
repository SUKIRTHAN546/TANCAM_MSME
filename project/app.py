from flask import Flask, render_template , request, jsonify
from db import get_db
app = Flask(__name__)

@app.route("/")
def dashboard():
    return render_template("dashboard.html")

@app.route("/health")
def health():
    return {"status": "ok"}

@app.route("/orders")
def orders():
    return render_template("orders.html")

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



@app.route("/inventory")
def inventory():
    return render_template("inventory.html")

@app.route("/wip")
def wip():
    return render_template("wip.html")


if __name__ == "__main__":
    app.run(debug=True)
