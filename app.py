from flask import Flask, render_template, request, jsonify
import sqlite3
import pickle
import numpy as np

app = Flask(__name__)

# Load ML model
model = pickle.load(open('model.pkl', 'rb'))

# Database connection
def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# Home page
@app.route('/')
def home():
    return render_template('index.html')

# Predict risk
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    features = np.array([[
        float(data['weight']),
        int(data['fragile']),
        int(data['transfer_time'])
    ]])

    prediction = model.predict(features)[0]

    return jsonify({'risk': int(prediction)})

# Save record
@app.route('/save', methods=['POST'])
def save():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO records (weight, fragile, transfer_time, risk)
        VALUES (?, ?, ?, ?)
    """, (data['weight'], data['fragile'], data['transfer_time'], data['risk']))

    conn.commit()
    conn.close()

    return jsonify({'message': 'Saved'})

# Get records
@app.route('/records')
def records():
    conn = get_db()
    cursor = conn.cursor()

    rows = cursor.execute("SELECT * FROM records").fetchall()
    conn.close()

    return jsonify([dict(row) for row in rows])

# Delete record
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM records WHERE id=?", (id,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Deleted'})


if __name__ == '__main__':
    app.run(debug=True)