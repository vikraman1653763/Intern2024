from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:123@localhost/nevar'
app.config['SECRET_KEY'] = 'your_secret_key'  # Replace with a secure secret key
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    lastname = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    otp = db.Column(db.String(6), nullable=True)

@app.route('/')
def register_page():
    return render_template('register.html')

@app.route('/success.html')
def otp_page():
    return render_template('success.html')

@app.route('/submit_form', methods=['POST'])
def submit_form():
    try:
        username = request.form['username']
        lastname = request.form['lastname']
        email = request.form['email']
        password = request.form['password']

        # Save user details in the session
        session['username'] = username
        session['lastname'] = lastname
        session['email'] = email
        session['password'] = password

        return jsonify({'success': True, 'message': 'User details saved successfully'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Error saving user details'})

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    try:
        # Retrieve user details from the session
        username = session.get('username')
        lastname = session.get('lastname')
        email = session.get('email')
        password = session.get('password')

        # Clear session data
        session.pop('username', None)
        session.pop('lastname', None)
        session.pop('email', None)
        session.pop('password', None)

        # Save user details to the database
        new_user = User(username=username, lastname=lastname, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'success': True, 'message': 'User registered successfully'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Error saving user details'})

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
