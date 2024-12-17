  
import os
from flask_admin import Admin
from .models import db, User, TokenBlockedList, EducationalInstitution, ClassLevel,RelatedClassLevel, Subject, LevelSubject, TeacherSyllabus, Unit, Topic, SubjectAssignment
from flask_admin.contrib.sqla import ModelView



def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='Apollo Admin', template_mode='bootstrap3')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(EducationalInstitution, db.session))
    admin.add_view(ModelView(ClassLevel, db.session))
    admin.add_view(ModelView(Subject, db.session))
    admin.add_view(ModelView(LevelSubject, db.session))
    admin.add_view(ModelView(SubjectAssignment, db.session))
    admin.add_view(ModelView(RelatedClassLevel, db.session))
    admin.add_view(ModelView(TeacherSyllabus, db.session))
    admin.add_view(ModelView(Unit, db.session))
    admin.add_view(ModelView(Topic, db.session))
    admin.add_view(ModelView(TokenBlockedList, db.session))


    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))