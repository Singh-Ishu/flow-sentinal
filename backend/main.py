from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn

from database import SessionLocal, engine, Base
from models import PipeNode, Pipe, MaintenanceLog
from schemas import (
    PipeNodeResponse, PipeResponse, MaintenanceLogResponse,
    MaintenanceLogCreate, MaintenanceLogUpdate,
    GraphData, SystemStats
)
from crud import (
    get_pipe_nodes, get_pipes, get_maintenance_logs,
    create_maintenance_log, update_maintenance_log, delete_maintenance_log,
    get_maintenance_log_by_id, get_pipe_by_id
)
from mock_data import populate_mock_data
from ai_prediction_service import maintenance_predictor

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Flow-Sentinel API",
    description="Pipeline monitoring and leak detection system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
async def startup_event():
    """Populate database with mock data on startup"""
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(PipeNode).count() == 0:
            populate_mock_data(db)
            print("Mock data populated successfully!")
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Flow-Sentinel API is running"}

@app.get("/graph", response_model=GraphData)
async def get_graph_data(db: Session = Depends(get_db)):
    """Get pipeline graph data for visualization"""
    nodes = get_pipe_nodes(db)
    pipes = get_pipes(db)
    
    # Transform data for frontend graph visualization
    graph_nodes = []
    graph_edges = []
    
    for node in nodes:
        graph_nodes.append({
            "id": node.id,
            "name": node.name,
            "type": node.type,
            "pressure": node.pressure,
            "status": node.status,
            "position": {"x": node.longitude * 100, "y": node.latitude * 100}
        })
    
    for pipe in pipes:
        graph_edges.append({
            "id": pipe.id,
            "source": pipe.source_node_id,
            "target": pipe.target_node_id,
            "length": pipe.length,
            "current_flow": pipe.current_flow,
            "flow_capacity": pipe.flow_capacity,
            "status": "normal" if pipe.current_flow < pipe.flow_capacity * 0.8 else "high"
        })
    
    return GraphData(nodes=graph_nodes, edges=graph_edges)

@app.get("/stats", response_model=SystemStats)
async def get_system_stats(db: Session = Depends(get_db)):
    """Get system-wide statistics"""
    nodes = get_pipe_nodes(db)
    pipes = get_pipes(db)
    maintenance_logs = get_maintenance_logs(db)
    
    total_nodes = len(nodes)
    active_nodes = len([n for n in nodes if n.status == "active"])
    down_nodes = len([n for n in nodes if n.status == "offline"])
    unreported_nodes = len([n for n in nodes if n.status == "unreported"])
    
    total_flow = sum(pipe.current_flow for pipe in pipes)
    ideal_flow = sum(pipe.flow_capacity for pipe in pipes)
    flow_difference = ideal_flow - total_flow
    
    pressures = [node.pressure for node in nodes if node.pressure is not None]
    avg_pressure = sum(pressures) / len(pressures) if pressures else 0
    
    current_leaks = len([n for n in nodes if n.status == "leak"])
    vulnerable_pipes = [p for p in pipes if p.current_flow > p.flow_capacity * 0.9]
    most_vulnerable = vulnerable_pipes[0].id if vulnerable_pipes else "None"
    
    reporting_sensors = len([n for n in nodes if n.status in ["active", "demand"]])
    sensor_percentage = (reporting_sensors / total_nodes * 100) if total_nodes > 0 else 0
    
    return SystemStats(
        total_nodes=total_nodes,
        active_nodes=active_nodes,
        down_nodes=down_nodes,
        unreported_nodes=unreported_nodes,
        total_flow=total_flow,
        ideal_flow=ideal_flow,
        flow_difference=flow_difference,
        avg_pressure=avg_pressure,
        current_leaks=current_leaks,
        most_vulnerable_pipe=most_vulnerable,
        sensor_reporting_percentage=sensor_percentage
    )

@app.get("/pipes", response_model=List[PipeResponse])
async def get_all_pipes(db: Session = Depends(get_db)):
    """Get all pipes with their details"""
    pipes = get_pipes(db)
    return pipes

