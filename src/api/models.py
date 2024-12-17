from flask_sqlalchemy import SQLAlchemy
from sqlalchemyseeder import ResolvingSeeder
import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from datetime import datetime

db = SQLAlchemy()

class UserRoleEnum(enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    EDUADMIN = "eduadmin" #Educational Admin from the institution
    INSTITUTION = "institution"
    PARENT = "parent"
    SERVICE = "service" #Customer Service
    DEV = "dev"

class UserStatusEnum(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECIATED = "depreciated"
    GRADUATED= "graduated"

class EvaluationPeriodTypeEnum(enum.Enum):
    QUARTERLY = "quarterly"
    SEMESTER = "semester"
    TRIMESTER = "trimester"
    ANNUAL = "annual"

class InstitutionStatusEnum(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"

class RelatedClassLevelStatusEnum(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted" 
    REJECTED = "rejected"

class MembershipTypeEnum(enum.Enum):
    BASIC = "basic"
    ESTANDARD_X_STUDENTS = "estandardXStudents"
    ESTANDARD_PLAN = "estandardPlan"
    PREMIUM_X_STUDENT = "premiumXStudent"
    PREMIUM_PLAN = "premiumPlan"
    GOLD_X_STUDENT = "goldXStudent"
    GOLD_PLAN = "goldPlan"

class BillingFrequencyEnum(enum.Enum):
    MONTHLY = "monthly"
    PERIODIC = "periodic"
    SEMESTER = "semester"
    ANNUAL = "annual"

class TokenBlockedList(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(1000), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

class EducationalInstitution(db.Model):
    __tablename__ = 'educationalInstitution'
    
    idInstitution = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    institutionName = db.Column(db.String(150), nullable=False)
    institutionCountry = db.Column(db.String(50), nullable=False)
    countryState = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    institutionPhone = db.Column(db.String(50), nullable=False)
    contactPerson = db.Column(db.String(100), nullable=False)
    contactPhone = db.Column(db.String(50), nullable=False)
    institutionEmail = db.Column(db.String(100), nullable=False, unique=True)
    websiteUrl = db.Column(db.String(100), nullable=True)
    
    accountingService = db.Column(db.Boolean, default=False, nullable=False)
    logo = db.Column(db.String, nullable=True)
    slogan = db.Column(db.String, nullable=True)
    
    status = db.Column(db.Enum(InstitutionStatusEnum, name="institution_status_enum"), nullable=False, default=InstitutionStatusEnum.ACTIVE)
    typeEvaluationPeriod = db.Column(db.Enum(EvaluationPeriodTypeEnum, name="evaluation_period_type_enum"), nullable=False)
    firstPeriodDate = db.Column(db.Date, nullable=False)
    secondPeriodDate = db.Column(db.Date, nullable=True)
    thirdPeriodDate = db.Column(db.Date, nullable=True)
    fourthPeriodDate = db.Column(db.Date, nullable=True)
    
    firstPeriodPercentage = db.Column(db.Float, nullable=False, default=0.0)
    secondPeriodPercentage = db.Column(db.Float, nullable=False, default=0.0)
    thirdPeriodPercentage = db.Column(db.Float, nullable=False, default=0.0)
    fourthPeriodPercentage = db.Column(db.Float, nullable=False, default=0.0)
    
    createdAt = db.Column(db.DateTime, default=datetime.now, nullable=False)
    updatedAt = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)

    
    def __repr__(self):
        return f'<EducationalInstitution {self.institutionName}>'
    
    def serialize(self):
        return {
            "idInstitution": self.idInstitution,
            "institutionName": self.institutionName,
            "institutionCountry": self.institutionCountry,
            "countryState": self.countryState,
            "address": self.address,
            "institutionPhone": self.institutionPhone,
            "contactPerson": self.contactPerson,
            "contactPhone": self.contactPhone,
            "institutionEmail": self.institutionEmail,
            "websiteUrl": self.websiteUrl,
            
            "accountingService": self.accountingService,
            "logo": self.logo,
            "slogan": self.slogan,
            
            "status": self.status.value,  # Enum to string
            "typeEvaluationPeriod": self.typeEvaluationPeriod.value,  # Enum to string
            "firstPeriodDate": self.firstPeriodDate,
            "secondPeriodDate": self.secondPeriodDate,
            "thirdPeriodDate": self.thirdPeriodDate,
            "fourthPeriodDate": self.fourthPeriodDate,
            
            "firstPeriodPercentage": self.firstPeriodPercentage,
            "secondPeriodPercentage": self.secondPeriodPercentage,
            "thirdPeriodPercentage": self.thirdPeriodPercentage,
            "fourthPeriodPercentage": self.fourthPeriodPercentage,
        
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }

class ClassLevel(db.Model):
    __tablename__ = 'classLevel'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    level = db.Column(db.Integer, nullable=False)
    section = db.Column(db.String(4), nullable=True)
    institutionId = db.Column(db.Integer, db.ForeignKey('educationalInstitution.idInstitution'), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)  # Campo para marcar eliminación

    institution = db.relationship('EducationalInstitution', backref='classLevels', lazy=True)
    relatedClassLevels = db.relationship('RelatedClassLevel', backref='classLevel', lazy=True)

    def __repr__(self):
        return f'<ClassLevel {self.level} {self.section}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "level": self.level,
            "section": self.section,
            "institutionId": self.institutionId,
            'code': self.code,
            'is_deleted': self.is_deleted,
            "relatedClassLevels": [relatedClassLevel.serialize() for relatedClassLevel in self.relatedClassLevels]
        }


class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    institutionId = db.Column(db.Integer, db.ForeignKey('educationalInstitution.idInstitution'), nullable=True)
    role = db.Column(db.Enum(UserRoleEnum, name="user_role_enum"), nullable=False)
    status = db.Column(db.Enum(UserStatusEnum, name="user_status_enum"), nullable=False, default=UserStatusEnum.ACTIVE)

    firstName = db.Column(db.String(50), nullable=False)
    firstLastname = db.Column(db.String(50), nullable=False)
    secondLastname = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(400), nullable=False)
    temporaryPassword = db.Column(db.Boolean, default=True)

    # Relación con RelatedClassLevel (para profesores y estudiantes)
    relatedClassLevels = db.relationship('RelatedClassLevel', backref='user', lazy=True)

    address = db.Column(db.String(200), nullable=True)
    principalPhone = db.Column(db.String(30), nullable=False)
    secondPhone = db.Column(db.String(30), nullable=True)
    profilePicture = db.Column(db.String(1000), nullable=True)
    userPosition = db.Column(db.String(100), nullable=True)
    details = db.Column(db.String(250), nullable=True)
    
    country = db.Column(db.String(70), nullable=False)
    dni = db.Column(db.String(20), nullable=False)
    
    createdAt = db.Column(db.DateTime, default=datetime.now, nullable=False)
    updatedAt = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)

    username = db.Column(db.String(50), nullable=True)


    def __repr__(self):
        return f'<User {self.email}>'
    
    def serialize(self):
        return {
            "id": self.id,
            "institutionId": self.institutionId,
            "role": self.role.value,  # Enum to string
            "status": self.status.value,
            "firstName": self.firstName,
            "firstLastname": self.firstLastname,
            "secondLastname": self.secondLastname,
            "email": self.email,
            "password":self.password,
            "address": self.address,
            "principalPhone": self.principalPhone,
            "secondPhone": self.secondPhone,
            "profilePicture": self.profilePicture,
            "userPosition": self.userPosition,
            "details": self.details,
            "country": self.country,
            "dni": self.dni,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
            "username": self.username,
            "temporaryPassword": self.temporaryPassword,
            "relatedClassLevels": [relatedClassLevel.serialize() for relatedClassLevel in self.relatedClassLevels]  # Serializa la lista de RelatedClassLevels
        }

class RelatedClassLevel(db.Model):
    __tablename__ = 'relatedClassLevel'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    classLevelId = db.Column(db.Integer, db.ForeignKey('classLevel.id'), nullable=False)
    status = db.Column(db.Enum(RelatedClassLevelStatusEnum, name="related_class_level_status_enum"), nullable=False, default=RelatedClassLevelStatusEnum.PENDING)
    

    def __repr__(self):
        return f'<RelatedClassLevel UserId={self.userId} ClassLevelId={self.classLevelId}>'

    def serialize(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "classLevelId": self.classLevelId,
            "status": self.status.name  # Convertir Enum a string
        }

class StudentParent(db.Model):
    __tablename__ = 'studentParent'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    studentId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parentId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    relationType = db.Column(db.String(50), nullable=True)  # Opcional: Para especificar la relación (ej. 'Father', 'Mother')

    student = db.relationship('User', foreign_keys=[studentId], backref=db.backref('parents', lazy=True))
    parent = db.relationship('User', foreign_keys=[parentId], backref=db.backref('children', lazy=True))

    def __repr__(self):
        return f'<StudentParent StudentId={self.studentId} ParentId={self.parentId}>'

    def serialize(self):
        return {
            "id": self.id,
            "studentId": self.studentId,
            "parentId": self.parentId,
            "relationType": self.relationType
        }

class Subject(db.Model):
    __tablename__ = 'subject'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), nullable=False)
    institutionId = db.Column(db.Integer, db.ForeignKey('educationalInstitution.idInstitution'), nullable=False)
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)  # Nuevo campo booleano

    # Relación con EducationalInstitution
    institution = db.relationship('EducationalInstitution', backref='subjects', lazy=True)

    def __repr__(self):
        return f'<Subject {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'institutionId': self.institutionId,  
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt,
            'is_deleted': self.is_deleted
        }

    
