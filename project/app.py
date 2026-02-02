from flask import Flask, render_template

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

@app.route("/inventory")
def inventory():
    return render_template("inventory.html")

@app.route("/wip")
def wip():
    return render_template("wip.html")


if __name__ == "__main__":
    app.run(debug=True)
