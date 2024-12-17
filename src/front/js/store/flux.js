import FingerprintJS from '@fingerprintjs/fingerprintjs';

const obtenerFingerprint = async () => {
    // Cargar la librería de FingerprintJS
    const fpPromise = FingerprintJS.load();

    // Obtener el fingerprint del dispositivo
    const fp = await fpPromise;
    const result = await fp.get();
	console.log(result);

    // Devuelve el identificador único del dispositivo (fingerprint)
    return result.visitorId;
};

const getState = ({ getStore, getActions, setStore }) => {
	const storedUserData = localStorage.getItem('userData');
	const initialUser = storedUserData ? JSON.parse(storedUserData) : null;

	return {
		store: {
			token: null, // Para almacenar el JWT
			isAuthenticated: false, // Estado de autenticación
			institutionId: null, // ID de la institución, si aplica
			role: null, // Rol del usuario autenticado
			message: null,
			exercises: [],
			simpleChoice: [],
			last_answer: [],
			respuestaUser: [],
			progress: null,
			progressModule: null,
			progressGeneral : {},
			progressStudents : {},
			module: {
				html: {
					imagen: "https://generation-sessions.s3.amazonaws.com/ad60b588835c42a878fbc4ab00aaadec/img/html5-logo-and-wordmark-1@2x.png",
					color: "#F16529"
				},
				css: {
					imagen: "https://generation-sessions.s3.amazonaws.com/ad60b588835c42a878fbc4ab00aaadec/img/1200px-css-3-1@2x.png",
					color: "#29A9DF"
				},
				js: {
					imagen: "https://generation-sessions.s3.amazonaws.com/ad60b588835c42a878fbc4ab00aaadec/img/unofficial-javascript-logo-2-1@2x.png",
					color: "#F7DF1E"
				}
			},

			user: initialUser,
			teachers: null,
			teacherData: null,
			email: null
		},

		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getRespuestaUser: async () => {
				const url = process.env.BACKEND_URL + `/api/respuestauser`
				const token = localStorage.getItem('userToken')
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': `Bearer ${token}`
					}
				}

				try {
					// fetching data from the backend
					const resp = await fetch(url, options)
					const data = await resp.json()
					const respuestaUser = data.respuestas
					setStore({ respuestaUser })
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			getProgreso: async () => {


				const url = process.env.BACKEND_URL + `/api/progress`
				const token = localStorage.getItem('userToken')
        
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': `Bearer ${token}`
					}
				}

				try {
					// fetching data from the backend
					const resp = await fetch(url, options)
					const data = await resp.json()
					const progress = data.progress

					setStore({progress})

					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			getProgresoModulo: async (module) => {

				const url = process.env.BACKEND_URL + `/api/progress/${module}`
				const token = localStorage.getItem('userToken')
				if (!token) {
					return false
				}
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': `Bearer ${token}`
					}
				}

				try {

					// fetching data from the backend
					const resp = await fetch(url, options)
					const data = await resp.json()
					const progressModule = data.progress
					setStore({ progressModule })
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			getProgresoGeneral: async () => {

				const url = process.env.BACKEND_URL + `/api/progressgeneral`
				const token = localStorage.getItem('userToken')
				if (!token) {
					return false
				}
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': `Bearer ${token}`
					}
				}

				try {

					// fetching data from the backend
					const resp = await fetch(url, options)
					const data = await resp.json()
					const progressGeneral = data
					setStore({ progressGeneral })
				
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			getProgresoStudents: async () => {

				const url = process.env.BACKEND_URL + `/api/progressall`
				const token= localStorage.getItem('userToken')
				if(!token){
					return false
				}
				const options = {
						method:  'GET',
						headers: {
							'Content-Type': 'application/json', 
							'Access-Control-Allow-Origin': '*',
							'Authorization': `Bearer ${token}`
						}
					}

				try{

					// fetching data from the backend
					const resp = await fetch(url,options)
					const data = await resp.json()
					const progressStudents= data
					setStore({progressStudents})
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			getLastAnswerModule: async (module) => {


				const url = process.env.BACKEND_URL + `/api/progress/${module}`
				const token = localStorage.getItem('userToken')
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': `Bearer ${token}`
					}
				}
				try {

					// fetching data from the backend
					const resp = await fetch(url, options)
					const data = await resp.json()
					const last_answer = data.last_answer
					setStore({ last_answer })

					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			UpdateLastAnswer: (pregunta) => {
				setStore({ last_answer: pregunta })
			},

			getVerificar: async (id, respuesta) => {


				const url = process.env.BACKEND_URL + `/api/verificar-respuesta/${id}`
				const token = localStorage.getItem('userToken')
        
				const options = {
					method: 'POST',
					body: JSON.stringify({ respuesta }),
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': `Bearer ${token}`
					}
				}
				try {
					const resp = await fetch(url, options)
					if (resp.ok) {
						const data = await resp.json()

						const respuesta = data.correct
						// don't forget to return something, that is how the async resolves
						return respuesta;
					} else {
						console.error('La solicitud no se realizó con éxito');
					}
				} catch (error) {
					console.error(error)
				}
			},

			getExercises: async (module) => {
				try {

					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + `/api/exercises/${module}`)
					const data = await resp.json()
					const exercises = data.exercises


					setStore({ exercises })

					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},

			getMessage: async () => {
				try {
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},
			// User Actions
			addUser: async function(formData) {
				const url = `${process.env.BACKEND_URL}/api/user`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'POST',
					body: JSON.stringify(formData), 
					headers: { 
						'Authorization': `Bearer ${token}`, 
						'Content-Type': 'application/json' 
					}
				};
				
				console.log('Enviando datos:', formData); // Log para verificar los datos enviados
				
				try {
					const response = await fetch(url, options);
					
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						return data;
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al agregar el usuario:', error);
					throw error;
				}
			},
			updateSingleUser: async function(userId, formData) {
				const url = `${process.env.BACKEND_URL}/api/user/${userId}`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'PUT',
					body: JSON.stringify(formData),
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				};
			
				console.log('Enviando datos para actualizar el estado del usuario:', formData); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('La solicitud de actualización del estado del usuario se realizó con éxito');
						const data = await response.json();
						return data;
					} else {
						const errorData = await response.json();
						console.error('La solicitud de actualización del estado del usuario no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al actualizar el estado del usuario:', error);
					throw error;
				}
			},
			batchUpdateUsers: async function(userIds, newStatus) {
				const url = `${process.env.BACKEND_URL}/api/users/batch_update`;
				
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
				
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'PUT',
					body: JSON.stringify({
						user_ids: userIds,
						status: newStatus
					}),
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				};
				
				console.log('Enviando datos para actualizar el estado de usuarios:', { userIds, newStatus }); // Log para verificar los datos enviados
				
				try {
					const response = await fetch(url, options);
					
					if (response.ok) {
						console.log('La solicitud de actualización del estado de usuarios se realizó con éxito');
						const data = await response.json();
						return data;
					} else {
						const errorData = await response.json();
						console.error('La solicitud de actualización del estado de usuarios no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al actualizar el estado de los usuarios:', error);
					throw error;
				}
			},					
			getUsersBasic: async function(queryParams = {}) {
				const url = new URL(`${process.env.BACKEND_URL}/api/users`);
			
				// Agregar parámetros de consulta (query params) si existen
				Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'GET',
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando solicitud GET a:', url.toString()); // Log para verificar la URL completa
			
				try {
					const response = await fetch(url.toString(), options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						console.log('Datos recibidos:', data); // Log para ver los datos recibidos
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener los usuarios básicos:', error);
					throw error;
				}
			},
			getUserDetails: async function(userId) {
				if (!userId) {
					console.error('El ID de usuario es necesario para esta solicitud');
					throw new Error('El ID de usuario es necesario para esta solicitud');
				}
			
				const url = `${process.env.BACKEND_URL}/api/users/${userId}`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'GET',
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando solicitud GET a:', url); // Log para verificar la URL completa
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						console.log('Datos recibidos:', data); // Log para ver los datos recibidos
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener los detalles del usuario:', error);
					throw error;
				}
			},
			getTeachersActive: async function(institutionId) {
				const url = `${process.env.BACKEND_URL}/api/users/teachers?institutionId=${institutionId}&status=ACTIVE`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'GET',
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando solicitud GET a:', url); // Log para verificar la URL
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						console.log('Datos recibidos:', data); // Log para ver los datos recibidos
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener los profesores:', error);
					throw error;
				}
			},									
			loginUser: async (userCredentials) => {
				// Suponiendo que tienes una función para obtener el fingerprint
				const fingerprint = await obtenerFingerprint();

				const url = `${process.env.BACKEND_URL}/api/login`;

				const options = {
					method: 'POST',
					body: JSON.stringify({
						...userCredentials,
						fingerprint // Agregar fingerprint a las credenciales de usuario
					}),
					headers: {
						'Content-Type': 'application/json',
					}
				};
			
				try {
					const resp = await fetch(url, options);
			
					if (!resp.ok) {
						const errorText = await resp.text();
						console.error('Error en la respuesta del servidor:', errorText);
						return { success: false, error: 'Error en la solicitud de login' };
					}
			
					const data = await resp.json();
			
					console.log('La solicitud de login se realizó con éxito');
					console.log('Datos recibidos:', data);
			
					// Verificar si los datos adicionales contienen los campos necesarios
					if (data.additional_claims && data.additional_claims.email && data.additional_claims.username) {
						// Guardar el token en localStorage
						localStorage.setItem('userToken', data.token);
						// Actualizar el estado de la aplicación
						await setStore({ user: data.user, token: data.token });
						localStorage.setItem('userData', JSON.stringify(data.user));
						let { user } = getStore()
						console.log("loginuserdata: " + JSON.stringify(user))
						return { success: true };
					} else {
						console.log('Datos de usuario incompletos en la respuesta');
						return { success: false, error: 'Datos de usuario incompletos en la respuesta' };
					}
				} catch (error) {
					console.error('Error en la solicitud:', error);
					return { success: false, error: 'Error de red' };
				}
			},												
            logout: async () => {
				const token = localStorage.getItem('userToken'); // Obtener el token actual
			
				if (token) {
					try {
						const response = await fetch(`${process.env.BACKEND_URL}/api/logout`, {
							method: 'POST',
							headers: {
								'Authorization': `Bearer ${token}` // Enviar el token en los headers
							}
						});
			
						if (!response.ok) {
							console.error("Error al intentar desloguear al usuario.");
							return;
						}
			
						console.log("Token agregado a la lista de tokens bloqueados.");
					} catch (error) {
						console.error("Error durante la solicitud de logout:", error);
					}
				}
			
				// Limpiar el token y los datos del usuario del store y localStorage
				localStorage.removeItem('userToken');
				localStorage.removeItem('userData');
				setStore({ user: null, token: null });
			
				console.log('Usuario deslogueado exitosamente');
			},
            checkUserLoginStatus: () => {
                // Verificar si hay un token en localStorage al cargar la aplicación
                const token = localStorage.getItem('userToken');
                const userData = localStorage.getItem('userData');

                if (token && userData) {
                    setStore({
                        user: JSON.parse(userData),
                        token: token
                    });
                    console.log('Usuario autenticado al cargar la aplicación');
                } else {
                    console.log('No se encontró token o datos de usuario en localStorage');
                }
            },
			verifyToken: async () => {
				const actions = getActions();
				const fingerprint = await obtenerFingerprint(); // Asegúrate de que esta función esté implementada correctamente
			  
				// Obtener el token directamente de localStorage
				const token = localStorage.getItem('userToken'); 
			  
				if (token) {
				  try {
					// Realiza la solicitud de verificación
					const url = `${process.env.BACKEND_URL}/api/verify-token`;
					const response = await fetch(url, {
						method: 'POST',
						headers: {
						  'Authorization': `Bearer ${token}`, // Utiliza el token desde localStorage
						  'Content-Type': 'application/json'
						},
						body: JSON.stringify({ fingerprint: fingerprint })
					  });
			  
					// Verifica si la respuesta es JSON antes de intentar parsearla
					if (!response.ok) {
					  console.error(`Error en la respuesta: ${response.statusText}`);
					  actions.logout();
					  return { success: false };
					}
			  
					const data = await response.json();
			  
					// Comprueba el estado de la respuesta
					if (response.status !== 200 || data.message !== "Token is valid") {
					  // Si la verificación falla, elimina el token del store y localStorage
					  actions.logout();  
					  return { success: false };  
					}
			  
					return { success: true }; // El token es válido
			  
				  } catch (error) {
					// Manejo de cualquier error durante la solicitud o procesamiento
					console.error("Error verifying token:", error);
					actions.logout();  // Acción para eliminar el token del contexto
					return { success: false };
				  }
				} else {
				  // Si no hay token, retorna que la verificación falló
				  return { success: false };
				}
			},
						  
            // ClassLevel Actions
			addClassLevel: async function(formData) {
				const url = `${process.env.BACKEND_URL}/api/classlevel`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'POST',
					body: JSON.stringify(formData), // Convertir formData a JSON
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando datos:', formData); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
					
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al agregar el nivel de clase:', error);
					throw error;
				}
			},
			getClassLevelsByUser: async function(queryParams = {}) {
				const url = new URL(`${process.env.BACKEND_URL}/api/classlevel/user`);
			
				// Agregar parámetros de consulta (query params) si existen
				Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'GET',
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando solicitud GET a:', url.toString()); // Log para verificar la URL completa
			
				try {
					const response = await fetch(url.toString(), options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						console.log('Datos recibidos:', data); // Log para ver los datos recibidos
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener los niveles de clase por usuario:', error);
					throw error;
				}
			},
			getUnrelatedClassLevels: async function(subjectId, queryParams = {}) {
				const url = new URL(`${process.env.BACKEND_URL}/api/classlevel/unrelated/${subjectId}`);
			
				// Agregar parámetros de consulta (query params) si existen
				Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'GET',
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando solicitud GET a:', url.toString()); // Log para verificar la URL completa
			
				try {
					const response = await fetch(url.toString(), options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						console.log('Datos recibidos:', data); // Log para ver los datos recibidos
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener los niveles de clase no relacionados:', error);
					throw error;
				}
			},					
			updateClassLevel: async function(id, data) {
				// Definir la URL del backend sin parámetros sensibles
				const url = `${process.env.BACKEND_URL}/api/classlevel/${id}`;
				
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
				
				if (!token) {
				  console.error('No se encontró un token en localStorage');
				  throw new Error('No se encontró un token en localStorage');
				}
				
				// Configurar las opciones para la solicitud fetch
				const options = {
				  method: 'PUT',
				  headers: { 
					'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
					'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
				  },
				  body: JSON.stringify(data) // Convertir los datos a JSON para el cuerpo de la solicitud
				};
				
				console.log('Enviando solicitud PUT a:', url); // Log para verificar la URL
				
				try {
				  const response = await fetch(url, options);
				  
				  if (response.ok) {
					console.log('La solicitud se realizó con éxito');
					const result = await response.json();
					return result; // Devolver los datos de respuesta si la solicitud es exitosa
				  } else {
					const errorData = await response.json();
					console.error('La solicitud no se realizó con éxito:', errorData);
					throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
				  }
				} catch (error) {
				  console.error('Error al editar el nivel de clase:', error);
				  throw error;
				}
			},					
			//Delete ClassLevel
			deleteClassLevel: async function(id, data) {
				// Definir la URL del backend sin parámetros sensibles
				const url = `${process.env.BACKEND_URL}/api/classlevel/${id}`;
				
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
				
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
				
				// Configurar las opciones para la solicitud fetch
				const options = {
					method: 'DELETE', // Cambiar a DELETE para esta acción
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					},
					body: JSON.stringify(data) // Convertir los datos a JSON para el cuerpo de la solicitud
				};
				
				console.log('Enviando solicitud DELETE a:', url); // Log para verificar la URL
				
				try {
					const response = await fetch(url, options);
					
					if (response.ok) {
						console.log('La solicitud DELETE se realizó con éxito');
						const result = await response.json();
						return result; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud DELETE no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al eliminar el nivel de clase:', error);
					throw error;
				}
			},
			// Subject Actions
			getSubjectsByUser: async function(queryParams = {}) {
				const url = new URL(`${process.env.BACKEND_URL}/api/subject/user`);
			
				// Agregar parámetros de consulta (query params) si existen
				Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'GET',
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando solicitud GET a:', url.toString()); // Log para verificar la URL completa
			
				try {
					const response = await fetch(url.toString(), options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						console.log('Datos recibidos:', data); // Log para ver los datos recibidos
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener los subjects por usuario:', error);
					throw error;
				}
			},
			addSubject: async function(formData) {
				const url = `${process.env.BACKEND_URL}/api/subject`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'POST',
					body: JSON.stringify(formData), // Convertir formData a JSON
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando datos para crear el subject:', formData); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
					
					if (response.ok) {
						console.log('La solicitud para crear el subject se realizó con éxito');
						const data = await response.json();
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al agregar el subject:', error);
					throw error;
				}
			},
			updateSubject: async function(subjectId, formData) {
				const url = `${process.env.BACKEND_URL}/api/subject/${subjectId}`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'PUT',
					body: JSON.stringify(formData), // Convertir formData a JSON
					headers: {
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log(`Enviando solicitud PUT a: ${url}`); // Log para verificar la URL
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al actualizar el subject:', error);
					throw error;
				}
			},			
			deleteSubject: async function(id, formData) {
				const url = `${process.env.BACKEND_URL}/api/subject/${id}`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'DELETE',
					body: JSON.stringify(formData), // Convertir formData a JSON
					headers: {
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log(`Enviando solicitud DELETE a: ${url}`); // Log para verificar la URL
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al eliminar el subject:', error);
					throw error;
				}
			},	
			//LevelSubject relationship Institution
			createLevelSubject: async function(formData) {
				const url = `${process.env.BACKEND_URL}/api/levelSubject`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'POST',
					body: JSON.stringify(formData), // Convertir formData a JSON
					headers: {
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando datos para crear el LevelSubject:', formData); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
					
					if (response.ok) {
						console.log('La solicitud para crear el LevelSubject se realizó con éxito');
						const data = await response.json();
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al crear el LevelSubject:', error);
					throw error;
				}
			},			
			getSubjectsWithLevels: async function(queryParams = {}) {
				const url = new URL(`${process.env.BACKEND_URL}/api/subjects_with_levels`);
				console.log(`Realizando solicitud a: ${url}`);
				
				// Agregar parámetros de consulta si existen
				Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
				
				const token = localStorage.getItem('userToken');
				
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
				
				const options = {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				};
				
				try {
					const response = await fetch(url.toString(), options);
					
					if (response.ok) {
						const data = await response.json();
						
						// Los datos ya incluyen la información de LevelSubject y ClassLevel
						return data;
					} else {
						const errorData = await response.json();
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener los subjects con sus niveles:', error);
					throw error;
				}
			},	
			// Subject Assignment Actions
			getSubjectAssignment: async function() {
				const url = `${process.env.BACKEND_URL}/api/subjectAssignment`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'GET',
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando solicitud GET a:', url); // Log para verificar la URL
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('La solicitud se realizó con éxito');
						const data = await response.json();
						console.log('Datos recibidos:', data); // Log para ver los datos recibidos
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al obtener las asignaciones de materias:', error);
					throw error;
				}
			},
			updateSubjectAssignment: async function(id, formData) {
				const url = `${process.env.BACKEND_URL}/api/subjectAssignment/${id}`;
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'PUT',
					body: JSON.stringify(formData),
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				};
			
				console.log('Enviando datos:', id, formData); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
					if (response.ok) {
						console.log('La actualización se realizó con éxito');
						const data = await response.json();
						return data;
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(errorData.message || 'Error al actualizar');
					}
				} catch (error) {
					console.error('Error en la solicitud de actualización:', error);
					throw error;
				}
			},
			bulkUpdateSubjectAssignment: async function(ids, formData) {
				const url = `${process.env.BACKEND_URL}/api/subjectAssignment/bulkUpdate`;
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				// Incluye los IDs en el cuerpo de la solicitud junto con el resto de los datos
				const requestData = {
					ids,       // arreglo de IDs
					...formData // otros datos que deseas actualizar
				};
			
				const options = {
					method: 'PUT',
					body: JSON.stringify(requestData),
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				};
			
				console.log('Enviando datos para actualización múltiple:', requestData); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
					if (response.ok) {
						console.log('La actualización múltiple se realizó con éxito');
						const data = await response.json();
						return data;
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(errorData.message || 'Error al actualizar');
					}
				} catch (error) {
					console.error('Error en la solicitud de actualización:', error);
					throw error;
				}
			},
			
			
			//RelatedClassLevel Actions
			getRelatedClassLevelsByUser: async function(queryParams = {}) {
				const url = new URL(`${process.env.BACKEND_URL}/api/relatedclasslevel/user`);
				console.log(`Realizando solicitud a: ${url}`);
				// Agregar parámetros de consulta si existen
				Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
			  
				const token = localStorage.getItem('userToken');
			  
				if (!token) {
				  console.error('No se encontró un token en localStorage');
				  throw new Error('No se encontró un token en localStorage');
				}
			  
				const options = {
				  method: 'GET',
				  headers: { 
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				  }
				};
			  
				try {
				  const response = await fetch(url.toString(), options);
			  
				  if (response.ok) {
					const data = await response.json();
			  
					// Ya no necesitas hacer una segunda llamada a `classlevel`, ya que el nuevo endpoint incluye esa información.
					return data;  // Los datos ya tienen el nivel y sección de `ClassLevel`
				  } else {
					const errorData = await response.json();
					throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
				  }
				} catch (error) {
				  console.error('Error al obtener los niveles de clase relacionados:', error);
				  throw error;
				}
			  },
			createRelatedClassLevel: async function(formData) {
				const url = `${process.env.BACKEND_URL}/api/relatedclasslevel`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'POST',
					body: JSON.stringify(formData), // Convertir formData a JSON
					headers: { 
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log('Enviando datos:', formData); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('Solicitud de unirse a un nivel de clase enviada con éxito');
						const data = await response.json();
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al crear el relatedClassLevel:', error);
					throw error;
				}
			},
			updateRelatedClassLevelStatus: async function(id, newStatus) {
				const url = `${process.env.BACKEND_URL}/api/relatedclasslevel/${id}`;
			
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
			
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				const options = {
					method: 'PUT',
					body: JSON.stringify({ status: newStatus }), // Enviar el nuevo estado como JSON
					headers: {
						'Authorization': `Bearer ${token}`, // Agregar el token de autenticación aquí
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					}
				};
			
				console.log(`Actualizando estado del RelatedClassLevel con ID: ${id}, nuevo estado: ${newStatus}`); // Log para verificar los datos enviados
			
				try {
					const response = await fetch(url, options);
			
					if (response.ok) {
						console.log('Estado del relatedClassLevel actualizado con éxito');
						const data = await response.json();
						return data; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.error || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al actualizar el estado del relatedClassLevel:', error);
					throw error;
				}
			},
			
			deleteRelatedClassLevel: async function(data) {
				// Definir la URL del backend para eliminar relatedClassLevel
				const url = `${process.env.BACKEND_URL}/api/relatedclasslevel`;
				
				// Obtener el token de localStorage
				const token = localStorage.getItem('userToken');
				
				if (!token) {
					console.error('No se encontró un token en localStorage');
					throw new Error('No se encontró un token en localStorage');
				}
			
				// Configurar las opciones para la solicitud fetch
				const options = {
					method: 'DELETE', // Usamos DELETE para esta acción
					headers: { 
						'Authorization': `Bearer ${token}`, // Incluir el token de autenticación
						'Content-Type': 'application/json' // Establecer el tipo de contenido como JSON
					},
					body: JSON.stringify(data) // Convertir los datos (ids o id) a JSON para el cuerpo de la solicitud
				};
			
				console.log('Enviando solicitud DELETE a:', url); // Log para verificar la URL
				
				try {
					const response = await fetch(url, options);
					
					if (response.ok) {
						console.log('La solicitud DELETE se realizó con éxito');
						const result = await response.json();
						return result; // Devolver los datos de respuesta si la solicitud es exitosa
					} else {
						const errorData = await response.json();
						console.error('La solicitud DELETE no se realizó con éxito:', errorData);
						throw new Error(`Error: ${response.status} - ${errorData.message || response.statusText}`);
					}
				} catch (error) {
					console.error('Error al eliminar relatedClassLevel:', error);
					throw error;
				}
			},								
			updateUser: async (data) => {

				// console.log("new User Data " + JSON.stringify(data) + "userId " + data.id)
				const role = data.role;
				// console.log(role)
				let url;
				if (role === 'teacher') {

					url = process.env.BACKEND_URL + '/api/teacher/' + data.id;
				} else if (role === 'alumno') {

					url = process.env.BACKEND_URL + '/api/user/' + data.id;
				} else {
					console.error('Rol de usuario no válido');
					return;
				}

				const options = {
					method: 'PATCH',
					body: JSON.stringify(data),
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				}
				try {
					const resp = await fetch(url, options)
					if (resp.ok) {
						console.log('La solicitud se realizó con éxito');
						let { user } = getStore();
						const updatedUser = { ...user, ...data };
						await setStore({ user: updatedUser });
						localStorage.setItem('userData', JSON.stringify(updatedUser));
					
					} else {
						console.error('La solicitud no se realizó con éxito');
					}
				} catch (error) {
					console.error(error)
				}
			},
			getTeachersStudents: async (userid) => {
				let { teacherData } = getStore()
				const url = process.env.BACKEND_URL + '/api/teacher/' + userid;
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				}

				try {
					const resp = await fetch(url, options);
					if (resp.ok) {
						const data = await resp.json()
						const updatedTeacherData = { ...teacherData, ...data };
						await setStore({ teacherData: updatedTeacherData })
						// console.log("getTeacherStflux" + JSON.stringify(updatedTeacherData));
						return data
					}
				} catch (error) {
					console.error(error)
				}
			},
			checkToken: async (token) => {

				const url = process.env.BACKEND_URL + '/api/check-token';
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': 'Bearer ' + token
					}

				}
				try {
					const resp = await fetch(url, options);
					if (resp.ok) {
						const data = JSON.stringify(resp.json)
						return data;
					} else {
						console.error('La solicitud de logout no se realizó con éxito');
					}
				} catch (error) {
					console.error(error);
				}
			},
			recoveryPassword: async (email) => {
				const url = process.env.BACKEND_URL + '/api/requestpassword';
				const options = {
					method: 'POST',
					body: JSON.stringify({
						email
					}),
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}


				}
				try {
					const resp = await fetch(url, options);
					if (resp.ok) {
						return { success: true, "msg": "mail Enviado" };
					} else {
						console.error('La solicitud de logout no se realizó con éxito');
					}
				} catch (error) {
					console.error(error);
				}
			},
			getUser: async (userid) => {
				let { teacherData } = getStore()
				const url = process.env.BACKEND_URL + '/api/user/' + userid;
				const options = {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'
					}
				}

				try {
					const resp = await fetch(url, options);
					if (resp.ok) {
						const data = await resp.json()
						return data
					}
				} catch (error) {
					console.error(error)
				}
			},
			decrypt: async (token) => {
				const url = process.env.BACKEND_URL + '/api/decrypt';
				const options = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*',
						'Authorization': 'Bearer ' + token
					}
				}
				try {
					const resp = await fetch(url, options);
					if (resp.ok) {
						const data = await resp.json()
						return data
					}
				} catch (error) {
					console.error(error)
				}
			},
			changePassword: async (credentials) => {
				const url = process.env.BACKEND_URL + '/api/changepassword';
				console.log(credentials)
				const options = {
					method: 'PATCH',
					body: JSON.stringify({
						"email": credentials.email,
						"password": credentials.password
					}),
					headers: {
						'Content-Type': 'application/json',
						'Access-Control-Allow-Origin': '*'

					}
				}
				try {
					const resp = await fetch(url, options);
					if (resp.ok) {
						const data = await resp.json()
						return data
					}
				} catch (error) {
					console.error(error)
				}
			},
			rechargeToken: ()=>{
				setStore({ token: localStorage.getItem('userToken') })
			}


		},
	};
};
export default getState;