class LevelSubject(db.Model):
    __tablename__ = 'levelSubject'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    classLevelId = db.Column(db.Integer, db.ForeignKey('classLevel.id'), nullable=False)
    subjectId = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)  # Nuevo campo booleano

    # Relación con ClassLevel
    classLevel = db.relationship('ClassLevel', backref='levelSubjects', lazy=True)
    # Relación con Subject
    subject = db.relationship('Subject', backref='levelSubjects', lazy=True, foreign_keys=[subjectId])

    def __repr__(self):
        return f'<LevelSubject {self.classLevelId} - {self.subjectId}>'

    def serialize(self):
        return {
            'id': self.id,
            'classLevelId': self.classLevelId,
            'subjectId': self.subjectId,
            'is_deleted': self.is_deleted
        }

    
class TeacherSyllabus(db.Model):
    __tablename__ = 'teacherSyllabus'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(150), nullable=True)
    teacherId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Cambia 'user.id' si el nombre de la tabla es diferente
    isDraft = db.Column(db.Boolean, default=True)
    isPublic = db.Column(db.Boolean, default=False)
    isGlobal = db.Column(db.Boolean, default=False)
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relación con User
    teacher = db.relationship('User', backref='teacherSyllabi', lazy=True)

    def __repr__(self):
        return f'<TeacherSyllabus {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'teacherId': self.teacherId,
            'isDraft': self.isDraft,
            'isPublic': self.isPublic,
            'isGlobal': self.isGlobal,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt
        }

