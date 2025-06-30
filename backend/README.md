# Flow-Sentinel Backend

FastAPI-based backend for the Flow-Sentinel pipeline monitoring system.

## Features

- **RESTful API** with automatic OpenAPI documentation
- **SQLAlchemy ORM** with SQLite database
- **Pydantic models** for data validation
- **CORS support** for frontend integration
- **Mock data generation** for development and testing
- **AI/ML ready architecture** for future model integration
- **Comprehensive logging** and error handling

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

3. **Access the API:**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Core Data
- `GET /graph` - Pipeline graph data for visualization
- `GET /stats` - System-wide statistics
- `GET /pipes` - All pipes information
- `GET /pipes/{pipe_id}` - Specific pipe details
- `GET /nodes` - All pipe nodes
- `GET /nodes/{node_id}` - Specific node details

### Maintenance Management
- `GET /maintenance` - All maintenance tasks
- `POST /maintenance` - Create new maintenance task
- `PUT /maintenance/{task_id}` - Update maintenance task
- `DELETE /maintenance/{task_id}` - Delete maintenance task

### AI/ML Endpoints (Future Integration)
- `POST /predict/leak` - Predict leak probability
- `POST /predict/maintenance` - Predict maintenance needs

## Database Schema

### PipeNode
- `id` (String, Primary Key)
- `name` (String)
- `type` (String) - pump, valve, sensor, junction
- `pressure` (Float)
- `max_pressure` (Float)
- `flow_rate` (Float)
- `latitude` (Float)
- `longitude` (Float)
- `status` (String) - active, offline, unreported, demand, leak
- `last_updated` (DateTime)

### Pipe
- `id` (String, Primary Key)
- `source_node_id` (String, Foreign Key)
- `target_node_id` (String, Foreign Key)
- `length` (Float) - in meters
- `diameter` (Float) - in mm
- `material` (String) - steel, pvc, concrete, etc.
- `flow_capacity` (Float) - max flow in L/min
- `current_flow` (Float) - current flow in L/min
- `pressure_loss` (Float)
- `installation_date` (DateTime)
- `last_inspection` (DateTime)
- `status` (String) - operational, maintenance, damaged

### MaintenanceLog
- `id` (Integer, Primary Key)
- `entity_type` (String) - pipe or node
- `entity_id` (String)
- `scheduled_date` (DateTime)
- `performed_date` (DateTime, Optional)
- `notes` (Text)
- `status` (String) - scheduled, in_progress, completed, cancelled
- `maintenance_type` (String)
- `technician` (String)
- `cost` (Float)

## Mock Data

The system automatically populates the database with realistic mock data including:
- 7 pipe nodes (pumps, valves, sensors, junctions)
- 6 connecting pipes with various materials and capacities
- 5 maintenance log entries with different statuses
- 24 hours of sensor readings for each node
- Sample leak alerts and anomaly data

## AI/ML Integration

The backend is designed to easily integrate machine learning models:

1. **Leak Detection Model** - Predicts leak probability based on sensor data
2. **Maintenance Prediction Model** - Optimizes maintenance scheduling
3. **Anomaly Detection Model** - Real-time anomaly detection in sensor streams

Models are implemented as placeholder classes in `ai_models.py` and can be replaced with actual trained models.

## Development

### Adding New Endpoints
1. Define Pydantic schemas in `schemas.py`
2. Add database models in `models.py`
3. Implement CRUD operations in `crud.py`
4. Add API endpoints in `main.py`

### Database Migrations
The system uses SQLAlchemy with automatic table creation. For production, consider using Alembic for proper migrations.

### Testing
```bash
# Run with test database
DATABASE_URL=sqlite:///./test.db uvicorn main:app --reload
```

## Production Deployment

1. Set environment variables (see `.env.example`)
2. Use PostgreSQL instead of SQLite
3. Configure proper logging and monitoring
4. Set up reverse proxy (nginx)
5. Use production WSGI server (gunicorn)

```bash
# Production example
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```