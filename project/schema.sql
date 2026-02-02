CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT,
    quantity INTEGER,
    due_date TEXT,
    status TEXT
);

CREATE TABLE inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT,
    stock_qty INTEGER,
    min_level INTEGER
);

CREATE TABLE wip (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT,
    wip_qty INTEGER,
    expected_date TEXT
);
