from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
from phe import paillier
import os
import pickle

app = Flask(__name__, template_folder='interface')
app.secret_key = os.urandom(16)
DATABASE = 'donations.db'

# Initialize keys and database
if not os.path.exists(DATABASE):
    public_key, private_key = paillier.generate_paillier_keypair()
    with open('public_key.pickle', 'wb') as f:
        pickle.dump(public_key, f)
    with open('private_key.pickle', 'wb') as f:
        pickle.dump(private_key, f)

    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE donations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            donor_name TEXT NOT NULL,
            ciphertext TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
else:
    with open('public_key.pickle', 'rb') as f:
        public_key = pickle.load(f)
    with open('private_key.pickle', 'rb') as f:
        private_key = pickle.load(f)

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        try:
            name = request.form['name']
            amount = float(request.form['amount'])
            enc = public_key.encrypt(amount)
            ciphertext_str = f"{enc.ciphertext()}|{enc.exponent}"

            db = get_db()
            db.execute('INSERT INTO donations (donor_name, ciphertext) VALUES (?, ?)', (name, ciphertext_str))
            db.commit()
            flash(f"Donation by {name} recorded successfully!")
        except Exception as e:
            flash(f'Error: {e}')
        return redirect(url_for('index'))
    return render_template('index.html')

@app.route('/admin')
def admin():
    db = get_db()
    rows = db.execute('SELECT donor_name, ciphertext FROM donations').fetchall()
    
    if not rows:
        total = 0
        donors = []
    else:
        # Parse first encrypted value
        first_ciphertext, first_exponent = rows[0]['ciphertext'].split('|')
        total_enc = paillier.EncryptedNumber(public_key, int(first_ciphertext), int(first_exponent))
        
        # Sum remaining encrypted donations
        for row in rows[1:]:
            ciphertext, exponent = row['ciphertext'].split('|')
            enc_num = paillier.EncryptedNumber(public_key, int(ciphertext), int(exponent))
            total_enc += enc_num
            
        full_ciphertext = str(total_enc.ciphertext())
        encrypted_total_display = full_ciphertext[:12]
        donors = [dict(row) for row in rows]
    
    return render_template('admin.html', total_enc_display=encrypted_total_display, donors=donors)

@app.route("/admin/decrypt")
def decrypt_total_api():
    db = get_db()
    rows = db.execute('SELECT ciphertext FROM donations').fetchall()
    
    if not rows:
        return jsonify({"total": 0})
    
    # Parse first encrypted value
    first_ciphertext, first_exponent = rows[0]['ciphertext'].split('|')
    total_enc = paillier.EncryptedNumber(public_key, int(first_ciphertext), int(first_exponent))
    
    for row in rows[1:]:
        ciphertext, exponent = row['ciphertext'].split('|')
        enc_num = paillier.EncryptedNumber(public_key, int(ciphertext), int(exponent))
        total_enc += enc_num
    
    decrypted_total = private_key.decrypt(total_enc)
    return jsonify({"total": decrypted_total})

if __name__ == '__main__':
    app.run(debug=True)