"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""


from sqlalchemy.exc import SQLAlchemyError
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, StudentParent, Unit, Topic, TokenBlockedList, seed, EducationalInstitution, ClassLevel, RelatedClassLevel, RelatedClassLevelStatusEnum, Subject, LevelSubject, SubjectAssignment, InstitutionStatusEnum, EvaluationPeriodTypeEnum, UserRoleEnum, UserStatusEnum
from api.utils import generate_sitemap, APIException
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timezone
# from cryptography.fernet import Fernet  

from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError
import traceback
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)

import smtplib
import ssl
import os
import random, string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import logging


smtp_address = os.getenv("SMTP_ADDRESS")
smtp_port = os.getenv("EMAIL_PORT")
email_address = os.getenv("EMAIL_ADDRESS")
email_password = os.getenv("EMAIL_PASSWORD")

# cryptography.fernet for the token
# Obtener la clave de encriptación desde el entorno
# encryption_key = os.getenv('ENCRYPTION_KEY')
# cipher = Fernet(encryption_key)


#middleware
api = Blueprint('api', __name__)
app = Flask(__name__)
bcrypt = Bcrypt(app)
logger = logging.getLogger(__name__)

#Funciones Utilitarias

def send_email(asunto, destinatario, body):
    message = MIMEMultipart("alternative")
    message["Subject"] = asunto
    message["From"] = email_address
    message["To"] = destinatario

    # Version HTML del body
    html = '''  
    <html>
    <body>
    <div>
    <h1></h1>
    ''' + body + '''
    </div>
    </body>
    </html> 
    '''

    # Crear elemento MIME
    html_mime = MIMEText(html, 'html')
    # adjuntamos el codigo del mensaje
    message.attach(html_mime)

    # Enviar el correo
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_address, smtp_port, context=context) as server:
            server.login(email_address, email_password)
            server.sendmail(email_address, destinatario, message.as_string())
        return True
    except Exception as error:
        print(str(error))
        return False


import random

def generate_username(first_name, last_name, institution_name):
    # Elimina los espacios y concatena el nombre y el apellido
    base_username = f"{first_name}{last_name}".replace(" ", "")
    
    # Genera la abreviatura de la institución (primeras letras de cada palabra)
    institution_part = ''.join([word[0].upper() for word in institution_name.split()])
    
    # Formatea el username base
    username = f"{base_username}.{institution_part}"
    
    # Verifica si el username ya existe
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        # Si ya existe, agrega un número al final
        while True:
            random_number = random.randint(1, 99)
            new_username = f"{first_name}{last_name}{random_number:02d}.{institution_part}"
            existing_user = User.query.filter_by(username=new_username).first()
            if not existing_user:
                return new_username
    else:
        return username

def generate_password(length=10):
    # Genera una contraseña aleatoria
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def generate_temporaryPassword(length=8):
    # Genera una contraseña aleatoria
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def generate_class_level_code(institution_id, level, section):
    # Convertir el nivel a cadena
    level_str = str(level)
    
    # Verificar si la sección está vacía o contiene solo espacios
    if not section.strip():
        # Si la sección está vacía o solo tiene espacios, no incluirla en el código
        level_code = f"{institution_id}-{level_str}"
    else:
        # Si la sección es válida, incluirla en el código
        section_str = section.strip()  # Elimina espacios adicionales al inicio y al final
        level_code = f"{institution_id}-{level_str}-{section_str}"
    
    return level_code


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200



@api.route('/institution', methods=['POST'])
def create_institution():
    try:
        # Obtener los datos del request
        data = request.json
        
        institution_name = data.get("institutionName")
        institution_country = data.get("institutionCountry")
        country_state = data.get("countryState")
        address = data.get("address")
        institution_phone = data.get("institutionPhone")
        contact_person = data.get("contactPerson")
        contact_phone = data.get("contactPhone")
        institution_email = data.get("institutionEmail")
        website_url = data.get("websiteUrl")
        accounting_service = data.get("accountingService", False)
        logo = data.get("logo")
        slogan = data.get("slogan")
        
        # Validar enums
        try:
            status = InstitutionStatusEnum[data.get("status", InstitutionStatusEnum.ACTIVE.name)]
            type_evaluation_period = EvaluationPeriodTypeEnum[data.get("typeEvaluationPeriod")]
        except KeyError as ke:
            return jsonify({"error": f"Valor inválido para enum: {str(ke)}"}), 400
        
        # Validar fechas
        try:
            first_period_date = datetime.strptime(data.get("firstPeriodDate"), '%Y-%m-%d').date()
            second_period_date = datetime.strptime(data.get("secondPeriodDate"), '%Y-%m-%d').date() if data.get("secondPeriodDate") else None
            third_period_date = datetime.strptime(data.get("thirdPeriodDate"), '%Y-%m-%d').date() if data.get("thirdPeriodDate") else None
            fourth_period_date = datetime.strptime(data.get("fourthPeriodDate"), '%Y-%m-%d').date() if data.get("fourthPeriodDate") else None
        except ValueError as ve:
            return jsonify({"error": f"Formato de fecha inválido: {str(ve)}"}), 400
        
        first_period_percentage = data.get("firstPeriodPercentage", 0.0)
        second_period_percentage = data.get("secondPeriodPercentage", 0.0)
        third_period_percentage = data.get("thirdPeriodPercentage", 0.0)
        fourth_period_percentage = data.get("fourthPeriodPercentage", 0.0)
        
        
        
        # Crear la nueva institución
        new_institution = EducationalInstitution(
            institutionName=institution_name,
            institutionCountry=institution_country,
            countryState=country_state,
            address=address,
            institutionPhone=institution_phone,
            contactPerson=contact_person,
            contactPhone=contact_phone,
            institutionEmail=institution_email,
            websiteUrl=website_url,
            accountingService=accounting_service,
            logo=logo,
            slogan=slogan,
            status=status,
            typeEvaluationPeriod=type_evaluation_period,
            firstPeriodDate=first_period_date,
            secondPeriodDate=second_period_date,
            thirdPeriodDate=third_period_date,
            fourthPeriodDate=fourth_period_date,
            firstPeriodPercentage=first_period_percentage,
            secondPeriodPercentage=second_period_percentage,
            thirdPeriodPercentage=third_period_percentage,
            fourthPeriodPercentage=fourth_period_percentage,
            
        )
        
        # Guardar la institución en la base de datos
        db.session.add(new_institution)
        db.session.commit()
        
        return jsonify({"msg": "Institución educativa registrada", "institution": new_institution.serialize()}), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    
    except Exception as e:
        return jsonify({"error": f"Error inesperado: {str(e)}"}), 500

@api.route('/institution', methods=['GET'])
def get_institutions():
    try:
        # Obtener parámetros de consulta
        id_institution = request.args.get('idInstitution', type=int)
        institution_name = request.args.get('institutionName')
        institution_country = request.args.get('institutionCountry')
        country_state = request.args.get('countryState')
        status = request.args.get('status')
        created_by = request.args.get('createdBy', type=int)

        # Construir la consulta base
        query = EducationalInstitution.query

        # Aplicar filtros condicionalmente
        if id_institution is not None:
            query = query.filter_by(idInstitution=id_institution)
        if institution_name:
            query = query.filter(EducationalInstitution.institutionName.ilike(f'%{institution_name}%'))
        if institution_country:
            query = query.filter(EducationalInstitution.institutionCountry.ilike(f'%{institution_country}%'))
        if country_state:
            query = query.filter(EducationalInstitution.countryState.ilike(f'%{country_state}%'))
        if status:
            try:
                status_enum = InstitutionStatusEnum[status]
                query = query.filter_by(status=status_enum.name)
            except KeyError:
                return jsonify({"error": "Estado inválido"}), 400
        if created_by is not None:
            query = query.filter_by(createdBy=created_by)

        # Ejecutar la consulta
        institutions = query.all()

        # Serializar la lista de instituciones
        institutions_list = [institution.serialize() for institution in institutions]

        return jsonify(institutions_list), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# classlevel Routes 

