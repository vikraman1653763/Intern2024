from flask import Flask, render_template, request, flash, jsonify, redirect, url_for
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired
from flask_wtf.file import FileField, FileRequired
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz

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
    
class folders(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(2000), nullable=False)
    date_added = db.Column(db.DateTime, default=datetime.now(pytz.timezone('Asia/Kolkata')))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref='folders', foreign_keys=[user_id])

    def __repr__(self):
        return '<Folder %r>' % self.name
class FolderForm(FlaskForm):
    name = StringField('Name', validators=[DataRequired()])
    submit = SubmitField('Submit')

@app.route('/favicon.ico')
def favicon():
    return '', 404

@app.route('/')
def register_page():
    action='register'
    return render_template('register.html', action=action)

@app.route('/success.html')
def success_page():
    return render_template('success.html')

@app.route('/verify_otp', methods=['POST'])
def verify_otp():
    try:
        # Retrieve user details from the request
        data = request.get_json()
        username = data.get('username')
        lastname = data.get('lastname')
        email = data.get('email')
        password = data.get('password')
        
        # Save user details to the database
        new_user = User(username=username, lastname=lastname, email=email, password=password)
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

@app.route('/folder/<int:id>', methods=['GET', 'POST'])
def folder(id):
    form = FolderForm()
    
    if form.validate_on_submit():
        try:
            folder = form.name.data
            new_folder = folders(name=folder, user_id=id)
            db.session.add(new_folder)
            db.session.commit()
            flash("Folder created successfully")
            return redirect(url_for('folder', id=id))
        except Exception as e:
            flash(f"Error creating folder: {str(e)}")
    
    user = User.query.get(id)  # Fetch user based on ID
    user_folders = folders.query.filter_by(user_id=id).order_by(folders.date_added.desc()).all()
    
    return render_template('folder.html', form=form, user=user, user_folders=user_folders, id=id)


@app.route('/updatefold/<int:id>', methods=['GET', 'POST'])
def updatefold(id):
    form = FolderForm()
    foldertoupdate = folders.query.get_or_404(id)

    if request.method == "POST":
        foldertoupdate.name = request.form['name']

        try:
            db.session.commit()
            flash("Updated successfully")
            return redirect(url_for('folder', id=foldertoupdate.user_id))
        except:
            flash("Update failed")
            return render_template('updatefolder.html', form=form, foldertoupdate=foldertoupdate, id=id)
    else:
        return render_template('updatefolder.html', form=form, foldertoupdate=foldertoupdate, id=id)


@app.route('/deletefold/<int:id>', methods=['GET', 'POST'])
def deletefold(id):
    foldertodelete = folders.query.get_or_404(id)

    try:
        db.session.delete(foldertodelete)
        db.session.commit()
        flash("Deleted successfully")
    except:
        flash("Oops, delete failed")

    return redirect(url_for('folder', id=foldertodelete.user_id))


if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)