@app.get("/pipes/{pipe_id}", response_model=PipeResponse)
async def get_pipe_details(pipe_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific pipe"""
    pipe = db.query(Pipe).filter(Pipe.id == pipe_id).first()
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe not found")
    return pipe

@app.get("/nodes", response_model=List[PipeNodeResponse])
async def get_all_nodes(db: Session = Depends(get_db)):
    """Get all pipe nodes"""
    nodes = get_pipe_nodes(db)
    return nodes

@app.get("/nodes/{node_id}", response_model=PipeNodeResponse)
async def get_node_details(node_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific node"""
    node = db.query(PipeNode).filter(PipeNode.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return node

@app.get("/maintenance", response_model=List[MaintenanceLogResponse])
async def get_maintenance_tasks(db: Session = Depends(get_db)):
    """Get all maintenance tasks"""
    return get_maintenance_logs(db)

@app.post("/maintenance", response_model=MaintenanceLogResponse)
async def create_maintenance_task(
    maintenance: MaintenanceLogCreate,
    db: Session = Depends(get_db)
):
    """Create a new maintenance task"""
    return create_maintenance_log(db, maintenance)

@app.put("/maintenance/{task_id}", response_model=MaintenanceLogResponse)
async def update_maintenance_task(
    task_id: int,
    maintenance: MaintenanceLogUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing maintenance task"""
    existing_task = get_maintenance_log_by_id(db, task_id)
    if not existing_task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    return update_maintenance_log(db, task_id, maintenance)

@app.delete("/maintenance/{task_id}")
async def delete_maintenance_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a maintenance task"""
    existing_task = get_maintenance_log_by_id(db, task_id)
    if not existing_task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    delete_maintenance_log(db, task_id)
    return {"message": "Maintenance task deleted successfully"}

# AI-powered maintenance prediction endpoint
@app.get("/pipes/{pipe_id}/maintenance-prediction")
async def predict_pipe_maintenance(pipe_id: str, db: Session = Depends(get_db)):
    """Get AI-powered maintenance prediction for a specific pipe"""
    pipe = get_pipe_by_id(db, pipe_id)
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe not found")
    
    # Convert pipe data to dictionary for the AI model
    pipe_data = {
        "id": pipe.id,
        "length": pipe.length,
        "diameter": pipe.diameter,
        "material": pipe.material,
        "current_flow": pipe.current_flow,
        "flow_capacity": pipe.flow_capacity,
        "pressure_loss": pipe.pressure_loss,
        "installation_date": pipe.installation_date,
        "last_inspection": pipe.last_inspection,
        "status": pipe.status
    }
    
    # Get AI prediction
    prediction = maintenance_predictor.predict_maintenance_date(pipe_data)
    
    # Add pipe information to the response
    prediction["pipe_id"] = pipe_id
    prediction["pipe_info"] = {
        "length": pipe.length,
        "diameter": pipe.diameter,
        "material": pipe.material,
        "status": pipe.status,
        "installation_date": pipe.installation_date.isoformat() if pipe.installation_date else None,
        "last_inspection": pipe.last_inspection.isoformat() if pipe.last_inspection else None
    }
    
    return prediction

# AI/ML endpoints for future integration
@app.post("/predict/leak")
async def predict_leak_probability(pipe_id: str, db: Session = Depends(get_db)):
    """Predict leak probability for a specific pipe (placeholder for ML model)"""
    pipe = db.query(Pipe).filter(Pipe.id == pipe_id).first()
    if not pipe:
        raise HTTPException(status_code=404, detail="Pipe not found")
    
    # Placeholder for ML model integration
    # In the future, this would use actual ML models
    import random
    probability = random.uniform(0.1, 0.9)
    risk_level = "low" if probability < 0.3 else "medium" if probability < 0.7 else "high"
    
    return {
        "pipe_id": pipe_id,
        "leak_probability": probability,
        "risk_level": risk_level,
        "factors": [
            "Age of pipe",
            "Pressure variations",
            "Material degradation",
            "Historical maintenance"
        ]
    }

@app.post("/predict/maintenance")
async def predict_maintenance_needs(entity_type: str, entity_id: str, db: Session = Depends(get_db)):
    """Predict maintenance needs for pipes or nodes (placeholder for ML model)"""
    # Placeholder for ML model integration
    import random
    from datetime import datetime, timedelta
    
    next_maintenance = datetime.now() + timedelta(days=random.randint(30, 180))
    priority = random.choice(["low", "medium", "high"])
    
    return {
        "entity_type": entity_type,
        "entity_id": entity_id,
        "predicted_maintenance_date": next_maintenance.isoformat(),
        "priority": priority,
        "recommended_actions": [
            "Pressure testing",
            "Visual inspection",
            "Valve maintenance"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)