class SubjectAssignment(db.Model):
    __tablename__ = 'subjectAssignment'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    comment = db.Column(db.String(100), nullable=True)
    levelSubjectId = db.Column(db.Integer, db.ForeignKey('levelSubject.id'), nullable=False)
    teacherId = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    startDate = db.Column(db.Date, nullable=True)
    endDate = db.Column(db.Date, nullable=True)
    institutionId = db.Column(db.Integer, db.ForeignKey('educationalInstitution.idInstitution'), nullable=False)
    syllabusId = db.Column(db.Integer, db.ForeignKey('teacherSyllabus.id'), nullable=True)
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)  # Nuevo campo booleano

    # Relaciones
    levelSubject = db.relationship('LevelSubject', backref='subjectAssignments', lazy=True)
    teacher = db.relationship('User', backref='subjectAssignments', lazy=True)
    institution = db.relationship('EducationalInstitution', backref='subjectAssignments', lazy=True)
    syllabus = db.relationship('TeacherSyllabus', backref='subjectAssignments', lazy=True)

    def __repr__(self):
        return f'<SubjectAssignment {self.id}>'

    def serialize(self):
        return {
            'id': self.id,
            'comment': self.comment,
            'levelSubjectId': self.levelSubjectId,
            'teacherId': self.teacherId,
            'startDate': self.startDate,
            'endDate': self.endDate,
            'institutionId': self.institutionId,
            'syllabusId': self.syllabusId,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt,
            'is_deleted': self.is_deleted  # Incluir en la serialización
        }


    