# Create classlevel
@api.route('/classlevel', methods=['POST'])
@jwt_required()
def create_classlevel():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar que el usuario tenga permisos para crear un nivel de clase
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para crear niveles de clase"}), 403

        # Obtener los datos del cuerpo de la solicitud
        level = request.json.get("level")
        section = request.json.get("section")

        # Asegúrate de que todos los campos obligatorios estén presentes
        if not all([level]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400

        # Obtener el institutionId del usuario autenticado
        if current_user.role == UserRoleEnum.INSTITUTION or current_user.role == UserRoleEnum.EDUADMIN:
            institutionId = current_user.institutionId
        elif current_user.role == UserRoleEnum.DEV or current_user.role == UserRoleEnum.SERVICE:
            institutionId = request.json.get("institutionId")
            if not institutionId:
                return jsonify({"error": "Institution ID es requerido para el rol DEV o SERVICE"}), 400

            # Validar que el institutionId exista en la base de datos
            institution = EducationalInstitution.query.get(institutionId)
            if not institution:
                return jsonify({"error": "Institution ID no válido"}), 404
        else:
            return jsonify({"error": "Rol no permitido"}), 403

        # Verificar si ya existe un ClassLevel con el mismo nivel y sección en la misma institución
        existing_classlevel = ClassLevel.query.filter_by(
            institutionId=institutionId,
            level=level,
            section=section
        ).first()

        if existing_classlevel:
            return jsonify({"error": "Ya existe una clase con este nivel y sección en la institución"}), 400

        # Generar el código de nivel de clase
        code = generate_class_level_code(institutionId, level, section)

        # Crear una nueva instancia de ClassLevel
        new_classlevel = ClassLevel(
            level=level,
            section=section,
            institutionId=institutionId,
            code=code
        )

        # Agregar el nuevo ClassLevel a la base de datos
        db.session.add(new_classlevel)
        db.session.commit()

        return jsonify(new_classlevel.serialize()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Get all classlevel
@api.route('/classlevel', methods=['GET'])
def get_classlevels():
    try:
        # Obtener parámetros de consulta
        level = request.args.get('level')
        institution_id = request.args.get('institutionId')
        id = request.args.get('id')  # Añadido para el filtro por ID

        # Construir la consulta base
        query = ClassLevel.query

        # Aplicar filtros condicionalmente
        if level:
            try:
                level = int(level)  # Convertir a entero para comparar con el campo de tipo integer
                query = query.filter_by(level=level)
            except ValueError:
                return jsonify({"error": "Nivel inválido"}), 400

        if institution_id:
            try:
                institution_id = int(institution_id)  # Asegurarse de que el ID sea un entero
                query = query.filter_by(institutionId=institution_id)
            except ValueError:
                return jsonify({"error": "ID de institución inválido"}), 400

        if id:
            try:
                id = int(id)  # Asegurarse de que el ID sea un entero
                query = query.filter_by(id=id)
            except ValueError:
                return jsonify({"error": "ID inválido"}), 400

        # Ejecutar la consulta
        classlevels = query.all()

        # Serializar la lista de niveles de clase
        classlevels_list = [classlevel.serialize() for classlevel in classlevels]

        return jsonify(classlevels_list), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# Get classlevel by rol
@api.route('/classlevel/user', methods=['GET'])
@jwt_required()
def get_classlevelsbyuser():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Obtener parámetros de consulta
        level = request.args.get('level')
        institution_id = request.args.get('institutionId')
        id = request.args.get('id')  # Añadido para el filtro por ID

        # Construir la consulta base
        query = ClassLevel.query

        # Aplicar filtros según el rol del usuario
        if current_user.role == UserRoleEnum.INSTITUTION or current_user.role == UserRoleEnum.EDUADMIN or current_user.role == UserRoleEnum.TEACHER:
            # Filtrar por institutionId del usuario
            query = query.filter_by(institutionId=current_user.institutionId)

        elif current_user.role == UserRoleEnum.DEV or current_user.role == UserRoleEnum.SERVICE:
            # Los usuarios con rol DEV pueden ver todos los niveles de clase
            if institution_id:
                try:
                    institution_id = int(institution_id)  # Asegurarse de que el ID sea un entero
                    query = query.filter_by(institutionId=institution_id)
                except ValueError:
                    return jsonify({"error": "ID de institución inválido"}), 400

        else:
            return jsonify({"error": "Rol de usuario no permitido"}), 403

        # Aplicar otros filtros condicionalmente
        if level:
            try:
                level = int(level)  # Convertir a entero para comparar con el campo de tipo integer
                query = query.filter_by(level=level)
            except ValueError:
                return jsonify({"error": "Nivel inválido"}), 400

        if id:
            try:
                id = int(id)  # Asegurarse de que el ID sea un entero
                query = query.filter_by(id=id)
            except ValueError:
                return jsonify({"error": "ID inválido"}), 400

        # Ejecutar la consulta
        classlevels = query.all()

        # Serializar la lista de niveles de clase
        classlevels_list = [classlevel.serialize() for classlevel in classlevels]

        return jsonify(classlevels_list), 200

    except SQLAlchemyError as e:
        logging.error(f"Error en la base de datos: {str(e)}")
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        logging.error(f"Error inesperado: {str(e)}")
        return jsonify({"error": "Error inesperado", "traceback": str(e)}), 500

# Get unrelated ClassLevel of subject
@api.route('/classlevel/unrelated/<int:subject_id>', methods=['GET'])
@jwt_required()
def get_unrelated_classlevels(subject_id):
    try:
        # Obtener la identidad del usuario actual
        user_id = get_jwt_identity()
        
        # Obtener el usuario desde la base de datos
        user = User.query.get(user_id)

        # Obtener todos los classLevels
        all_classlevels = ClassLevel.query.all()

        # Obtener los classLevels relacionados con el subjectId dado
        related_classlevels = LevelSubject.query.filter(LevelSubject.subjectId == subject_id).all()
        related_classlevel_ids = {level.classLevelId for level in related_classlevels}

        # Debug: imprime los IDs de los niveles relacionados
        print(f"IDs de classLevels relacionados: {related_classlevel_ids}")

        # Filtrar los classLevels según el rol del usuario
        if user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            # Filtrar por la institución del usuario
            available_classlevels = [
                classlevel for classlevel in all_classlevels
                if classlevel.id not in related_classlevel_ids and classlevel.institutionId == user.institutionId
            ]
        elif user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            # Si es DEV o SERVICE, mostrar todos los classLevels no relacionados
            available_classlevels = [
                classlevel for classlevel in all_classlevels
                if classlevel.id not in related_classlevel_ids
            ]
        else:
            # Por defecto, no hay niveles disponibles
            available_classlevels = []

        # Debug: imprime los IDs de los niveles disponibles
        print(f"IDs de classLevels disponibles: {[classlevel.id for classlevel in available_classlevels]}")

        # Serializar la lista de niveles de clase disponibles
        available_classlevels_list = [classlevel.serialize() for classlevel in available_classlevels]

        return jsonify(available_classlevels_list), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



    
# Edit ClassLevel by rol 
@api.route('/classlevel/<int:id>', methods=['PUT'])
@jwt_required()
def update_classlevel(id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

         # Verificar que el usuario tenga permisos para crear un nivel de clase
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para crear niveles de clase"}), 403
        
        # Verificar si el nivel de clase existe
        classlevel = ClassLevel.query.get(id)
        if not classlevel:
            return jsonify({"message": "Class level not found"}), 404

        # Obtener datos del request
        data = request.get_json()
        new_institution_id = data.get('institutionId')
        new_level = data.get('level')
        new_section = data.get('section')
        password = data.get('password')
        
        # Obtener el usuario autenticado
        user_identity = get_jwt_identity()
        if isinstance(user_identity, dict):
            user_id = user_identity.get('id')
        else:
            user_id = user_identity
        
        # Verificar si el usuario existe
        user_instance = User.query.get(user_id)
        if not user_instance:
            return jsonify({"message": "User not found"}), 404
        
        # Verificar la contraseña del usuario
        if user_instance.temporaryPassword:
            if password != user_instance.password:
                return jsonify({"message": "Wrong password"}), 401
        else:
            if not bcrypt.check_password_hash(user_instance.password, password):
                return jsonify({"message": "Wrong password"}), 401
        
        # Verificar dependencias con otras tablas
        has_dependencies = RelatedClassLevel.query.filter_by(classLevelId=id).count() > 0
        has_subjects = Subject.query.filter_by(classLevelId=id).count() > 0

        if has_dependencies or has_subjects:
            return jsonify({"message": "Cannot edit class level because it has dependencies"}), 400
        
        # Verificar si la combinación level y section ya existe en la misma institución
        if new_institution_id is not None:
            existing_classlevel = ClassLevel.query.filter_by(
                institutionId=new_institution_id,
                level=new_level,
                section=new_section.upper()
            ).first()
            
            if existing_classlevel:
                return jsonify({"message": "A class level with the same level and section already exists in this institution"}), 400
        
        # Modificar otros campos
        if new_level is not None:
            classlevel.level = new_level
        if new_section is not None:
            classlevel.section = new_section.upper()  # Asegurarse de que esté en mayúsculas

        # Generar el código de nivel de clase
        code = generate_class_level_code(classlevel.institutionId, classlevel.level, classlevel.section)
        classlevel.code = code

        # Guardar cambios
        db.session.commit()
        return jsonify({"message": "Class level updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()  # Asegurarse de hacer rollback en caso de error
        return jsonify({"message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500

# Delete ClassLevel by rol

@api.route('/classlevel/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_classlevel(id):
    try:
        # Verificar si el nivel de clase existe
        classlevel = ClassLevel.query.get(id)
        if not classlevel:
            return jsonify({"message": "Class level not found"}), 404

        # Obtener datos del request
        data = request.get_json()
        password = data.get('password')

        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"message": "User not found"}), 404

        # Verificar que el usuario tenga permiso para eliminar un nivel de clase
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.INSTITUTION}:
            return jsonify({"message": "Unauthorized role to delete class levels"}), 403

        # Verificar la contraseña del usuario
        if current_user.temporaryPassword:
            if password != current_user.password:
                return jsonify({"message": "Wrong password"}), 401
        else:
            if not bcrypt.check_password_hash(current_user.password, password):
                return jsonify({"message": "Wrong password"}), 401

        # Verificar dependencias con otras tablas
        has_dependencies = RelatedClassLevel.query.filter_by(classLevelId=id).count() > 0
        has_subjects = LevelSubject.query.filter_by(classLevelId=id).count() > 0

        if has_dependencies or has_subjects:
            return jsonify({"message": "Cannot delete class level because it has dependencies"}), 400

        # Restricciones de rol
        if current_user.role == UserRoleEnum.INSTITUTION or current_user.role == UserRoleEnum.EDUADMIN:
            if classlevel.institutionId != current_user.institutionId:
                return jsonify({"message": "You can only delete class levels from your own institution"}), 403

        # No se requiere validación adicional para DEV

        # Eliminar el nivel de clase
        db.session.delete(classlevel)
        db.session.commit()
        return jsonify({"message": "Class level deleted successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()  # Asegurarse de hacer rollback en caso de error
        return jsonify({"message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"message": f"An unexpected error occurred: {str(e)}"}), 500

# RelatedClassLevel Routes 
# Solicitud de Nivel de clase
@api.route('/relatedclasslevel', methods=['POST'])
@jwt_required()
def create_related_classlevel():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar que el usuario tenga el rol de estudiante
        if current_user.role != UserRoleEnum.STUDENT:
            return jsonify({"error": "Solo los estudiantes pueden unirse a un nivel de clase"}), 403

        # Verificar si el estudiante ya está asociado con algún ClassLevel
        existing_related_classlevel = RelatedClassLevel.query.filter_by(userId=current_user.id).first()

        if existing_related_classlevel:
            return jsonify({"error": "Ya enviaste una solicitud para unirte a un nivel de clase. No puedes enviar otra a menos que la canceles."}), 400

        # Obtener los datos del cuerpo de la solicitud
        class_level_code = request.json.get("code")

        # Asegurarse de que el código esté presente
        if not class_level_code:
            return jsonify({"error": "El código de nivel de clase es obligatorio"}), 400

        # Buscar el ClassLevel utilizando el código proporcionado y el institutionId del estudiante
        class_level = ClassLevel.query.filter_by(
            code=class_level_code,
            institutionId=current_user.institutionId  # Filtrar también por institutionId
        ).first()

        # Verificar si el ClassLevel existe
        if not class_level:
            return jsonify({"error": "No se encontró ningún nivel de clase con el código proporcionado en tu institución"}), 404

        # Verificar si el estudiante ya está asociado a este ClassLevel
        if RelatedClassLevel.query.filter_by(userId=current_user.id, classLevelId=class_level.id).first():
            return jsonify({"error": "Ya estás asociado con este nivel de clase"}), 400

        # Crear una nueva instancia de RelatedClassLevel
        new_related_classlevel = RelatedClassLevel(
            userId=current_user.id,
            classLevelId=class_level.id,
            status=RelatedClassLevelStatusEnum.PENDING  # Establecer el estado como PENDING inicialmente
        )

        # Agregar el nuevo RelatedClassLevel a la base de datos
        db.session.add(new_related_classlevel)
        db.session.commit()

        return jsonify(new_related_classlevel.serialize()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Get all relatedClassLevels
@api.route('/relatedclasslevel', methods=['GET'])
def get_related_classlevels():
    try:
        # Obtener parámetros de consulta
        user_id = request.args.get('userId')
        class_level_id = request.args.get('classLevelId')
        id = request.args.get('id')  # Filtro por ID

        # Construir la consulta base
        query = RelatedClassLevel.query

        # Aplicar filtros condicionalmente
        if user_id:
            try:
                user_id = int(user_id)  # Convertir a entero para comparar con el campo de tipo integer
                query = query.filter_by(userId=user_id)
            except ValueError:
                return jsonify({"error": "ID de usuario inválido"}), 400

        if class_level_id:
            try:
                class_level_id = int(class_level_id)  # Convertir a entero para comparar con el campo de tipo integer
                query = query.filter_by(classLevelId=class_level_id)
            except ValueError:
                return jsonify({"error": "ID de nivel de clase inválido"}), 400

        if id:
            try:
                id = int(id)  # Convertir a entero para comparar con el campo de tipo integer
                query = query.filter_by(id=id)
            except ValueError:
                return jsonify({"error": "ID inválido"}), 400

        # Ejecutar la consulta
        related_classlevels = query.all()

        # Serializar la lista de niveles de clase relacionados
        related_classlevels_list = [rl.serialize() for rl in related_classlevels]

        return jsonify(related_classlevels_list), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Get relatedClassLevel by user   
@api.route('/relatedclasslevel/user', methods=['GET'])
@jwt_required()
def get_relatedclasslevelsbyuser():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Construir la consulta base con un join a ClassLevel y User
        query = RelatedClassLevel.query.join(ClassLevel, RelatedClassLevel.classLevelId == ClassLevel.id)\
                                       .join(User, RelatedClassLevel.userId == User.id)

        # Filtrar por el rol del usuario
        if current_user.role == UserRoleEnum.STUDENT:
            # Los estudiantes solo pueden acceder a sus propios registros
            query = query.filter(RelatedClassLevel.userId == current_user.id)
        elif current_user.role in [UserRoleEnum.EDUADMIN, UserRoleEnum.INSTITUTION]:
            # Los EDUADMIN e INSTITUTION pueden acceder a todos los registros de su institución
            query = query.filter(ClassLevel.institutionId == current_user.institutionId)
        elif current_user.role in [UserRoleEnum.DEV, UserRoleEnum.SERVICE]:
            # Los roles DEV y SERVICE pueden acceder a todos los registros
            institution_id = request.args.get('institutionId')
            if institution_id:
                try:
                    query = query.filter(ClassLevel.institutionId == int(institution_id))
                except ValueError:
                    return jsonify({"error": "ID de institución inválido"}), 400
        else:
            return jsonify({"error": "No tienes permiso para acceder a estos registros"}), 403

        # Obtener parámetros de consulta opcionales
        user_id = request.args.get('userId')
        class_level_id = request.args.get('classLevelId')
        record_id = request.args.get('id')  # Filtro por ID
        status = request.args.get('status')

        # Aplicar filtros condicionales si se proporcionan
        if user_id:
            try:
                query = query.filter(RelatedClassLevel.userId == int(user_id))
            except ValueError:
                return jsonify({"error": "ID de usuario inválido"}), 400

        if class_level_id:
            try:
                query = query.filter(RelatedClassLevel.classLevelId == int(class_level_id))
            except ValueError:
                return jsonify({"error": "ID de nivel de clase inválido"}), 400

        if record_id:
            try:
                query = query.filter(RelatedClassLevel.id == int(record_id))
            except ValueError:
                return jsonify({"error": "ID inválido"}), 400

        if status:
            try:
                status_enum = RelatedClassLevelStatusEnum[status.upper()]  # Convertir string a enum
                query = query.filter(RelatedClassLevel.status == status_enum)
            except KeyError:
                return jsonify({"error": "Estado inválido. Usa 'pending', 'accepted' o 'rejected'"}), 400

        # Ejecutar la consulta
        related_classlevels = query.all()

        # Serializar los resultados
        related_classlevels_list = [
            {
                **rl.serialize(),  # Serializar RelatedClassLevel
                "classLevel": rl.classLevel.serialize(),  # Incluir nivel y sección de ClassLevel
                "user": {  # Incluir solo ciertos datos del usuario
                    "role": rl.user.role.value,
                    "firstName": rl.user.firstName,
                    "firstLastname": rl.user.firstLastname,
                    "secondLastname": rl.user.secondLastname,
                    "email": rl.user.email,
                    "dni": rl.user.dni
                }
            }
            for rl in related_classlevels
        ]

        return jsonify(related_classlevels_list), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@api.route('/relatedclasslevel/<int:id>', methods=['PUT'])
@jwt_required()
def update_related_classlevel(id):
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar que el usuario tenga un rol adecuado
        if current_user.role not in [UserRoleEnum.EDUADMIN, UserRoleEnum.INSTITUTION, UserRoleEnum.DEV, UserRoleEnum.SERVICE]:
            return jsonify({"error": "No tienes permisos para aceptar o rechazar solicitudes"}), 403

        # Obtener el estado de la solicitud desde el cuerpo de la petición
        new_status = request.json.get("status")

        # Asegurarse de que el estado proporcionado sea válido (ACCEPTED o REJECTED)
        if new_status not in [RelatedClassLevelStatusEnum.ACCEPTED.name, RelatedClassLevelStatusEnum.REJECTED.name]:
            return jsonify({"error": "Estado inválido. Debe ser 'ACCEPTED' o 'REJECTED'"}), 400

        # Buscar el registro en RelatedClassLevel por ID (ya no filtramos solo por PENDING)
        related_classlevel = RelatedClassLevel.query.get(id)

        # Verificar si la solicitud existe
        if not related_classlevel:
            return jsonify({"error": "No se encontró ninguna solicitud con el ID proporcionado"}), 404

        # Actualizar el estado de la solicitud
        related_classlevel.status = RelatedClassLevelStatusEnum[new_status]  # Convertir string a Enum

        # Guardar cambios en la base de datos
        db.session.commit()

        return jsonify(related_classlevel.serialize()), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#Delete Releated ClassLevel Request
@api.route('/relatedclasslevel', methods=['DELETE'])
@jwt_required()
def delete_related_classlevel():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener la lista de IDs desde el cuerpo de la petición
        ids = request.json.get("ids", None)

        # Si no se proporciona "ids", se asume que se trata de un solo ID
        if ids is None:
            id = request.json.get("id")
            if id is None:
                return jsonify({"error": "Se debe proporcionar un ID o una lista de IDs"}), 400
            ids = [id]  # Convertir a lista para manejarlo de la misma manera

        print(f"IDs recibidos: {ids}")

        # Buscar todos los registros relacionados con los IDs proporcionados
        related_classlevels = RelatedClassLevel.query.filter(RelatedClassLevel.id.in_(ids)).all()

        if not related_classlevels:
            return jsonify({"error": "No se encontraron solicitudes con los IDs proporcionados"}), 404

        for related_classlevel in related_classlevels:
            # Verificar los permisos del usuario
            if current_user.role == UserRoleEnum.STUDENT:
                # Solo pueden eliminar si el estado es PENDING o REJECTED
                if related_classlevel.status not in [RelatedClassLevelStatusEnum.PENDING, RelatedClassLevelStatusEnum.REJECTED]:
                    return jsonify({"error": f"No tienes permiso para eliminar la solicitud con ID {related_classlevel.id}"}), 403

        # Eliminar los registros
        for related_classlevel in related_classlevels:
            db.session.delete(related_classlevel)

        db.session.commit()

        return jsonify({"message": "Solicitudes eliminadas exitosamente"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Subject Routes 
# Create subject by rol
@api.route('/subject', methods=['POST'])
@jwt_required()
def create_subject():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar que el usuario tenga permisos para crear un subject
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para crear subjects"}), 403

        # Obtener datos del request
        data = request.get_json()
        name = data.get('name')
        password = data.get('password')

        # Validar que los campos requeridos estén presentes
        if not name or not password:
            return jsonify({"error": "Faltan campos obligatorios"}), 400

        # Verificar la contraseña del usuario
        if current_user.temporaryPassword:
            if password != current_user.password:
                return jsonify({"error": "Contraseña incorrecta"}), 401
        else:
            if not bcrypt.check_password_hash(current_user.password, password):
                return jsonify({"error": "Contraseña incorrecta"}), 401

        # Determinar el institutionId según el rol del usuario
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            institution_id = current_user.institutionId
        elif current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            institution_id = data.get('institutionId')
            if not institution_id:
                return jsonify({"error": "Institution ID es requerido para el rol DEV o SERVICE"}), 400

            # Validar que el institutionId exista en la base de datos
            institution = EducationalInstitution.query.get(institution_id)
            if not institution:
                return jsonify({"error": "Institution ID no válido"}), 404
        else:
            return jsonify({"error": "Rol no permitido"}), 403

        # Verificar si ya existe un subject con el mismo nombre en la misma institución
        existing_subject = Subject.query.filter_by(
            institutionId=institution_id,  # Usar institutionId
            name=name
        ).first()

        if existing_subject:
            return jsonify({"error": "Ya existe un subject con este nombre en la institución"}), 400

        # Crear una nueva instancia de Subject
        new_subject = Subject(
            name=name,
            institutionId=institution_id  # Usar institutionId
        )

        # Agregar el nuevo Subject a la base de datos
        db.session.add(new_subject)
        db.session.commit()

        return jsonify(new_subject.serialize()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Obtener la materia por rol y filtrado
@api.route('/subject/user', methods=['GET'])
@jwt_required()
def get_subjects_by_user():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Obtener parámetros de consulta
        institution_id = request.args.get('institutionId')
        id = request.args.get('id')  # Añadido para el filtro por ID
        name = request.args.get('name')  # Añadido para el filtro por nombre

        # Construir la consulta base
        query = Subject.query

        # Aplicar filtros según el rol del usuario
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN, UserRoleEnum.TEACHER}:
            # Filtrar por institutionId del usuario
            query = query.filter_by(institutionId=current_user.institutionId)

        elif current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            # Los usuarios con rol DEV o SERVICE pueden ver todos los subjects
            if institution_id:
                try:
                    institution_id = int(institution_id)  # Asegurarse de que el ID sea un entero
                    query = query.filter_by(institutionId=institution_id)
                except ValueError:
                    return jsonify({"error": "ID de institución inválido"}), 400

        else:
            return jsonify({"error": "Rol de usuario no permitido"}), 403

        # Aplicar otros filtros condicionalmente
        if id:
            try:
                id = int(id)  # Asegurarse de que el ID sea un entero
                query = query.filter_by(id=id)
            except ValueError:
                return jsonify({"error": "ID inválido"}), 400

        if name:
            # Filtrar por nombre
            query = query.filter(Subject.name.ilike(f'%{name}%'))  # Permitir búsqueda parcial

        # Ejecutar la consulta
        subjects = query.all()

        # Serializar la lista de subjects
        subjects_list = [subject.serialize() for subject in subjects]

        return jsonify(subjects_list), 200

    except SQLAlchemyError as e:
        logging.error(f"Error en la base de datos: {str(e)}")
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        logging.error(f"Error inesperado: {str(e)}")
        return jsonify({"error": "Error inesperado", "traceback": str(e)}), 500

# Edit Subject by Rol
@api.route('/subject/<int:subject_id>', methods=['PUT'])
@jwt_required()
def update_subject(subject_id):
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar que el usuario tenga permisos para actualizar un subject
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para actualizar subjects"}), 403

        # Obtener datos del request
        data = request.get_json()
        name = data.get('name')
        password = data.get('password')

        # Validar que los campos requeridos estén presentes
        if not name or not password:
            return jsonify({"error": "Faltan campos obligatorios"}), 400

        # Verificar la contraseña del usuario
        if current_user.temporaryPassword:
            if password != current_user.password:
                return jsonify({"error": "Contraseña incorrecta"}), 401
        else:
            if not bcrypt.check_password_hash(current_user.password, password):
                return jsonify({"error": "Contraseña incorrecta"}), 401

        # Obtener el subject a actualizar
        subject = Subject.query.get(subject_id)

        if not subject:
            return jsonify({"error": "Subject no encontrado"}), 404

        # Verificar que el subject pertenezca a la institución del usuario solo si no es DEV ni SERVICE
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            if subject.institutionId != current_user.institutionId:
                return jsonify({"error": "No tienes permiso para actualizar este subject"}), 403

        # Actualizar el nombre del subject
        subject.name = name

        # Guardar los cambios en la base de datos
        db.session.commit()

        return jsonify(subject.serialize()), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete Subject by rol and if it has dependecies
@api.route('/subject/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_subject(id):
    try:
        # Verificar si el subject existe
        subject = Subject.query.get(id)
        if not subject:
            return jsonify({"message": "Subject no encontrado"}), 404

        # Obtener datos del request
        data = request.get_json()
        password = data.get('password')

        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"message": "Usuario no encontrado"}), 404

        # Verificar que el usuario tenga permiso para eliminar un subject
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"message": "Rol no autorizado para eliminar subjects"}), 403

        # Verificar la contraseña del usuario
        if current_user.temporaryPassword:
            if password != current_user.password:
                return jsonify({"message": "Contraseña incorrecta"}), 401
        else:
            if not bcrypt.check_password_hash(current_user.password, password):
                return jsonify({"message": "Contraseña incorrecta"}), 401

        # Verificar dependencias con otras tablas
        has_level_subjects = LevelSubject.query.filter_by(subjectId=id).count() > 0
        has_subject_assignments = SubjectAssignment.query.filter_by(subjectId=id).count() > 0

        if has_level_subjects or has_subject_assignments:
            return jsonify({"message": "No se puede eliminar el subject porque tiene dependencias"}), 400

        # Restricciones de rol
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            if subject.institutionId != current_user.institutionId:
                return jsonify({"message": "Solo puedes eliminar subjects de tu propia institución"}), 403

        # No se requiere validación adicional para DEV o SERVICE

        # Eliminar el subject
        db.session.delete(subject)
        db.session.commit()

        return jsonify({"message": "Subject eliminado exitosamente"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()  # Asegurarse de hacer rollback en caso de error
        return jsonify({"message": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"message": f"Ocurrió un error inesperado: {str(e)}"}), 500


@api.route('/subject', methods=['GET'])
def get_subjects():
    try:
        # Obtener parámetros de consulta
        name = request.args.get('name')
        class_level_id = request.args.get('classLevelId')
        teacher_id = request.args.get('teacherId')
        institution_id = request.args.get('institutionId')

        # Construir la consulta base
        query = Subject.query

        # Aplicar filtros condicionalmente
        if name:
            query = query.filter(Subject.name.ilike(f'%{name}%'))  # Filtro por nombre, insensible a mayúsculas

        if class_level_id:
            try:
                class_level_id = int(class_level_id)  # Asegurarse de que el ID sea un entero
                query = query.filter_by(classLevelId=class_level_id)
            except ValueError:
                return jsonify({"error": "ID de nivel de clase inválido"}), 400

        if teacher_id:
            try:
                teacher_id = int(teacher_id)  # Asegurarse de que el ID sea un entero
                query = query.filter_by(teacherId=teacher_id)
            except ValueError:
                return jsonify({"error": "ID de profesor inválido"}), 400

        if institution_id:
            try:
                institution_id = int(institution_id)  # Asegurarse de que el ID sea un entero
                query = query.filter_by(institutionId=institution_id)
            except ValueError:
                return jsonify({"error": "ID de institución inválido"}), 400

        # Ejecutar la consulta
        subjects = query.all()

        # Serializar la lista de subjects
        subjects_list = [subject.serialize() for subject in subjects]

        return jsonify(subjects_list), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# LevelSubject Routes

# Get subject with LevelSubject list
@api.route('/subjects_with_levels', methods=['GET'])
def get_subjects_with_levels():
    try:
        # Obtener parámetros de consulta
        name = request.args.get('name')
        class_level_id = request.args.get('classLevelId')
        institution_id = request.args.get('institutionId')

        # Construir la consulta base para los subjects
        subject_query = Subject.query

        # Aplicar filtros condicionalmente
        if name:
            subject_query = subject_query.filter(Subject.name.ilike(f'%{name}%'))

        if institution_id:
            try:
                institution_id = int(institution_id)
                subject_query = subject_query.filter_by(institutionId=institution_id)
            except ValueError:
                return jsonify({"error": "ID de institución inválido"}), 400

        # Ejecutar la consulta de subjects
        subjects = subject_query.all()

        # Construir la consulta para los LevelSubjects
        level_subject_query = LevelSubject.query

        # Aplicar filtros de ClassLevel si están presentes
        if class_level_id:
            try:
                class_level_id = int(class_level_id)
                level_subject_query = level_subject_query.filter_by(classLevelId=class_level_id)
            except ValueError:
                return jsonify({"error": "ID de nivel de clase inválido"}), 400

        # Filtrar por subjectId si se encontraron subjects en la primera consulta
        if subjects:
            subject_ids = [subject.id for subject in subjects]
            level_subject_query = level_subject_query.filter(LevelSubject.subjectId.in_(subject_ids))

        # Ejecutar la consulta de LevelSubjects
        level_subjects = level_subject_query.all()

        # Crear un diccionario para agrupar los niveles por subjectId
        levels_by_subject = {}
        for level_subject in level_subjects:
            subject_id = level_subject.subjectId
            level_info = {
                "id": level_subject.id,
                "classLevelId": level_subject.classLevelId,
                "classLevel": {
                    "level": level_subject.classLevel.level,
                    "section": level_subject.classLevel.section
                }
            }
            if subject_id not in levels_by_subject:
                levels_by_subject[subject_id] = []
            levels_by_subject[subject_id].append(level_info)

        # Transformar los datos para incluir los niveles en cada subject
        subjects_with_levels = []
        for subject in subjects:
            subjects_with_levels.append({
                "id": subject.id,
                "name": subject.name,
                "institutionId": subject.institutionId,
                "createdAt": subject.createdAt,
                "updatedAt": subject.updatedAt,
                "levelSubjects": levels_by_subject.get(subject.id, [])  # Obtener los niveles asociados o una lista vacía
            })

        # Devolver la respuesta combinada
        return jsonify(subjects_with_levels), 200

    except SQLAlchemyError as e:
        app.logger.error(f"Error de SQLAlchemy: {str(e)}")
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        app.logger.error(f"Error desconocido: {str(e)}")
        return jsonify({"error": f"Error desconocido: {str(e)}"}), 500

# Create LevelSubject relationship and subjectAssignment of each LevelSubject
@api.route('/levelSubject', methods=['POST'])
@jwt_required()
def create_level_subject():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar que el usuario tenga permisos para crear un LevelSubject
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para crear un LevelSubject"}), 403

        # Obtener datos del request
        data = request.get_json()
        class_level_ids = data.get('classLevelIds')  # Lista de IDs
        subject_id = data.get('subjectId')
        institution_id = None

        # Validar que los campos requeridos estén presentes
        if not class_level_ids or not subject_id:
            return jsonify({"error": "Faltan campos obligatorios"}), 400

        if not isinstance(class_level_ids, list):
            return jsonify({"error": "classLevelIds debe ser una lista"}), 400

        # Determinar el institutionId según el rol del usuario
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            institution_id = current_user.institutionId
        elif current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            institution_id = data.get('institutionId')
            if not institution_id:
                return jsonify({"error": "Institution ID es requerido para el rol DEV o SERVICE"}), 400

            # Validar que el institutionId exista en la base de datos
            institution = EducationalInstitution.query.get(institution_id)
            if not institution:
                return jsonify({"error": "Institution ID no válido"}), 404
        else:
            return jsonify({"error": "Rol no permitido"}), 403

        # Crear relaciones de LevelSubject para cada classLevelId
        new_level_subjects = []
        for class_level_id in class_level_ids:
            # Verificar si ya existe un LevelSubject con el mismo classLevelId y subjectId
            existing_level_subject = LevelSubject.query.filter_by(
                classLevelId=class_level_id,
                subjectId=subject_id
            ).first()

            if existing_level_subject:
                continue  # Si ya existe, saltar a la siguiente relación

            # Crear una nueva instancia de LevelSubject
            new_level_subject = LevelSubject(
                classLevelId=class_level_id,
                subjectId=subject_id
            )

            # Agregar el nuevo LevelSubject a la lista
            new_level_subjects.append(new_level_subject)

        # Validar que al menos se haya creado un LevelSubject
        if not new_level_subjects:
            return jsonify({"error": "Ya existen todas las relaciones LevelSubject especificadas"}), 400

        # Guardar los nuevos LevelSubjects en la base de datos para que obtengan sus IDs
        db.session.add_all(new_level_subjects)
        db.session.commit()  # Confirmar la creación de LevelSubject para obtener sus IDs

        # Crear los SubjectAssignments asociados para cada LevelSubject creado
        new_subject_assignments = []
        for new_level_subject in new_level_subjects:
            # Crear el SubjectAssignment asociado con los valores predeterminados
            new_subject_assignment = SubjectAssignment(
                levelSubjectId=new_level_subject.id,  # Usar el ID generado tras el commit
                teacherId=None,  # Inicialmente sin profesor asignado
                startDate=None,
                endDate=None,
                institutionId=institution_id,
                syllabusId=None
            )
            # Agregar el nuevo SubjectAssignment a la lista
            new_subject_assignments.append(new_subject_assignment)

        # Agregar los nuevos SubjectAssignments a la base de datos
        db.session.add_all(new_subject_assignments)
        db.session.commit()

        # Serializar las nuevas relaciones creadas
        created_level_subjects = [level_subject.serialize() for level_subject in new_level_subjects]
        created_subject_assignments = [subject_assignment.serialize() for subject_assignment in new_subject_assignments]

        return jsonify({
            "createdLevelSubjects": created_level_subjects,
            "createdSubjectAssignments": created_subject_assignments
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



    
# subject teacher Assignment Routes
# Create Teacher Assignment (Not being used)
@api.route('/subjectAssignment', methods=['POST'])
@jwt_required()
def create_subject_assignment():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener datos del request
        data = request.get_json()
        comment = data.get('comment')
        level_subject_id = data.get('levelSubjectId')
        teacher_id = data.get('teacherId')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        syllabus_id = data.get('syllabusId')
        password = data.get('password')

        # Validar que todos los campos requeridos estén presentes
        if not level_subject_id or not password:
            return jsonify({"error": "Campos obligatorios faltantes"}), 400

        # Verificar la contraseña del usuario
        if current_user.temporaryPassword:
            if password != current_user.password:
                return jsonify({"message": "Contraseña incorrecta"}), 401
        else:
            if not bcrypt.check_password_hash(current_user.password, password):
                return jsonify({"message": "Contraseña incorrecta"}), 401

        # Validar el rol del usuario
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para crear un SubjectAssignment"}), 403

        # Determinar el institutionId según el rol del usuario
        institution_id = None
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            institution_id = current_user.institutionId
        elif current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            institution_id = data.get('institutionId')
            if not institution_id:
                return jsonify({"error": "Institution ID es requerido para el rol DEV o SERVICE"}), 400

            # Validar que el institutionId exista en la base de datos
            institution = EducationalInstitution.query.get(institution_id)
            if not institution:
                return jsonify({"error": "Institution ID no válido"}), 404

        # Verificar si ya existe una relación entre el levelSubject y el teacher
        existing_assignment = SubjectAssignment.query.filter_by(
            levelSubjectId=level_subject_id,
            teacherId=teacher_id,
            is_deleted=False  # Ignorar las relaciones marcadas como eliminadas
        ).first()

        if existing_assignment:
            return jsonify({"error": "Ya existe una relación entre el nivel de materia y el profesor"}), 400

        # Crear una nueva instancia de SubjectAssignment
        new_subject_assignment = SubjectAssignment(
            comment=comment,
            levelSubjectId=level_subject_id,
            teacherId=teacher_id,
            startDate=start_date,
            endDate=end_date,
            institutionId=institution_id,
            syllabusId=syllabus_id
        )

        # Guardar el nuevo SubjectAssignment en la base de datos
        db.session.add(new_subject_assignment)
        db.session.commit()

        # Devolver la nueva asignación creada
        return jsonify(new_subject_assignment.serialize()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Get all SubjectAssignment 
@api.route('/subjectAssignments', methods=['GET'])
def get_subject_assignments():
    try:
        # Obtener todas las subjectAssignments (incluyendo las eliminadas)
        subject_assignments = SubjectAssignment.query.all()

        # Crear una lista de serializaciones con las relaciones necesarias
        result = []
        for assignment in subject_assignments:
            level_subject = assignment.levelSubject
            class_level = level_subject.classLevel
            subject = level_subject.subject

            # Agregar el SubjectAssignment con los datos anidados
            result.append({
                'subjectAssignment': assignment.serialize(),  # Datos del SubjectAssignment
                'levelSubject': {
                    'id': level_subject.id,
                    'classLevel': {
                        'level': class_level.level,
                        'section': class_level.section
                    },
                    'subject': {
                        'name': subject.name
                    }
                }
            })

        return jsonify(result), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get subjectAssignment details
@api.route('/subjectAssignment', methods=['GET'])
@jwt_required()
def get_subject_assignment():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Filtrar subjectAssignments basado en el rol del usuario
        if current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            # Si el rol es DEV o SERVICE, ver todas las asignaciones (incluidas las eliminadas)
            subject_assignments = SubjectAssignment.query.all()
        elif current_user.role == UserRoleEnum.INSTITUTION:
            # Si el rol es INSTITUTION, ver todas las asignaciones activas
            subject_assignments = SubjectAssignment.query.filter_by(is_deleted=False).all()
        else:
            # Para otros roles, filtrar por la institución del usuario y solo las activas
            subject_assignments = SubjectAssignment.query.filter_by(is_deleted=False, institutionId=current_user.institutionId).all()

        # Crear una lista de serializaciones con las relaciones necesarias
        result = []
        for assignment in subject_assignments:
            level_subject = assignment.levelSubject
            class_level = level_subject.classLevel
            subject = level_subject.subject

            # Acceder al profesor asociado a la asignación directamente con la relación teacher
            teacher = assignment.teacher

            # Agregar el SubjectAssignment con los datos anidados, incluyendo el profesor
            result.append({
                'subjectAssignment': assignment.serialize(),  # Datos del SubjectAssignment
                'levelSubject': {
                    'id': level_subject.id,
                    'classLevel': {
                        'level': class_level.level,
                        'section': class_level.section
                    },
                    'subject': {
                        'name': subject.name
                    }
                },
                # Verificar si hay un profesor asignado
                'teacher': {
                    'fullName': f"{teacher.firstName} {teacher.firstLastname} {teacher.secondLastname}" if teacher else None,
                    'userPosition': teacher.userPosition if teacher else None  # Posición del profesor
                } if teacher else None  # Si no hay profesor, devolver None
            })

        return jsonify(result), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Edit SubjectAssignmente
@api.route('/subjectAssignment/<int:id>', methods=['PUT'])
@jwt_required()
def update_subject_assignment(id):
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener los datos del request
        data = request.get_json()
        print(data)
        comment = data.get('comment')
        teacher_id = data.get('teacherId')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        syllabus_id = data.get('syllabusId')
        password = data.get('password')

        # Validar que se haya enviado la contraseña
        if not password:
            return jsonify({"error": "La contraseña es obligatoria"}), 400

        # Verificar la contraseña del usuario
        if current_user.temporaryPassword:
            if password != current_user.password:
                return jsonify({"message": "Contraseña incorrecta"}), 401
        else:
            if not bcrypt.check_password_hash(current_user.password, password):
                return jsonify({"message": "Contraseña incorrecta"}), 401

        # Obtener la asignación existente
        subject_assignment = SubjectAssignment.query.get(id)
        if not subject_assignment:
            return jsonify({"error": "SubjectAssignment no encontrado"}), 404

        # Permisos para roles
        if current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            # DEV y SERVICE pueden editar todo
            pass
        elif current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            # INSTITUTION y EDUADMIN solo pueden editar su propia institución
            if subject_assignment.institutionId != current_user.institutionId:
                return jsonify({"error": "No tienes permiso para editar esta asignación"}), 403
        elif current_user.role == UserRoleEnum.TEACHER:
            # TEACHER solo puede editar su propio subjectAssignment y solo syllabusId
            if subject_assignment.teacherId != current_user.id:
                return jsonify({"error": "No tienes permiso para editar esta asignación"}), 403
            # El profesor solo puede actualizar el campo syllabusId
            if syllabus_id:
                subject_assignment.syllabusId = syllabus_id
            db.session.commit()
            return jsonify(subject_assignment.serialize()), 200
        else:
            return jsonify({"error": "No tienes permiso para editar esta asignación"}), 403

        # Para DEV, SERVICE, INSTITUTION, EDUADMIN - Editar todos los campos permitidos
        if comment is not None:
            subject_assignment.comment = comment
        if teacher_id is not None:
            subject_assignment.teacherId = teacher_id
        if start_date is not None:
            subject_assignment.startDate = start_date
        if end_date is not None:
            subject_assignment.endDate = end_date

        # Guardar los cambios
        db.session.commit()

        return jsonify(subject_assignment.serialize()), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@api.route('/subjectAssignment/bulkUpdate', methods=['PUT'])
@jwt_required()
def bulk_update_subject_assignments():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener los datos del request
        data = request.get_json()
        ids = data.get('ids')  # Arreglo de IDs
        comment = data.get('comment')
        teacher_id = data.get('teacherId')
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        syllabus_id = data.get('syllabusId')
        password = data.get('password')

        # Validar que se haya enviado la contraseña
        if not password:
            return jsonify({"error": "La contraseña es obligatoria"}), 400

        # Verificar la contraseña del usuario
        if current_user.temporaryPassword:
            if password != current_user.password:
                return jsonify({"message": "Contraseña incorrecta"}), 401
        else:
            if not bcrypt.check_password_hash(current_user.password, password):
                return jsonify({"message": "Contraseña incorrecta"}), 401

        # Validar que se haya proporcionado al menos un ID
        if not ids or not isinstance(ids, list):
            return jsonify({"error": "Se requiere un arreglo de IDs válidos"}), 400

        updated_assignments = []

        for id in ids:
            # Obtener la asignación existente
            subject_assignment = SubjectAssignment.query.get(id)
            if not subject_assignment:
                return jsonify({"error": f"SubjectAssignment con ID {id} no encontrado"}), 404

            # Permisos para roles
            if current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
                pass
            elif current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
                if subject_assignment.institutionId != current_user.institutionId:
                    return jsonify({"error": f"No tienes permiso para editar la asignación con ID {id}"}), 403
            elif current_user.role == UserRoleEnum.TEACHER:
                if subject_assignment.teacherId != current_user.id:
                    return jsonify({"error": f"No tienes permiso para editar la asignación con ID {id}"}), 403
                if syllabus_id:
                    subject_assignment.syllabusId = syllabus_id
                db.session.commit()
                updated_assignments.append(subject_assignment.serialize())
                continue
            else:
                return jsonify({"error": "No tienes permiso para editar esta asignación"}), 403

            # Editar campos para DEV, SERVICE, INSTITUTION, EDUADMIN
            if comment is not None:
                subject_assignment.comment = comment
            if teacher_id is not None:
                subject_assignment.teacherId = teacher_id
            else:
                # Si teacher_id es None, se elimina el teacherId de la asignación
                subject_assignment.teacherId = None
            if start_date is not None:
                subject_assignment.startDate = start_date
            if end_date is not None:
                subject_assignment.endDate = end_date

            # Guardar los cambios para esta asignación
            db.session.commit()
            updated_assignments.append(subject_assignment.serialize())

        return jsonify(updated_assignments), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500




# User Routes
# Create User
@api.route('/user', methods=['POST'])
@jwt_required()
def create_user():
    logging.info("Datos recibidos en la solicitud: %s", request.json)  # Registrar los datos recibidos
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener los datos del cuerpo de la solicitud
        firstName = request.json.get("firstName")
        firstLastname = request.json.get("firstLastname")
        secondLastname = request.json.get("secondLastname")
        email = request.json.get("email")
        address = request.json.get("address")
        principalPhone = request.json.get("principalPhone")
        secondPhone = request.json.get("secondPhone")
        profilePicture = request.json.get("profilePicture")
        details = request.json.get("details")
        country = request.json.get("country")
        dni = request.json.get("dni")
        role = request.json.get("role")

        # Verificar que los datos requeridos no estén vacíos
        if not all([firstName, firstLastname, email, address, principalPhone, country, dni, role]):
            logging.error("Faltan datos obligatorios en la solicitud")
            return jsonify({"error": "Faltan datos obligatorios"}), 400

        # Validar y convertir el rol a un enum
        try:
            role_enum = UserRoleEnum[role]
        except KeyError:
            logging.error("Rol inválido: %s", role)
            return jsonify({"error": "Rol inválido"}), 400

        # Verificar y asignar el institutionId según el rol del usuario que crea el nuevo usuario
        institutionId = None
        institution_name = None

        if current_user.role == UserRoleEnum.INSTITUTION:
            # Si el rol del usuario creador es INSTITUTION, solo pueden crear ciertos roles
            if role_enum not in {UserRoleEnum.EDUADMIN, UserRoleEnum.STUDENT, UserRoleEnum.TEACHER, UserRoleEnum.PARENT}:
                logging.error("El usuario no tiene permiso para crear este rol: %s", role_enum)
                return jsonify({"error": "No tienes permiso para crear este rol"}), 403
            institutionId = current_user.institutionId
            institution_name = EducationalInstitution.query.get(institutionId).institutionName

        elif current_user.role == UserRoleEnum.DEV:
            # Si el rol es DEV, pueden crear varios roles, pero solo ciertos roles no requieren institutionId
            if role_enum in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
                institutionId = None  # No se requiere institutionId para estos roles
                institution_name = None
            else:
                # Para otros roles, institutionId es requerido
                institutionId = request.json.get("institutionId")
                if not institutionId:
                    logging.error("Institution ID es requerido para el rol: %s", role_enum)
                    return jsonify({"error": "Institution ID es requerido para este rol"}), 400

                # Validar que el institutionId exista en la base de datos
                institution = EducationalInstitution.query.get(institutionId)
                if not institution:
                    logging.error("Institution ID no válido: %s", institutionId)
                    return jsonify({"error": "Institution ID no válido"}), 404
                institution_name = institution.institutionName

        else:
            logging.error("El usuario no tiene permiso para crear usuarios")
            return jsonify({"error": "No tienes permiso para crear usuarios"}), 403

        # Generar una contraseña temporal
        temporaryPassword = generate_temporaryPassword()

        # Generar un username usando el firstName, firstLastname, y el nombre de la institución
        username = generate_username(firstName, firstLastname, institution_name)

        # Crear una nueva instancia de User
        new_user = User(
            institutionId=institutionId,
            firstName=firstName,
            firstLastname=firstLastname,
            secondLastname=secondLastname,
            email=email,
            password=temporaryPassword,
            address=address,
            principalPhone=principalPhone,
            secondPhone=secondPhone,
            profilePicture=profilePicture,
            details=details,
            country=country,
            dni=dni,
            role=role_enum,
            status=UserStatusEnum.ACTIVE,  # Por defecto el status es ACTIVE
            username=username,
            temporaryPassword=True
        )

        # Agregar el nuevo usuario a la base de datos
        db.session.add(new_user)
        db.session.commit()

        logging.info("Usuario creado exitosamente: %s", new_user.username)
        logging.basicConfig(filename='/workspaces/Apollo/src/api/logging.log', filemode='w', encoding='utf-8', level=logging.DEBUG)

        return jsonify(new_user.serialize()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error("Error en la base de datos: %s", str(e))
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        tb = traceback.format_exc()
        logging.error("Error inesperado: %s", tb)
        return jsonify({"error": "Error inesperado", "traceback": tb}), 500

# Update single  
@api.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener el usuario a modificar
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Verificar que los roles STUDENT, TEACHER y PARENT solo puedan modificar su propio perfil
        if current_user.role in {UserRoleEnum.STUDENT, UserRoleEnum.TEACHER, UserRoleEnum.PARENT}:
            if current_user_id != user_id:
                return jsonify({"error": "No tienes permiso para modificar los datos de otros usuarios"}), 403

        # Verificar que los roles permitidos (INSTITUTION y EDUADMIN) solo puedan modificar usuarios dentro de su institución
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            if user.institutionId != current_user.institutionId:
                return jsonify({"error": "No tienes permiso para modificar usuarios fuera de tu institución"}), 403

        # Los roles DEV y SERVICE pueden modificar cualquier usuario, no requieren validación adicional
        data = request.json
        print(data)

        # Verificar si se está actualizando el estado
        new_status = data.get("status")
        if new_status:
            try:
                new_status_enum = UserStatusEnum[new_status.upper()]
            except KeyError:
                return jsonify({"error": "Estado inválido"}), 400

            # Solo DEV y SERVICE pueden cambiar el estado de los usuarios con rol INSTITUTION
            if current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE} or (user.role != UserRoleEnum.INSTITUTION):
                # Validar que solo estudiantes pueden ser marcados como 'GRADUATED'
                if new_status_enum == UserStatusEnum.GRADUATED and user.role != UserRoleEnum.STUDENT:
                    return jsonify({"error": "Solo los estudiantes pueden ser marcados como graduados"}), 403

                user.status = new_status_enum
            else:
                return jsonify({"error": "No tienes permiso para cambiar el estado del usuario"}), 403

        # Los estudiantes, profesores y padres no pueden modificar sus nombres
        if current_user.role in {UserRoleEnum.STUDENT, UserRoleEnum.TEACHER, UserRoleEnum.PARENT}:
            if "firstName" in data or "firstLastname" in data or "secondLastname" in data:
                return jsonify({"error": "No tienes permiso para modificar tu nombre"}), 403

        # Actualizar campos permitidos
        user.firstName = data.get("firstName", user.firstName)
        user.firstLastname = data.get("firstLastname", user.firstLastname)
        user.secondLastname = data.get("secondLastname", user.secondLastname)
        user.email = data.get("email", user.email)
        user.address = data.get("address", user.address)
        user.principalPhone = data.get("principalPhone", user.principalPhone)
        user.secondPhone = data.get("secondPhone", user.secondPhone)
        user.profilePicture = data.get("profilePicture", user.profilePicture)
        user.details = data.get("details", user.details)
        user.country = data.get("country", user.country)
        user.dni = data.get("dni", user.dni)

        # Si el nombre ha cambiado, regenerar el username
        if any([data.get("firstName"), data.get("firstLastname"), data.get("secondLastname")]):
            institution_name = EducationalInstitution.query.get(user.institutionId).institutionName if user.institutionId else None
            user.username = generate_username(user.firstName, user.firstLastname, institution_name)

        # Guardar los cambios en la base de datos
        db.session.commit()

        logging.info(f"Usuario actualizado exitosamente: {user.username}")

        return jsonify(user.serialize()), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Error en la base de datos: {str(e)}")
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        tb = traceback.format_exc()
        logging.error(f"Error inesperado: {tb}")
        return jsonify({"error": "Error inesperado", "traceback": tb}), 500


# Update status user list
@api.route('/users/batch_update', methods=['PUT'])
@jwt_required()
def batch_update_users():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener los datos de la solicitud
        data = request.json
        user_ids = data.get("user_ids", [])
        new_status = data.get("status")

        if not user_ids or not new_status:
            return jsonify({"error": "Se requiere una lista de IDs de usuarios y un estado"}), 400

        try:
            new_status_enum = UserStatusEnum[new_status.upper()]
        except KeyError:
            return jsonify({"error": "Estado inválido"}), 400

        # Verificar permisos para cambiar el estado
        if current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            # Permitir que DEV y SERVICE actualicen el estado de cualquier usuario
            for user_id in user_ids:
                user = User.query.get(user_id)
                if not user:
                    return jsonify({"error": f"Usuario con ID {user_id} no encontrado"}), 404

                # Validar que solo estudiantes pueden ser marcados como 'GRADUATED'
                if new_status_enum == UserStatusEnum.GRADUATED and user.role != UserRoleEnum.STUDENT:
                    return jsonify({"error": f"Solo los estudiantes pueden ser marcados como graduados: {user.username}"}), 403

                # Cambiar el estado del usuario
                user.status = new_status_enum

            # Guardar los cambios en la base de datos
            db.session.commit()

            logging.info(f"Estados de usuarios actualizados exitosamente: {[User.query.get(user_id).username for user_id in user_ids]} por: {current_user_id}")

            return jsonify({"message": f"Estados de usuarios actualizados exitosamente por: {current_user_id}"}), 200
        
        elif current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            # Los roles INSTITUTION y EDUADMIN solo pueden cambiar el estado de los usuarios de su propia institución
            for user_id in user_ids:
                user = User.query.get(user_id)
                if not user:
                    return jsonify({"error": f"Usuario con ID {user_id} no encontrado"}), 404

                # Validar que solo estudiantes pueden ser marcados como 'GRADUATED'
                if new_status_enum == UserStatusEnum.GRADUATED and user.role != UserRoleEnum.STUDENT:
                    return jsonify({"error": f"Solo los estudiantes pueden ser marcados como graduados: {user.username}"}), 403

                # Verificar que el usuario está dentro de la misma institución
                if user.institutionId != current_user.institutionId:
                    return jsonify({"error": f"No tienes permiso para modificar el estado del usuario fuera de tu institución"}), 403

                # Solo los roles DEV y SERVICE pueden cambiar el estado del rol INSTITUTION
                if user.role == UserRoleEnum.INSTITUTION and current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
                    return jsonify({"error": "No tienes permiso para cambiar el estado del usuario con rol INSTITUTION"}), 403

                # Cambiar el estado del usuario
                user.status = new_status_enum

            # Guardar los cambios en la base de datos
            db.session.commit()

            logging.info(f"Estados de usuarios actualizados exitosamente por: {current_user_id}")

            return jsonify({"message": f"Estados de usuarios actualizados exitosamente."}), 200
        
        else:
            return jsonify({"error": "No tienes permiso para cambiar el estado de los usuarios"}), 403

    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Error en la base de datos: {str(e)}")
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        tb = traceback.format_exc()
        logging.error(f"Error inesperado: {tb}")
        return jsonify({"error": "Error inesperado", "traceback": tb}), 500



      
# Get basic info of all users
@api.route('/users', methods=['GET'])
@jwt_required()
def get_users_basic():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar el rol del usuario
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para ver esta información"}), 403

        # Definir la consulta base
        query = User.query

        # Filtrar por institutionId si es necesario
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            query = query.filter(User.institutionId == current_user.institutionId)

        # Solo obtener los campos básicos necesarios para la tabla
        users = query.with_entities(
            User.id, 
            User.firstName, 
            User.firstLastname, 
            User.secondLastname,  
            User.username,
            User.role, 
            User.status
        ).all()

        # Serializar los usuarios
        users_data = []
        for u in users:
            user_info = {
                "id": u.id, 
                "firstName": u.firstName, 
                "firstLastname": u.firstLastname, 
                "secondLastname": u.secondLastname, 
                "username": u.username,
                "role": u.role.name,  # Convertir el Enum del rol a string
                "status": u.status.name  # Convertir el Enum del status a string
            }

            # Si el usuario es un estudiante, obtener sus niveles de clase aceptados
            if u.role == UserRoleEnum.STUDENT:
                related_class_levels = RelatedClassLevel.query.filter_by(userId=u.id, status=RelatedClassLevelStatusEnum.ACCEPTED).all()
                class_levels_data = []
                
                for related_class_level in related_class_levels:
                    class_level = ClassLevel.query.get(related_class_level.classLevelId)
                    if class_level:
                        class_level_data = {
                            "level": class_level.level,   # Suponiendo que `level` es un atributo del modelo ClassLevel
                            "section": class_level.section  # Suponiendo que `section` es un atributo del modelo ClassLevel
                        }
                        class_levels_data.append(class_level_data)

                # Añadir los niveles de clase al objeto del usuario
                user_info['classLevels'] = class_levels_data

            users_data.append(user_info)

        return jsonify(users_data), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
# Get User Details
@api.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_details(user_id):
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Verificar el rol del usuario
        if current_user.role not in {UserRoleEnum.DEV, UserRoleEnum.SERVICE, UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            return jsonify({"error": "No tienes permiso para ver esta información"}), 403

        # Obtener el usuario específico por ID
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Verificar si el usuario pertenece a la misma institución (si aplica)
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN} and user.institutionId != current_user.institutionId:
            return jsonify({"error": "No tienes permiso para ver este usuario"}), 403

        # Serializar la información del usuario
        user_data = user.serialize()

        # Obtener las clases y materias si es estudiante
        if user.role == UserRoleEnum.STUDENT:
            # Filtrar los niveles de clase activos
            related_class_levels = RelatedClassLevel.query.filter_by(userId=user.id, status=RelatedClassLevelStatusEnum.ACCEPTED).all()
            class_levels_data = []
            for related_class_level in related_class_levels:
                class_level = ClassLevel.query.get(related_class_level.classLevelId)
                if class_level:
                    class_level_data = class_level.serialize()

                    # Obtener las materias del ClassLevel
                    level_subjects = LevelSubject.query.filter_by(classLevelId=class_level.id).all()
                    subjects_data = [level_subject.subject.serialize() for level_subject in level_subjects]

                    # Añadir las materias al nivel de clase
                    class_level_data['subjects'] = subjects_data
                    class_levels_data.append(class_level_data)

            # Añadir los niveles de clase y materias al usuario
            user_data['classLevels'] = class_levels_data

            # Obtener los padres del estudiante
            student_parents = StudentParent.query.filter_by(studentId=user.id).all()
            parents_data = [parent.parent.serialize() for parent in student_parents]
            user_data['parents'] = parents_data

        return jsonify(user_data), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Get teachers
@api.route('/users/teachers', methods=['GET'])
@jwt_required()
def get_teachers():
    try:
        # Obtener el usuario autenticado
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Obtener el parámetro institutionId de la consulta
        institution_id = request.args.get('institutionId', type=int)
        status_filter = request.args.get('status', type=str)

        # Verificar el rol del usuario
        if current_user.role in {UserRoleEnum.INSTITUTION, UserRoleEnum.EDUADMIN}:
            # Solo puede ver profesores de su propia institución
            institution_id = current_user.institutionId
        elif current_user.role in {UserRoleEnum.DEV, UserRoleEnum.SERVICE}:
            # Para DEV y SERVICE, asegúrate de que se pase el institutionId
            if institution_id is None:
                return jsonify({"error": "Se requiere institutionId para este rol"}), 400
        else:
            return jsonify({"error": "No tienes permiso para ver esta información"}), 403

        # Consultar solo los usuarios con el rol de profesor
        query = User.query.filter(User.role == UserRoleEnum.TEACHER)

        # Filtrar por institutionId
        query = query.filter(User.institutionId == institution_id)

        # Filtrar por status si se proporciona
        if status_filter:
            if status_filter.upper() == 'ACTIVE':
                query = query.filter(User.status == UserStatusEnum.ACTIVE)
            elif status_filter.upper() == 'INACTIVE':
                query = query.filter(User.status == UserStatusEnum.INACTIVE)
            elif status_filter.upper() == 'DEPRECIATED':
                query = query.filter(User.status == UserStatusEnum.DEPRECIATED)

        teachers = query.with_entities(
            User.id,  # Añadir el ID aquí
            User.firstName,
            User.firstLastname,
            User.secondLastname,
            User.profilePicture,
            User.userPosition,
            User.username
        ).all()

        # Serializar los datos de los profesores, incluyendo el ID
        teachers_data = [
            {
                "id": teacher.id,  # Incluir el ID en la respuesta
                "fullName": f"{teacher.firstName} {teacher.firstLastname} {teacher.secondLastname}".strip(),
                "profilePicture": teacher.profilePicture,
                "userPosition": teacher.userPosition,
                "username": teacher.username
            }
            for teacher in teachers
        ]


        return jsonify(teachers_data), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500 





#TODO: RUTA DE PARENT

@api.route('/user/change_password', methods=['POST'])
def change_password():
    try:
        user_id = request.json.get("user_id")
        old_password = request.json.get("old_password")
        new_password = request.json.get("new_password")

        user = User.query.get(user_id)

        if not user or not bcrypt.check_password_hash(user.password, old_password):
            return jsonify({"error": "Invalid credentials"}), 400

        if not user.temporaryPassword:
            return jsonify({"error": "The password is not temporary"}), 400

        # Update to the new password
        user.password = bcrypt.generate_password_hash(new_password, 10).decode("utf-8")
        user.temporaryPassword = False
        db.session.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@api.route('/user', methods=['GET'])
def get_users():
    try:
        # Obtener parámetros de consulta
        first_name = request.args.get('firstName')
        last_name = request.args.get('lastName')
        email = request.args.get('email')
        role = request.args.get('role')
        status = request.args.get('status')
        institution_id = request.args.get('institutionId')

        # Construir la consulta base
        query = User.query

        # Aplicar filtros condicionalmente
        if first_name:
            query = query.filter(User.firstName.ilike(f'%{first_name}%'))
        if last_name:
            query = query.filter(
                (User.firstLastname.ilike(f'%{last_name}%')) |
                (User.secondLastname.ilike(f'%{last_name}%'))
            )
        if email:
            query = query.filter(User.email.ilike(f'%{email}%'))
        if role:
            try:
                role_enum = UserRoleEnum[role]
                query = query.filter_by(role=role_enum)
            except KeyError:
                return jsonify({"error": "Rol inválido"}), 400
        if status:
            try:
                status_enum = UserStatusEnum[status]
                query = query.filter_by(status=status_enum)
            except KeyError:
                return jsonify({"error": "Estado inválido"}), 400
        if institution_id:
            query = query.filter_by(institutionId=institution_id)

        # Ejecutar la consulta
        users = query.all()

        # Serializar la lista de usuarios
        users_list = [user.serialize() for user in users]

        return jsonify(users_list), 200

    except SQLAlchemyError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/login', methods=['POST'])
def login():
    # Obtener el User-Agent del usuario
    user_agent = request.headers.get('User-Agent')
    
    email_or_username = request.json.get("email_or_username")
    password = request.json.get("password")
    fingerprint = request.json.get("fingerprint")  # Obtener el fingerprint del dispositivo desde la solicitud

    user = User.query.filter(
        (User.email == email_or_username) | 
        (User.username == email_or_username)
    ).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Verificar si el estado del usuario es ACTIVE
    if user.status != UserStatusEnum.ACTIVE:
        return jsonify({"message": "User account is not active"}), 403

    # Verificar la contraseña
    if user.temporaryPassword:
        if password != user.password:
            return jsonify({"message": "Wrong password"}), 401
    else:
        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"message": "Wrong password"}), 401

    # Inicializar claims adicionales para el token, incluyendo el fingerprint y user agent
    additional_claims = {
        "role": user.role.value,
        "email": user.email,
        "username": user.username,
        "user_agent": user_agent,   # Agregar el User-Agent como un claim adicional
        "fingerprint": fingerprint  # Agregar el fingerprint como un claim adicional
    }

    # Si no es un usuario DEV, agregar institutionId
    if user.role.value != 'dev':
        additional_claims["institutionId"] = user.institutionId

    # Generar el token con los claims adicionales
    token = create_access_token(
        identity=user.id,
        additional_claims=additional_claims
    )

    user_data = user.serialize()

    return jsonify({
        "message": "Login successful", 
        "token": token,
        "additional_claims": additional_claims,  # Incluye aquí los claims adicionales
        "user": user_data
    }), 200

@api.route('/logout', methods=['POST'])
@jwt_required()  # Requiere que el usuario esté autenticado con JWT
def logout():
    try:
        # Obtener el token desde el JWT actual
        jti = get_jwt()["jti"]  # "jti" es el identificador del token en JWT
        now = datetime.now(timezone.utc)
        
        # Crear una nueva entrada en la lista de tokens bloqueados
        blocked_token = TokenBlockedList(token=jti, created_at=now)
        
        # Guardar en la base de datos
        db.session.add(blocked_token)
        db.session.commit()

        return jsonify({"message": "Token agregado a la lista de bloqueados"}), 200

    except Exception as e:
        return jsonify({"error": "No se pudo agregar el token a la lista"}), 500
    
@api.route('/blocked-tokens', methods=['GET'])
def get_blocked_tokens():
    try:
        # Consultar todos los tokens bloqueados en la base de datos
        blocked_tokens = TokenBlockedList.query.all()

        # Serializar los resultados en una lista de diccionarios
        tokens = [{"id": token.id, "token": token.token, "created_at": token.created_at} for token in blocked_tokens]

        return jsonify(tokens), 200

    except Exception as e:
        return jsonify({"error": "No se pudo obtener la lista de tokens bloqueados"}), 500


@api.route('/verify-token', methods=['POST'])
@jwt_required()
def verify_token():
    # Obtener el identity del usuario (en este caso, es el user.id)
    current_user_id = get_jwt_identity()

    # Obtener los claims adicionales que están en el token
    claims = get_jwt()

    # Obtener el fingerprint que se envía desde el cliente en la solicitud
    fingerprint_from_request = request.json.get("fingerprint")
    print(fingerprint_from_request)
    # Obtener el fingerprint que está almacenado en el token
    fingerprint_in_token = claims.get('fingerprint')
    print(fingerprint_in_token)

    # Comparar fingerprints
    if fingerprint_from_request != fingerprint_in_token:
        return jsonify({
            "message": "Fingerprint mismatch, please log in again."
        }), 401  # El token ya no es válido porque el fingerprint cambió

    return jsonify({
        "message": "Token is valid",
        "user_id": current_user_id,
        "claims": claims
    }), 200


# Create a new unit
@api.route('/units', methods=['POST'])
def create_unit():
    data = request.json
    new_unit = Unit(
        moduleId=data.get('moduleId'),
        name=data.get('name'),
        description=data.get('description')
    )
    db.session.add(new_unit)
    db.session.commit()
    return jsonify(new_unit.serialize()), 201

# Get all units
@api.route('/units', methods=['GET'])
def get_units():
    units = Unit.query.all()
    return jsonify([unit.serialize() for unit in units])

# Get a specific unit by ID
@api.route('/units/<int:idUnit>', methods=['GET'])
def get_unit(idUnit):
    unit = Unit.query.get_or_404(idUnit)
    return jsonify(unit.serialize())

# Update a unit by ID
@api.route('/units/<int:idUnit>', methods=['PUT'])
def update_unit(idUnit):
    unit = Unit.query.get_or_404(idUnit)
    data = request.json
    unit.moduleId = data.get('moduleId', unit.moduleId)
    unit.name = data.get('name', unit.name)
    unit.description = data.get('description', unit.description)
    unit.updatedAt = datetime.now()
    db.session.commit()
    return jsonify(unit.serialize())

# Delete a unit by ID
@api.route('/units/<int:idUnit>', methods=['DELETE'])
def delete_unit(idUnit):
    unit = Unit.query.get_or_404(idUnit)
    db.session.delete(unit)
    db.session.commit()
    return jsonify({"message": "Unit deleted successfully"}), 200

# Create a new topic
@api.route('/topics', methods=['POST'])
def create_topic():
    data = request.json
    new_topic = Topic(
        unitId=data.get('unitId'),
        name=data.get('name'),
        description=data.get('description')
    )
    db.session.add(new_topic)
    db.session.commit()
    return jsonify(new_topic.serialize()), 201

# Get all topics
@api.route('/topics', methods=['GET'])
def get_topics():
    topics = Topic.query.all()
    return jsonify([topic.serialize() for topic in topics])

# Get a specific topic by ID
@api.route('/topics/<int:idTopic>', methods=['GET'])
def get_topic(idTopic):
    topic = Topic.query.get_or_404(idTopic)
    return jsonify(topic.serialize())

# Update a topic by ID
@api.route('/topics/<int:idTopic>', methods=['PUT'])
def update_topic(idTopic):
    topic = Topic.query.get_or_404(idTopic)
    data = request.json
    topic.unitId = data.get('unitId', topic.unitId)
    topic.name = data.get('name', topic.name)
    topic.description = data.get('description', topic.description)
    topic.updatedAt = datetime.now()
    db.session.commit()
    return jsonify(topic.serialize())

# Delete a topic by ID
@api.route('/topics/<int:idTopic>', methods=['DELETE'])
def delete_topic(idTopic):
    topic = Topic.query.get_or_404(idTopic)
    db.session.delete(topic)
    db.session.commit()
    return jsonify({"message": "Topic deleted successfully"}), 200

# @api.route('/private')
# @jwt_required()  # Este decorador convierte la ruta en protegida
# def private():
#     user_id = get_jwt_identity()
#     claims = get_jwt()
#     user = User.query.get(user_id)
#     response = {
#         "userId": user_id,
#         "claims": claims,
#         # "isActive" : user.is_active
#     }
#     return jsonify(response)


# @api.route('/exercise', methods=['POST'])
# def create_excercise():
#     try:
#         new_exercise = Exercise(
#             module=request.json.get("module"),
#             type=request.json.get("type"),
#             question=request.json.get("question"),
#             info_blog=request.json.get("info_blog"),
#             info_youtube=request.json.get("info_youtube"),
#         )

#         db.session.add(new_exercise)
#         db.session.flush()
#         exercise_id = new_exercise.id

#         for answer_data in request.json.get("answers"):
#             new_answer = Answers(
#                 answers=answer_data["text"],
#                 exercise_id=exercise_id,
#                 isCorrect=answer_data["isCorrect"],
#                 module=new_exercise.module,
#                 type=new_exercise.type
#             )
#             db.session.add(new_answer)

#         db.session.commit()

#         return jsonify({"msg": "Exercise created successfully", "statusCode": 201, "exercise_id": exercise_id}), 201
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @api.route('/exercise/', methods=['GET'])
# def get_exercise():
#     try:
#         exercises = Exercise.query.all()
#         exercise_list = [exercise.serialize() for exercise in exercises]
#         return jsonify({"exercise": exercise_list}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @api.route('/exercises/<string:module>', methods=['GET'])
# def get_exercises_by_module(module):
#     try:
#         exercises = Exercise.query.filter_by(module=module.upper()).all()
#         if exercises:
#             exercises = [exercise.serialize() for exercise in exercises]
#             return jsonify({"exercises": exercises}), 200
#         else:
#             return jsonify({"msg": "No se encontraron ejercicios para el tipo de módulo especificado"}), 404
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @api.route('/verificar-respuesta/<int:id>', methods=['POST'])
# @jwt_required()
# def verificar_respuesta(id):
#     try:
#         user_id = get_jwt_identity()
#         correctAnswers = Answers.query.filter_by(
#             exercise_id=id).filter_by(isCorrect=True).first()
#         user_answer_exist = AnswersUser.query.filter_by(
#             user_id=user_id).filter_by(exercise_id=id).first()
        

#         if correctAnswers is None:
#             return {"msg": "No existe el ejercicio"}

#         data = request.json
#         correct = data["respuesta"] == correctAnswers.answers

#         if user_answer_exist is None and correct is True:
#             user_answer = AnswersUser()
#             user_answer.user_id = user_id,
#             user_answer.exercise_id = id,
#             user_answer.module = correctAnswers.module,
#             user_answer.type = correctAnswers.type,
#             db.session.add(user_answer)
#             db.session.commit()

#         return {"correct": correct}, 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500






# @api.route('/check-token', methods=['POST'])
# @jwt_required()
# def check_token():
#     jti = get_jwt()["jti"]
#     # Verificar si el jti está en la tabla TokenBlockList
#     blocked_token = TokenBlockedList.query.filter_by(token=jti).first()

#     if blocked_token:
#         return jsonify({"Success": True, "msg": "Token bloqueado"}), 200
#     else:
#         return jsonify({"Success": False, "msg": "Token no bloqueado"}), 200


@api.route('/seed', methods=['POST', 'GET'])
def handle():
    seed()
    response_body = {
        "message": "Data cargada"
    }

    return jsonify(response_body), 200


# @api.route('/progress', methods=['GET'])
# @jwt_required()
# def progress_users():
#     try:
#         user_id = get_jwt_identity()
#         answers_user = AnswersUser.query.filter_by(user_id=user_id)
#         answers_number = answers_user.count()
#         if answers_number == 0:
#             return jsonify({"progress": 0}), 200
#         last_answer = answers_user.order_by(AnswersUser.id.desc()).first()
#         question_all = Exercise.query.count()
#         progreso = answers_number/question_all * 100
#         return jsonify({"progress": progreso, "last_answer": last_answer.serialize()}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @api.route('/progressall', methods=['GET'])
# @jwt_required()
# def progress_users_all():
#     try:
#         teacher_id = get_jwt_identity()
#         users_progress=[]
#         user_list= User.query.filter_by(teacher_id=teacher_id)
#         for user in user_list:
#             answers_user = AnswersUser.query.filter_by(user_id= user.id)
#             answers_number = answers_user.count()
#             if answers_number == 0:
#                 users_progress.append(0)
#                 continue
#             question_all = Exercise.query.count()
#             progreso = answers_number/question_all * 100
#             users_progress.append(round(progreso,1))
#         return jsonify(users_progress), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @api.route('/progress/<string:module>', methods=['GET'])
# @jwt_required()
# def progress_users_module(module):
#     try:
#         user_id = get_jwt_identity()
#         answers_user = AnswersUser.query.filter_by(
#             user_id=user_id).filter_by(module=module.upper())
#         answers_number = answers_user.count()
#         if answers_number == 0:
#             last_answer = Exercise.query.filter_by(
#                 module=module.upper()).first()
#             return jsonify({"progress": 0, "last_answer": last_answer.serialize()}), 200
#         last_answer = answers_user.order_by(AnswersUser.id.desc()).first()
#         question_all_module = Exercise.query.filter_by(
#             module=module.upper()).count()
#         progreso = answers_number/question_all_module * 100
#         return jsonify({"progress": progreso, "last_answer": last_answer.serialize()}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @api.route('/progressgeneral', methods=['GET'])
# @jwt_required()
# def progress_users_modules():
#     try:
#         user_id = get_jwt_identity()


#         answers_user_html = AnswersUser.query.filter_by(user_id=user_id).filter_by(module="HTML")
#         answers_number_html = answers_user_html.count()

#         answers_user_css = AnswersUser.query.filter_by(user_id=user_id).filter_by(module="CSS")
#         answers_number_css = answers_user_css.count()

#         answers_user_js = AnswersUser.query.filter_by(user_id=user_id).filter_by(module="JS")
#         answers_number_js = answers_user_js.count()

#         question_all_html = Exercise.query.filter_by(module="HTML").count()
#         question_all_css = Exercise.query.filter_by(module="CSS").count()
#         question_all_js = Exercise.query.filter_by(module="JS").count()

#         progreso_html = answers_number_html/question_all_html * 100
#         progreso_css = answers_number_css/question_all_css * 100
#         progreso_js = answers_number_js/question_all_js * 100

#         return jsonify({"progress_html": progreso_html,"progress_css": progreso_css,"progress_js": progreso_js}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @api.route('/requestpassword', methods=["POST"])
# def endpoint_mail():
#     body = request.get_json()
#     email = body["email"]
#     user = User.query.filter_by(email=email).first()
#     if user is None:
#         user = Teacher.query.filter_by(email=email).first()
#         if user is None:
#             print(jsonify({"message": "El usuario no existe"}))

#     token = create_access_token(identity=email, additional_claims={
#                                 "type": "password", "email": email})

#     cuerpo = os.getenv("FRONTEND_URL") + '/changepassword?token=' + token
#     verificar = send_email("Recuperacion de Clave", email, cuerpo)

#     if verificar == True:
#         return jsonify({"message": "Gmail Enviado"}), 200
#     else:
#         return jsonify({"message": "No se pudo enviar el correo"}), 400


# @api.route('/changepassword', methods=['PATCH'])
# def change_password():
#     try:
#         body = request.get_json()
#         email = body["email"]
#         user = User.query.filter_by(email=email).first()
#         if user is None:
#             teacher = Teacher.query.filter_by(email=email).first()
#             if teacher is None:
#                 return jsonify({"message": "El usuario no existe"}), 404

#         new_password = request.json.get("password")
#         if new_password:
#             hashed_password = bcrypt.generate_password_hash(
#                 new_password, 10).decode("utf-8")

#             if user:
#                 user.password = hashed_password
#             elif teacher:
#                 teacher.password = hashed_password

#             db.session.commit()

#             return jsonify({"message": "Contraseña cambiada exitosamente"}), 200
#         else:
#             return jsonify({"message": "La nueva contraseña no se proporcionó"}), 400
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @api.route('/decrypt', methods=['POST'])
# @jwt_required()
# def decrypt():
#     try:
#         email = get_jwt().get('email', None)

#         return jsonify({"email": email}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
