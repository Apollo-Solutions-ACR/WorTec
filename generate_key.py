from cryptography.fernet import Fernet

# Generar la clave
key = Fernet.generate_key()

# Imprimir la clave en la consola
print("Genera la siguiente clave y agrégala a tu archivo .env:")
print(key.decode())