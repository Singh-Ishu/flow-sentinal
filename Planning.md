# Pipeline Leak Detection Tool – Full Project Plan

## Stack

**Backend:** Go + gRPC + REST API  
**Frontend:** React + TypeScript  
**Database:** PostgreSQL  
**Real-time:** WebSocket (Socket.io or native WS)  
**Hosting:** Railway  
**Stress Testing:** k6  

---

## Pages & Features

### 1. Dashboard
**Access:** Admin, Analyst, Contractor

**Layout:**
- Live network map (top 60%)
- Urgent alerts panel (top-right, collapsible)
- Small log window (bottom-left, last 20 events)
- Stats panel (bottom-right: total nodes, active alerts, avg flow rate)

**Features:**
- **Live Map:** Real-time node positions, color-coded by status (green=normal, yellow=warning, red=critical)
  - Click node → shows live telemetry (pressure, flow, temp)
  - Pipes drawn between nodes, color-coded by health
- **Alert Panel:** Live critical/warning alerts sorted by severity
  - Auto-refresh via WebSocket
  - Click alert → jump to Logs page filtered by that alert
- **Stats:** Auto-updating gauges (refreshed every 2s from Redis)
- **Log Peek:** Tail of recent logs, clickable to navigate to Logs page

---

### 2. Logs Page
**Access:** Admin, Analyst, Contractor

**Layout:**
- Filter bar (top)
- Table with infinite scroll or pagination
- Log detail modal (click row)

**Features:**
- **Filters:**
  - Timeline (date range picker)
  - Node ID (dropdown or search)
  - Pipe ID (dropdown or search)
  - Location (dropdown)
  - Log Type (checkboxes: alert, normal, warning, info)
  - Severity (critical, warning, info)
- **Table Columns:** Timestamp, Node, Pipe, Location, Log Type, Message, Severity
- **Log Detail Modal:** Full log entry + context (related events, node status at time of log)
- **Export:** Download filtered logs as CSV

---

### 3. Analytics Page
**Access:** Admin, Analyst

**Layout:**
- Metric selector (top-left)
- Time range picker (top-center)
- Charts (main area)
- Summary stats (right sidebar)

**Features:**
- **Charts:**
  - Flow rate over time (line chart, per-node or aggregated)
  - Pressure distribution (histogram or box plot)
  - Temperature trends (line chart)
  - Alert frequency heatmap (by node, by time)
  - Node health timeline (stacked area chart)
- **Metric Selector:** Switch between flow, pressure, temp, etc.
- **Time Range:** Last 24h, 7d, 30d, custom
- **Summary Stats:** Min/max/avg/p95 for selected metric
- **Anomaly Detection:** Highlight unusual spikes/dips (visual or badge)

---

### 4. Tasks Page
**Access:** Admin, Contractor (not Analyst)

**Layout:**
- Task creation form (top)
- Task list with status badges
- Detail modal for each task

**Features:**
- **Create Task:**
  - Title, description, assigned node/pipe, priority (low/medium/high)
  - Task type: maintenance, leak response, inspection
  - Due date/time
  - Assign to user (dropdown)
- **Task List:** Columns: Title, Assigned To, Node, Priority, Status (pending/in-progress/completed), Due Date
- **Status Update:** Click task → modal to change status, add notes
- **Filters:** By status, assigned user, priority, due date
- **Auto-close:** Completed tasks can be manually closed or auto-archived after 7 days

---

### 5. User Management
**Access:** Admin only

**Layout:**
- User table (top)
- Create/edit user modal

**Features:**
- **Create User:**
  - Email, name, role (Admin/Analyst/Contractor)
  - Auto-generate temp password or send invite link
