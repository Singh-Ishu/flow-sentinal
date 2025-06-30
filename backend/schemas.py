from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

# Pipe Node Schemas
class PipeNodeBase(BaseModel):
    id: str
    name: str
    type: str
    pressure: Optional[float] = None
    max_pressure: Optional[float] = None
    flow_rate: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = "active"

class PipeNodeResponse(PipeNodeBase):
    last_updated: datetime
    
    class Config:
        from_attributes = True

# Pipe Schemas
class PipeBase(BaseModel):
    id: str
    source_node_id: str
    target_node_id: str
    length: float
    diameter: float
    material: str
    flow_capacity: float
    current_flow: float = 0.0
    pressure_loss: float = 0.0
    status: str = "operational"

class PipeResponse(PipeBase):
    installation_date: Optional[datetime] = None
    last_inspection: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Maintenance Log Schemas
class MaintenanceLogBase(BaseModel):
    entity_type: str
    entity_id: str
    scheduled_date: datetime
    notes: Optional[str] = None
    maintenance_type: Optional[str] = None
    technician: Optional[str] = None
    cost: Optional[float] = None

class MaintenanceLogCreate(MaintenanceLogBase):
    pass

class MaintenanceLogUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    performed_date: Optional[datetime] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    maintenance_type: Optional[str] = None
    technician: Optional[str] = None
    cost: Optional[float] = None

class MaintenanceLogResponse(MaintenanceLogBase):
    id: int
    performed_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Graph Data Schemas
class GraphNode(BaseModel):
    id: str
    name: str
    type: str
    pressure: Optional[float]
    status: str
    position: Dict[str, float]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    length: float
    current_flow: float
    flow_capacity: float
    status: str

class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# System Statistics Schema
class SystemStats(BaseModel):
    total_nodes: int
    active_nodes: int
    down_nodes: int
    unreported_nodes: int
    total_flow: float
    ideal_flow: float
    flow_difference: float
    avg_pressure: float
    current_leaks: int
    most_vulnerable_pipe: str
    sensor_reporting_percentage: float

# Sensor Reading Schema
class SensorReadingCreate(BaseModel):
    node_id: str
    pressure: Optional[float] = None
    flow_rate: Optional[float] = None
    temperature: Optional[float] = None

class SensorReadingResponse(SensorReadingCreate):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Leak Alert Schema
class LeakAlertCreate(BaseModel):
    entity_type: str
    entity_id: str
    alert_type: str
    severity: str = "medium"
    description: Optional[str] = None

class LeakAlertResponse(LeakAlertCreate):
    id: int
    is_resolved: bool
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True