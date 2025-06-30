from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class PipeNode(Base):
    __tablename__ = "pipe_nodes"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # pump, valve, sensor, junction
    pressure = Column(Float, nullable=True)
    max_pressure = Column(Float, nullable=True)
    flow_rate = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String, default="active")  # active, offline, unreported, demand, leak
    last_updated = Column(DateTime, default=func.now())
    
    # Relationships
    source_pipes = relationship("Pipe", foreign_keys="Pipe.source_node_id", back_populates="source_node")
    target_pipes = relationship("Pipe", foreign_keys="Pipe.target_node_id", back_populates="target_node")

class Pipe(Base):
    __tablename__ = "pipes"
    
    id = Column(String, primary_key=True, index=True)
    source_node_id = Column(String, ForeignKey("pipe_nodes.id"), nullable=False)
    target_node_id = Column(String, ForeignKey("pipe_nodes.id"), nullable=False)
    length = Column(Float, nullable=False)  # in meters
    diameter = Column(Float, nullable=False)  # in mm
    material = Column(String, nullable=False)  # steel, pvc, concrete, etc.
    flow_capacity = Column(Float, nullable=False)  # max flow in L/min
    current_flow = Column(Float, default=0.0)  # current flow in L/min
    pressure_loss = Column(Float, default=0.0)  # pressure loss across pipe
    installation_date = Column(DateTime, nullable=True)
    last_inspection = Column(DateTime, nullable=True)
    status = Column(String, default="operational")  # operational, maintenance, damaged
    
    # Relationships
    source_node = relationship("PipeNode", foreign_keys=[source_node_id], back_populates="source_pipes")
    target_node = relationship("PipeNode", foreign_keys=[target_node_id], back_populates="target_pipes")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entity_type = Column(String, nullable=False)  # pipe or node
    entity_id = Column(String, nullable=False)
    scheduled_date = Column(DateTime, nullable=False)
    performed_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, in_progress, completed, cancelled
    maintenance_type = Column(String, nullable=True)  # inspection, repair, replacement, cleaning
    technician = Column(String, nullable=True)
    cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String, ForeignKey("pipe_nodes.id"), nullable=False)
    pressure = Column(Float, nullable=True)
    flow_rate = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=func.now())
    
    # Relationship
    node = relationship("PipeNode")

class LeakAlert(Base):
    __tablename__ = "leak_alerts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    entity_type = Column(String, nullable=False)  # pipe or node
    entity_id = Column(String, nullable=False)
    alert_type = Column(String, nullable=False)  # pressure_drop, flow_anomaly, sensor_offline
    severity = Column(String, default="medium")  # low, medium, high, critical
    description = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False)
    detected_at = Column(DateTime, default=func.now())
    resolved_at = Column(DateTime, nullable=True)