- **Edit User:** Change name, role, reset password
- **Delete User:** Soft delete (archive, don't hard delete)
- **Columns:** Name, Email, Role, Last Login, Status (active/inactive)
- **Search:** By name or email

---

## Repo Skeleton

```
pipeline-leak-detection/
├── backend/                          # Go service
│   ├── cmd/
│   │   └── main.go                   # Entry point
│   ├── internal/
│   │   ├── api/
│   │   │   ├── grpc/
│   │   │   │   └── telemetry.proto   # gRPC service definitions
│   │   │   └── rest/
│   │   │       ├── handlers.go       # REST endpoints
│   │   │       └── routes.go
│   │   ├── db/
│   │   │   ├── postgres.go           # DB connection, migrations
│   │   │   └── queries.go            # SQL queries (prepared statements)
│   │   ├── models/
│   │   │   ├── telemetry.go
│   │   │   ├── alert.go
│   │   │   ├── task.go
│   │   │   └── user.go
│   │   ├── service/
│   │   │   ├── telemetry_service.go  # Business logic
│   │   │   ├── alert_service.go
│   │   │   ├── analytics_service.go
│   │   │   └── task_service.go
│   │   ├── middleware/
│   │   │   ├── auth.go               # JWT auth
│   │   │   └── logging.go
│   │   └── websocket/
│   │       └── hub.go                # WebSocket hub for live updates
│   ├── migrations/
│   │   └── ...
│   ├── go.mod
│   ├── go.sum
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                          # React + TypeScript
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── LiveMap.tsx
│   │   │   │   ├── AlertPanel.tsx
│   │   │   │   ├── StatsPanel.tsx
│   │   │   │   └── LogPeek.tsx
│   │   │   ├── Logs/
│   │   │   │   ├── LogsPage.tsx
│   │   │   │   ├── LogTable.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   └── LogDetailModal.tsx
│   │   │   ├── Analytics/
│   │   │   │   ├── AnalyticsPage.tsx
│   │   │   │   ├── ChartContainer.tsx
│   │   │   │   ├── FlowRateChart.tsx
│   │   │   │   ├── PressureChart.tsx
│   │   │   │   └── AlertHeatmap.tsx
│   │   │   ├── Tasks/
│   │   │   │   ├── TasksPage.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   ├── TaskList.tsx
│   │   │   │   └── TaskDetailModal.tsx
│   │   │   ├── UserManagement/
│   │   │   │   ├── UsersPage.tsx
│   │   │   │   ├── UserTable.tsx
│   │   │   │   ├── UserFormModal.tsx
│   │   │   │   └── DeleteUserModal.tsx
│   │   │   ├── Common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLiveData.ts         # WebSocket subscription hook
│   │   │   ├── useApi.ts              # API call wrapper
│   │   │   └── useLocalStorage.ts
│   │   ├── services/
│   │   │   ├── api.ts                 # Axios instance + endpoints
│   │   │   ├── websocket.ts           # WebSocket client
│   │   │   ├── auth.ts                # JWT handling
│   │   │   └── storage.ts
│   │   ├── types/
│   │   │   ├── index.ts               # All TypeScript interfaces
│   │   │   └── api.ts
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── README.md
│
├── benchmarks/                        # Stress test configs
│   ├── k6_telemetry_load.js           # Load test script
│   ├── k6_concurrent_nodes.js         # Concurrent connection test
│   ├── results/
│   │   └── sample_run.json            # Example results
│   └── README.md
│
├── docker-compose.yml                 # Local dev setup
├── .github/
│   └── workflows/
│       ├── deploy.yml                 # Auto-deploy to Railway
│       └── tests.yml                  # Backend tests
├── README.md                          # Main project overview
└── ARCHITECTURE.md                    # System design doc
```

---

## Stack Detail

| Layer | Choice | Why |
|-------|--------|-----|
| **Backend** | Go | Concurrency, <100ms latency, compiles to single binary |
| **API Protocol** | gRPC (telemetry) + REST (general) | Binary protocol for high throughput, REST for frontend ease |
| **Frontend** | React + TypeScript + Vite | Type safety, fast dev/build, industry standard |
| **Styling** | CSS | No decision fatigue, responsive out-of-box |
| **Charts** | Recharts or Chart.js | Lightweight, React-friendly |
| **Live Updates** | WebSocket (native or Socket.io) | Real-time without polling |
| **Database** | PostgreSQL + TimescaleDB | Time-series optimized, ACID compliance |
| **Cache** | Redis | Pub/sub for live updates, in-memory stats |
| **Auth** | JWT + bcrypt | Stateless, simple role-based checks |
| **Container** | Docker | Easy Railway deployment |
| **Load Testing** | k6 | JavaScript-based, great for gRPC/WebSocket tests |

---

## Development Workflow

1. **Phase 1: Backend core**
   - Go API scaffold + gRPC telemetry ingestion
   - Database schema + migrations
   - Redis pub/sub setup
   - Basic REST endpoints (no auth yet)

2. **Phase 2: Frontend scaffold**
   - Layout + routing
   - Auth (login, JWT handling)
   - Dashboard skeleton

3. **Phase 3: Live features**
   - WebSocket integration
   - Dashboard map + live updates
   - Alerts logic

4. **Phase 4: Pages**
   - Logs, Analytics, Tasks, Users (in order of complexity)

5. **Phase 5: Polish**
   - Error handling, edge cases
   - Stress testing + benchmarks
   - Documentation

6. **Phase 6: Deploy**
   - Docker setup
   - Railway deployment
   - Live monitoring

---
