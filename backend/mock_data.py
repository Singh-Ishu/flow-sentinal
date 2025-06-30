from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
from mock_data_nodes_snippet import generated_nodes_data


from models import PipeNode, Pipe, MaintenanceLog, SensorReading, LeakAlert

def populate_mock_data(db: Session):
    """Populate database with realistic mock data for pipeline monitoring"""
    
    # Clear existing data
    db.query(LeakAlert).delete()
    db.query(SensorReading).delete()
    db.query(MaintenanceLog).delete()
    db.query(Pipe).delete()
    db.query(PipeNode).delete()
    db.commit()
    
    # Create pipe nodes (pumps, valves, sensors, junctions)
    nodes_data = [
        {
            "id": "NODE-001",
            "name": "Main Pump Station",
            "type": "pump",
            "pressure": 3.2,
            "max_pressure": 4.0,
            "flow_rate": 1500.0,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "status": "active"
        },
        {
            "id": "NODE-002", 
            "name": "Distribution Junction A",
            "type": "junction",
            "pressure": 2.8,
            "max_pressure": 3.5,
            "flow_rate": 1200.0,
            "latitude": 28.6289,
            "longitude": 77.2190,
            "status": "active"
        },
        {
            "id": "NODE-003",
            "name": "Pressure Sensor Alpha",
            "type": "sensor",
            "pressure": 2.1,
            "max_pressure": 3.0,
            "flow_rate": 800.0,
            "latitude": 28.6439,
            "longitude": 77.2290,
            "status": "active"
        },
        {
            "id": "NODE-004",
            "name": "Control Valve B1",
            "type": "valve",
            "pressure": 1.9,
            "max_pressure": 2.5,
            "flow_rate": 600.0,
            "latitude": 28.6589,
            "longitude": 77.2390,
            "status": "demand"
        },
        {
            "id": "NODE-005",
            "name": "Emergency Shutoff",
            "type": "valve",
            "pressure": 0.0,
            "max_pressure": 3.0,
            "flow_rate": 0.0,
            "latitude": 28.6739,
            "longitude": 77.2490,
            "status": "offline"
        },
        {
            "id": "NODE-006",
            "name": "Distribution Point C",
            "type": "junction",
            "pressure": 1.8,
            "max_pressure": 2.5,
            "flow_rate": 400.0,
            "latitude": 28.6889,
            "longitude": 77.2590,
            "status": "active"
        },
        {
            "id": "NODE-007",
            "name": "Leak Detection Sensor",
            "type": "sensor",
            "pressure": 1.2,
            "max_pressure": 2.0,
            "flow_rate": 200.0,
            "latitude": 28.7039,
            "longitude": 77.2690,
            "status": "leak"
        }
    ] +generated_nodes_data
    
    # Create nodes
    for node_data in nodes_data:
        node = PipeNode(**node_data)
        db.add(node)
    
    db.commit()
    
    # Create pipes connecting the nodes
    pipes_data = [
        {
            "id": "PIPE-001",
            "source_node_id": "NODE-001",
            "target_node_id": "NODE-002",
            "length": 2500.0,
            "diameter": 300.0,
            "material": "steel",
            "flow_capacity": 1500.0,
            "current_flow": 1200.0,
            "pressure_loss": 0.4,
            "installation_date": datetime(2020, 3, 15),
            "last_inspection": datetime(2024, 1, 10),
            "status": "operational"
        },
        {
            "id": "PIPE-002",
            "source_node_id": "NODE-002",
            "target_node_id": "NODE-003",
            "length": 1800.0,
            "diameter": 250.0,
            "material": "steel",
            "flow_capacity": 1200.0,
            "current_flow": 800.0,
            "pressure_loss": 0.7,
            "installation_date": datetime(2019, 8, 22),
            "last_inspection": datetime(2023, 11, 5),
            "status": "operational"
        },
        {
            "id": "PIPE-003",
            "source_node_id": "NODE-003",
            "target_node_id": "NODE-004",
            "length": 1200.0,
            "diameter": 200.0,
            "material": "pvc",
            "flow_capacity": 800.0,
            "current_flow": 600.0,
            "pressure_loss": 0.2,
            "installation_date": datetime(2021, 6, 10),
            "last_inspection": datetime(2024, 2, 20),
            "status": "operational"
        },
        {
            "id": "PIPE-004",
            "source_node_id": "NODE-002",
            "target_node_id": "NODE-005",
            "length": 800.0,
            "diameter": 150.0,
            "material": "steel",
            "flow_capacity": 500.0,
            "current_flow": 0.0,
            "pressure_loss": 0.0,
            "installation_date": datetime(2018, 12, 5),
            "last_inspection": datetime(2023, 9, 15),
            "status": "maintenance"
        },
        {
            "id": "PIPE-005",
            "source_node_id": "NODE-004",
            "target_node_id": "NODE-006",
            "length": 1500.0,
            "diameter": 180.0,
            "material": "concrete",
            "flow_capacity": 600.0,
            "current_flow": 400.0,
            "pressure_loss": 0.1,
            "installation_date": datetime(2017, 4, 18),
            "last_inspection": datetime(2023, 12, 8),
            "status": "operational"
        },
        {
            "id": "PIPE-006",
            "source_node_id": "NODE-006",
            "target_node_id": "NODE-007",
            "length": 900.0,
            "diameter": 120.0,
            "material": "pvc",
            "flow_capacity": 400.0,
            "current_flow": 200.0,
            "pressure_loss": 0.6,
            "installation_date": datetime(2022, 1, 25),
            "last_inspection": datetime(2024, 3, 12),
            "status": "damaged"
        }
    ]
    
    # Create pipes
    for pipe_data in pipes_data:
        pipe = Pipe(**pipe_data)
        db.add(pipe)
    
    db.commit()
    
    # Create maintenance logs
    maintenance_data = [
        {
            "entity_type": "pipe",
            "entity_id": "PIPE-001",
            "scheduled_date": datetime(2024, 6, 15),
            "notes": "Routine pressure testing and valve inspection",
            "status": "scheduled",
            "maintenance_type": "inspection",
            "technician": "John Smith",
            "cost": 1500.0
        },
        {
            "entity_type": "pipe",
            "entity_id": "PIPE-002",
            "scheduled_date": datetime(2024, 5, 20),
            "performed_date": datetime(2024, 5, 22),
            "notes": "Replaced corroded section near junction",
            "status": "completed",
            "maintenance_type": "repair",
            "technician": "Sarah Johnson",
            "cost": 3200.0
        },
        {
            "entity_type": "node",
            "entity_id": "NODE-001",
            "scheduled_date": datetime(2024, 7, 1),
            "notes": "Pump motor maintenance and calibration",
            "status": "scheduled",
            "maintenance_type": "maintenance",
            "technician": "Mike Wilson",
            "cost": 2800.0
        },
        {
            "entity_type": "pipe",
            "entity_id": "PIPE-004",
            "scheduled_date": datetime(2024, 4, 10),
            "performed_date": datetime(2024, 4, 12),
            "notes": "Emergency valve replacement due to failure",
            "status": "completed",
            "maintenance_type": "replacement",
            "technician": "David Brown",
            "cost": 4500.0
        },
        {
            "entity_type": "node",
            "entity_id": "NODE-007",
            "scheduled_date": datetime(2024, 6, 25),
            "notes": "Leak detection sensor recalibration",
            "status": "in_progress",
            "maintenance_type": "maintenance",
            "technician": "Lisa Davis",
            "cost": 800.0
        }
    ]
    
    # Create maintenance logs
    for maintenance in maintenance_data:
        log = MaintenanceLog(**maintenance)
        db.add(log)
    
    db.commit()
    
    # Create sensor readings (historical data)
    base_time = datetime.now() - timedelta(hours=24)
    
    for node_id in ["NODE-001", "NODE-002", "NODE-003", "NODE-004", "NODE-006", "NODE-007"]:
        for i in range(24):  # 24 hours of hourly readings
            timestamp = base_time + timedelta(hours=i)
            
            # Simulate realistic sensor data with some variation
            base_pressure = {
                "NODE-001": 3.2,
                "NODE-002": 2.8,
                "NODE-003": 2.1,
                "NODE-004": 1.9,
                "NODE-006": 1.8,
                "NODE-007": 1.2
            }.get(node_id, 2.0)
            
            base_flow = {
                "NODE-001": 1500.0,
                "NODE-002": 1200.0,
                "NODE-003": 800.0,
                "NODE-004": 600.0,
                "NODE-006": 400.0,
                "NODE-007": 200.0
            }.get(node_id, 500.0)
            
            # Add some realistic variation
            pressure_variation = random.uniform(-0.2, 0.2)
            flow_variation = random.uniform(-50.0, 50.0)
            
            reading = SensorReading(
                node_id=node_id,
                pressure=base_pressure + pressure_variation,
                flow_rate=base_flow + flow_variation,
                temperature=random.uniform(15.0, 25.0),
                timestamp=timestamp
            )
            db.add(reading)
    
    db.commit()
    
    # Create leak alerts
    alerts_data = [
        {
            "entity_type": "pipe",
            "entity_id": "PIPE-006",
            "alert_type": "pressure_drop",
            "severity": "high",
            "description": "Significant pressure drop detected in PIPE-006, possible leak near NODE-007",
            "is_resolved": False,
            "detected_at": datetime.now() - timedelta(hours=2)
        },
        {
            "entity_type": "node",
            "entity_id": "NODE-005",
            "alert_type": "sensor_offline",
            "severity": "medium",
            "description": "NODE-005 has been offline for extended period",
            "is_resolved": False,
            "detected_at": datetime.now() - timedelta(hours=6)
        },
        {
            "entity_type": "pipe",
            "entity_id": "PIPE-002",
            "alert_type": "flow_anomaly",
            "severity": "low",
            "description": "Minor flow irregularity detected, monitoring situation",
            "is_resolved": True,
            "detected_at": datetime.now() - timedelta(days=1),
            "resolved_at": datetime.now() - timedelta(hours=18)
        }
    ]
    
    # Create leak alerts
    for alert_data in alerts_data:
        alert = LeakAlert(**alert_data)
        db.add(alert)
    
    db.commit()
    
    print("Mock data populated successfully!")
    print(f"Created {len(nodes_data)} nodes, {len(pipes_data)} pipes, {len(maintenance_data)} maintenance logs")
    print("Added 24 hours of sensor readings and leak alerts")