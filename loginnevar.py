from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:123@localhost/nevar'
app.config['SECRET_KEY'] = 'secret_key' 
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=True)
    lastname = db.Column(db.String(80), nullable=True)
    email = db.Column(db.String(120), unique=False, nullable=True)
    password = db.Column(db.String(80), nullable=True)
@app.route('/favicon.ico')
def favicon():
    return '', 404


@app.route('/')
def register_page():
    action='register'
    return render_template('register.html',action=action)

@app.route('/success.html')
def success_page():
    return render_template('success.html')

@app.route('/submit_form', methods=['POST'])
def submit_form():
    try:
        print('forrrrrm',request.form)  # Print form data for debugging
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
        # Retrieve user details from the request
        data = request.get_json()
        username = data.get('username')
        lastname = data.get('lastname')
        email = data.get('email')
        password = data.get('password')
        print("received data",data)
        # Save user details to the database
        new_user = User(username=username, lastname=lastname, email=email, password=password)
        print("user data",new_user)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({'success': True, 'message': 'User registered successfully'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Error saving user details'})
@app.route('/login')
def login():
    # Pass a variable to indicate the current action (logging in)
    action = 'login'
    return render_template('login.html', action=action)
    
@app.route('/login_check', methods=['POST'])
def login_check():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Check if the email and password match any user in the database
        user = User.query.filter_by(email=email, password=password).first()
        if user:
            # Return user details including the ID
            return jsonify({'success': True, 'user': {
                'id': user.id,
                'username': user.username,
                'lastname': user.lastname,
                'email': user.email
            }})
        else:
            return jsonify({'success': False, 'error': 'Invalid email or password'})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Error checking email and password'})

@app.route('/map')
def map():
    try:
        user_id = request.args.get('id')
        user = User.query.get(user_id)
        if user:
            return render_template('map.html', user=user)
        else:
            return 'No user found with the provided ID'
    except Exception as e:
        print(e)
        return 'Error fetching user details from the database'

    
if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
