# Cloud Price Tracker

Plataforma web distribuida en la nube para el monitoreo automatizado de precios en tiendas de comercio electrónico y envío de alertas en tiempo real ante caídas de precio.

Proyecto final de **Computación en la Nube** — Universidad Católica Boliviana "San Pablo" (Semestre 2-2026).

---

## Arquitectura

```text
Usuario (Navegador)
   │
   ▼
Amazon S3 (Static Website Hosting — Angular 22)
   │
   │  REST API (HTTP :3000)
   ▼
Amazon EC2 (t3.micro + 2GB Swap)
   ├── Contenedor Backend (Bun + Express + TypeScript)
   └── Contenedor Worker (Bun + Playwright / Headless Chromium)
          │
          ├──► Amazon DynamoDB (Tablas: PRODUCTOS, HISTORIAL_PRECIOS)
          └──► Amazon SNS (Topic: PriceTrackerAlerts -> Email)
```

---

## Stack Tecnológico

* **Frontend:** Angular 22 (Signals, componentes modulares en `models/`, `services/`, `components/`), compilado con Bun y alojado en **Amazon S3**.
* **Backend:** Bun, Express, TypeScript, AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`).
* **Worker de Extracción:** Bun, Playwright (Chromium headless) sobre imagen oficial `mcr.microsoft.com/playwright:v1.65.1-noble` con binario de Bun vía *multi-stage copy*. Extracción en cascada de 3 capas (JSON-LD, Meta Tags OpenGraph/Schema.org y selectores CSS) con detección automática de moneda (`BOB`, `USD`, `GBP`, `EUR`, `PEN`).
* **Base de Datos:** Amazon DynamoDB en producción (`us-east-1`) y `amazon/dynamodb-local` + `dynamodb-admin` en desarrollo local.
* **Notificaciones:** Amazon SNS (`PriceTrackerAlerts`).
* **Contenedores y CI/CD:** Docker, Docker Compose (`docker-compose.yml` local / `docker-compose.prod.yml` producción), Amazon ECR (`linux/amd64`) y GitHub Actions (`ci.yml` + `deploy.yml`).

---

## Estructura del Repositorio

```text
cloud-price-tracker/
├── .github/workflows/
│   ├── ci.yml                  # CI: build Angular, check Backend y Dockerfiles (develop / main)
│   └── deploy.yml              # CD: push a ECR (amd64), deploy en EC2 vía SSH y sync S3 (main)
├── backend/
│   ├── src/
│   │   ├── config/dynamo.ts    # Cliente híbrido (local vs AWS IAM Role)
│   │   ├── controllers/        # CRUD de productos e historial
│   │   ├── routes/             # Rutas /api/productos
│   │   └── scripts/            # initTables.ts (creación de tablas locales)
│   └── Dockerfile              # Basado en oven/bun:1-alpine
├── worker/
│   ├── src/
│   │   ├── config/dynamo.ts    # Cliente híbrido (local vs AWS IAM Role)
│   │   ├── extraer.ts          # Motor Playwright en cascada de 3 capas
│   │   └── index.ts            # Barrido de productos ACTIVOS + DynamoDB + SNS
│   └── Dockerfile              # Playwright + multi-stage copy de Bun
├── frontend/
│   └── src/app/                # Aplicación modular Angular 22
├── docker-compose.yml          # Entorno local (DynamoDB Local + Admin + Backend + Worker)
└── docker-compose.prod.yml     # Entorno producción en EC2 (ECR + IAM Role + SNS)
```

---

## Ejecución en Entorno Local

### Requisitos previos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Bun](https://bun.sh/)

### 1. Configurar variables de entorno locales
Crear `backend/.env`:
```env
PORT=
AWS_REGION=
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Crear `worker/.env`:
```env
AWS_REGION=
DYNAMODB_ENDPOINT=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### 2. Levantar servicios con Docker Compose
```bash
docker compose up -d --build
```
* **API Backend:** `http://localhost:3000/health`
* **DynamoDB Admin UI:** `http://localhost:8001`

### 3. Crear tablas en DynamoDB Local (primera vez)
```bash
cd backend
bun install
bun run src/scripts/initTables.ts
```

### 4. Levantar Frontend Angular en desarrollo
```bash
cd frontend
bun install
bun run start
```
Disponible en `http://localhost:4200`.

### 5. Ejecutar barrido manual del Worker en Docker
```bash
docker compose up --build worker
```

---

## Endpoints de la API

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Estado del servicio backend |
| `POST` | `/api/productos` | Registra una nueva URL, precio objetivo y moneda en `PRODUCTOS` |
| `GET` | `/api/productos` | Lista todos los productos monitoreados |
| `GET` | `/api/productos/:id/historial` | Retorna la serie temporal de precios desde `HISTORIAL_PRECIOS` |

---

## Despliegue en AWS y CI/CD

* **Integración Continua (`.github/workflows/ci.yml`):** Se ejecuta en cada `push` y `pull_request` hacia `develop` y `main`. Valida el build de Angular, compilación TypeScript del backend y construcción de las imágenes Docker.
* **Despliegue Continuo (`.github/workflows/deploy.yml`):** Se ejecuta en cada `push` a `main`:
  1. Compila y publica las imágenes `price-tracker-backend` y `price-tracker-worker` (`linux/amd64`) en **Amazon ECR**.
  2. Transfiere `docker-compose.prod.yml` a **Amazon EC2** (`52.200.215.119`) y actualiza el contenedor `backend`. El servidor utiliza el IAM Role `PriceTrackerEC2Role` para acceder a DynamoDB, SNS y ECR sin almacenar credenciales estáticas.
  3. Compila el frontend Angular y sincroniza `frontend/dist/frontend/browser` con el bucket de **Amazon S3**.

---

## Estimación de Costos Mensuales (AWS `us-east-1`)

| Servicio | Configuración | Costo Est. (Producción) | Free Tier |
| :--- | :--- | :---: | :---: |
| **EC2** | `t3.micro` (1 GB RAM + 2 GB Swap), 730 h/mes | $7.59 USD | $0.00 USD |
| **EBS** | `20 GB gp3` | $1.60 USD | $0.00 USD |
| **DynamoDB** | On-Demand (< 1 GB, bajo tráfico) | $0.25 USD | $0.00 USD |
| **ECR** | Almacenamiento de 2 imágenes (~1.5 GB) | $0.15 USD | $0.00 USD |
| **S3** | Alojamiento estático Frontend (< 50 MB) | $0.05 USD | $0.00 USD |
| **SNS** | Alertas por email (< 1,000/mes) | $0.00 USD | $0.00 USD |
| **Total** | | **~$9.64 USD / mes** | **$0.00 USD** |

---

## Integrantes

* **Menchaca Rivero Luis Andrés** — Infraestructura, Docker, AWS y CI/CD
* **Ali Tapia Kevin** — Backend API y Worker de Extracción
* **Lecoña Condori Elias Milan** — Frontend Angular
