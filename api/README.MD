# 📌 Proyecto Azure Functions con PostgreSQL

Este proyecto utiliza **Azure Functions** en **Node.js** con conexión a **PostgreSQL** usando el cliente oficial `pg`, y gestiona variables de entorno con `dotenv`.

---

## 🛠 Requisitos previos

Antes de instalar y correr el proyecto, asegúrate de tener:

- **Node.js** v22.18.0  
  [Descargar Node.js](https://nodejs.org/en/)  
  Verificar versión:
  ```bash
  node -v

Dependencias instaladas:
```
"dependencies": {
  "@azure/functions": "^4.0.0",
  "dotenv": "^17.2.1",
  "pg": "^8.16.3"
}
```

Previo uso de func start:
```
Habilitar ejecución de scripts en PowerShell (Windows)

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

npm install -g azure-functions-core-tools@4 --unsafe-perm true

//revisar installacion
func --version
```

## 🛠 Iniciar proyecto
git clone [<url-del-repositorio>](https://github.com/leonardoPBF/functionci.git)

instalar azure cliente, en mi caso msi 64bits:
https://learn.microsoft.com/es-es/cli/azure/install-azure-cli-windows?view=azure-cli-latest&pivots=msi

Para correr el proyecto
npm install

Correr functions en local
func start

Verificar que este corriendo el azure cliente
func --version