class InstitutionMembership(db.Model):
    __tablename__ = 'institutionMembership'
    
    idMembership = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    institutionId = db.Column(db.Integer, db.ForeignKey('educationalInstitution.idInstitution'), nullable=False)
    membershipName = db.Column(db.String(100), nullable=False)
    membershipType = db.Column(db.Enum(MembershipTypeEnum, name="membership_type_enum"), nullable=False)
    paymentDay = db.Column(db.Date, nullable=False)
    startDate = db.Column(db.Date, nullable=False)
    endDate = db.Column(db.Date, nullable=False)
    discount = db.Column(db.Float, nullable=True)  # Column for optional discount
    billingFrequency = db.Column(db.Enum(BillingFrequencyEnum, name="billing_frequency_enum"), nullable=False)  # Column for billing frequency
    createdAt = db.Column(db.DateTime, default=datetime.now, nullable=False)
    updatedAt = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)

    def __repr__(self):
        return f'<InstitutionMembership {self.membershipName}>'
    
    def serialize(self):
        return {
            "idMembership": self.idMembership,
            "institutionId": self.institutionId,
            "membershipName": self.membershipName,
            "membershipType": self.membershipType.value,  # Enum to string
            "paymentDay": self.paymentDay,
            "startDate": self.startDate,
            "endDate": self.endDate,
            "discount": self.discount,
            "billingFrequency": self.billingFrequency.value,  # Enum to string
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }


class Unit(db.Model):
    __tablename__ = 'unit'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    teacherSyllabusId = db.Column(db.Integer, db.ForeignKey('teacherSyllabus.id'), nullable=False)  # Clave foránea que referencia a TeacherSyllabus
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    teacherSyllabus = db.relationship('TeacherSyllabus', backref='units', lazy=True)

    def __repr__(self):
        return f'<Unit {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'teacherSyllabusId': self.teacherSyllabusId,
            'name': self.name,
            'description': self.description,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt
        }

class Topic(db.Model):
    __tablename__ = 'topic'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    unitId = db.Column(db.Integer, db.ForeignKey('unit.id'), nullable=False)  # Clave foránea que referencia a Unit
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    createdAt = db.Column(db.DateTime, server_default=db.func.now())
    updatedAt = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Relación con Unit
    unit = db.relationship('Unit', backref='topics', lazy=True)

    def __repr__(self):
        return f'<Topic {self.name}>'

    def serialize(self):
        return {
            'id': self.id,
            'unitId': self.unitId,
            'name': self.name,
            'description': self.description,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt
        }


def seed():
    seeder = ResolvingSeeder(db.session)
    seeder.register(EducationalInstitution)
    seeder.register(ClassLevel)
    seeder.register(User)
    seeder.load_entities_from_json_file("seedData.json")
    db.session.commit()