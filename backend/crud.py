from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime

from models import PipeNode, Pipe, MaintenanceLog, SensorReading, LeakAlert
from schemas import MaintenanceLogCreate, MaintenanceLogUpdate, SensorReadingCreate, LeakAlertCreate

# Pipe Node CRUD operations
def get_pipe_nodes(db: Session, skip: int = 0, limit: int = 100) -> List[PipeNode]:
    return db.query(PipeNode).offset(skip).limit(limit).all()

def get_pipe_node_by_id(db: Session, node_id: str) -> Optional[PipeNode]:
    return db.query(PipeNode).filter(PipeNode.id == node_id).first()

def create_pipe_node(db: Session, node_data: dict) -> PipeNode:
    db_node = PipeNode(**node_data)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

def update_pipe_node(db: Session, node_id: str, node_data: dict) -> Optional[PipeNode]:
    db_node = get_pipe_node_by_id(db, node_id)
    if db_node:
        for key, value in node_data.items():
            setattr(db_node, key, value)
        db.commit()
        db.refresh(db_node)
    return db_node

# Pipe CRUD operations
def get_pipes(db: Session, skip: int = 0, limit: int = 100) -> List[Pipe]:
    return db.query(Pipe).offset(skip).limit(limit).all()

def get_pipe_by_id(db: Session, pipe_id: str) -> Optional[Pipe]:
    return db.query(Pipe).filter(Pipe.id == pipe_id).first()

def create_pipe(db: Session, pipe_data: dict) -> Pipe:
    db_pipe = Pipe(**pipe_data)
    db.add(db_pipe)
    db.commit()
    db.refresh(db_pipe)
    return db_pipe

def update_pipe(db: Session, pipe_id: str, pipe_data: dict) -> Optional[Pipe]:
    db_pipe = get_pipe_by_id(db, pipe_id)
    if db_pipe:
        for key, value in pipe_data.items():
            setattr(db_pipe, key, value)
        db.commit()
        db.refresh(db_pipe)
    return db_pipe

# Maintenance Log CRUD operations
def get_maintenance_logs(db: Session, skip: int = 0, limit: int = 100) -> List[MaintenanceLog]:
    return db.query(MaintenanceLog).order_by(MaintenanceLog.scheduled_date.desc()).offset(skip).limit(limit).all()

def get_maintenance_log_by_id(db: Session, log_id: int) -> Optional[MaintenanceLog]:
    return db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()

def get_maintenance_logs_by_entity(db: Session, entity_type: str, entity_id: str) -> List[MaintenanceLog]:
    return db.query(MaintenanceLog).filter(
        and_(MaintenanceLog.entity_type == entity_type, MaintenanceLog.entity_id == entity_id)
    ).order_by(MaintenanceLog.scheduled_date.desc()).all()

def create_maintenance_log(db: Session, maintenance: MaintenanceLogCreate) -> MaintenanceLog:
    db_maintenance = MaintenanceLog(**maintenance.dict())
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

def update_maintenance_log(db: Session, log_id: int, maintenance: MaintenanceLogUpdate) -> Optional[MaintenanceLog]:
    db_maintenance = get_maintenance_log_by_id(db, log_id)
    if db_maintenance:
        update_data = maintenance.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_maintenance, key, value)
        db.commit()
        db.refresh(db_maintenance)
    return db_maintenance

def delete_maintenance_log(db: Session, log_id: int) -> bool:
    db_maintenance = get_maintenance_log_by_id(db, log_id)
    if db_maintenance:
        db.delete(db_maintenance)
        db.commit()
        return True
    return False

# Sensor Reading CRUD operations
def create_sensor_reading(db: Session, reading: SensorReadingCreate) -> SensorReading:
    db_reading = SensorReading(**reading.dict())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading

def get_sensor_readings_by_node(db: Session, node_id: str, limit: int = 100) -> List[SensorReading]:
    return db.query(SensorReading).filter(SensorReading.node_id == node_id).order_by(
        SensorReading.timestamp.desc()
    ).limit(limit).all()

def get_latest_sensor_reading(db: Session, node_id: str) -> Optional[SensorReading]:
    return db.query(SensorReading).filter(SensorReading.node_id == node_id).order_by(
        SensorReading.timestamp.desc()
    ).first()

# Leak Alert CRUD operations
def create_leak_alert(db: Session, alert: LeakAlertCreate) -> LeakAlert:
    db_alert = LeakAlert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_active_leak_alerts(db: Session) -> List[LeakAlert]:
    return db.query(LeakAlert).filter(LeakAlert.is_resolved == False).order_by(
        LeakAlert.detected_at.desc()
    ).all()

def resolve_leak_alert(db: Session, alert_id: int) -> Optional[LeakAlert]:
    db_alert = db.query(LeakAlert).filter(LeakAlert.id == alert_id).first()
    if db_alert:
        db_alert.is_resolved = True
        db_alert.resolved_at = datetime.now()
        db.commit()
        db.refresh(db_alert)
    return db_alert

def get_leak_alerts_by_entity(db: Session, entity_type: str, entity_id: str) -> List[LeakAlert]:
    return db.query(LeakAlert).filter(
        and_(LeakAlert.entity_type == entity_type, LeakAlert.entity_id == entity_id)
    ).order_by(LeakAlert.detected_at.desc()).all()