from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import math

from models import PipeNode, Pipe, MaintenanceLog, SensorReading, LeakAlert

# Major cities across India with their coordinates
INDIAN_CITIES = [
    # North India
    {"name": "New Delhi", "lat": 28.6139, "lng": 77.2090},
    {"name": "Gurgaon", "lat": 28.4595, "lng": 77.0266},
    {"name": "Noida", "lat": 28.5355, "lng": 77.3910},
    {"name": "Chandigarh", "lat": 30.7333, "lng": 76.7794},
    {"name": "Amritsar", "lat": 31.6340, "lng": 74.8723},
    {"name": "Jaipur", "lat": 26.9124, "lng": 75.7873},
    {"name": "Jodhpur", "lat": 26.2389, "lng": 73.0243},
    {"name": "Udaipur", "lat": 24.5854, "lng": 73.7125},
    {"name": "Agra", "lat": 27.1767, "lng": 78.0081},
    {"name": "Lucknow", "lat": 26.8467, "lng": 80.9462},
    {"name": "Kanpur", "lat": 26.4499, "lng": 80.3319},
    {"name": "Varanasi", "lat": 25.3176, "lng": 82.9739},
    {"name": "Allahabad", "lat": 25.4358, "lng": 81.8463},
    
    # West India
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
    {"name": "Pune", "lat": 18.5204, "lng": 73.8567},
    {"name": "Nashik", "lat": 19.9975, "lng": 73.7898},
    {"name": "Nagpur", "lat": 21.1458, "lng": 79.0882},
    {"name": "Aurangabad", "lat": 19.8762, "lng": 75.3433},
    {"name": "Ahmedabad", "lat": 23.0225, "lng": 72.5714},
    {"name": "Surat", "lat": 21.1702, "lng": 72.8311},
    {"name": "Vadodara", "lat": 22.3072, "lng": 73.1812},
    {"name": "Rajkot", "lat": 22.3039, "lng": 70.8022},
    {"name": "Gandhinagar", "lat": 23.2156, "lng": 72.6369},
    
    # South India
    {"name": "Bangalore", "lat": 12.9716, "lng": 77.5946},
    {"name": "Chennai", "lat": 13.0827, "lng": 80.2707},
    {"name": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
    {"name": "Kochi", "lat": 9.9312, "lng": 76.2673},
    {"name": "Thiruvananthapuram", "lat": 8.5241, "lng": 76.9366},
    {"name": "Coimbatore", "lat": 11.0168, "lng": 76.9558},
    {"name": "Madurai", "lat": 9.9252, "lng": 78.1198},
    {"name": "Mysore", "lat": 12.2958, "lng": 76.6394},
    {"name": "Mangalore", "lat": 12.9141, "lng": 74.8560},
    {"name": "Vijayawada", "lat": 16.5062, "lng": 80.6480},
    {"name": "Visakhapatnam", "lat": 17.6868, "lng": 83.2185},
    {"name": "Tirupati", "lat": 13.6288, "lng": 79.4192},
    
    # East India
    {"name": "Kolkata", "lat": 22.5726, "lng": 88.3639},
    {"name": "Bhubaneswar", "lat": 20.2961, "lng": 85.8245},
    {"name": "Cuttack", "lat": 20.4625, "lng": 85.8828},
    {"name": "Guwahati", "lat": 26.1445, "lng": 91.7362},
    {"name": "Shillong", "lat": 25.5788, "lng": 91.8933},
    {"name": "Imphal", "lat": 24.8170, "lng": 93.9368},
    {"name": "Agartala", "lat": 23.8315, "lng": 91.2868},
    {"name": "Aizawl", "lat": 23.1645, "lng": 92.9376},
    {"name": "Kohima", "lat": 25.6751, "lng": 94.1086},
    {"name": "Itanagar", "lat": 27.0844, "lng": 93.6053},
    
    # Central India
    {"name": "Bhopal", "lat": 23.2599, "lng": 77.4126},
    {"name": "Indore", "lat": 22.7196, "lng": 75.8577},
    {"name": "Jabalpur", "lat": 23.1815, "lng": 79.9864},
    {"name": "Gwalior", "lat": 26.2183, "lng": 78.1828},
    {"name": "Raipur", "lat": 21.2514, "lng": 81.6296},
    {"name": "Bilaspur", "lat": 22.0797, "lng": 82.1409},
    {"name": "Ranchi", "lat": 23.3441, "lng": 85.3096},
    {"name": "Jamshedpur", "lat": 22.8046, "lng": 86.2029},
    {"name": "Dhanbad", "lat": 23.7957, "lng": 86.4304},
    {"name": "Patna", "lat": 25.5941, "lng": 85.1376},
    {"name": "Muzaffarpur", "lat": 26.1209, "lng": 85.3647},
    {"name": "Gaya", "lat": 24.7914, "lng": 85.0002},
]

def generate_coordinates_around_city(city, radius_km=50, count=10):
    """Generate random coordinates around a city within specified radius"""
    coordinates = []
    for _ in range(count):
        # Convert radius from km to degrees (approximate)
        radius_deg = radius_km / 111.0  # 1 degree ≈ 111 km
        
        # Generate random angle and distance
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(0, radius_deg)
        
        # Calculate new coordinates
        lat = city["lat"] + distance * math.cos(angle)
        lng = city["lng"] + distance * math.sin(angle)
        
        coordinates.append({"lat": lat, "lng": lng})
    
    return coordinates

def populate_mock_data(db: Session):
    """Populate database with extensive mock data across India"""
    
    print("Starting mock data population...")
    
    # Clear existing data
    db.query(LeakAlert).delete()
    db.query(SensorReading).delete()
    db.query(MaintenanceLog).delete()
    db.query(Pipe).delete()
    db.query(PipeNode).delete()
    db.commit()
    print("Cleared existing data")
    
    # Generate nodes across all major cities
    all_nodes = []
    node_counter = 1
    
    node_types = ["pump", "valve", "sensor", "junction"]
    node_type_weights = [0.15, 0.25, 0.35, 0.25]  # More sensors and valves
    
    statuses = ["active", "offline", "unreported", "demand", "leak"]
    status_weights = [0.7, 0.1, 0.05, 0.1, 0.05]  # Mostly active
    
    materials = ["steel", "pvc", "concrete", "cast_iron"]
    
    for city in INDIAN_CITIES:
        # Generate 8-15 nodes per city
        nodes_per_city = random.randint(8, 15)
        city_coordinates = generate_coordinates_around_city(city, radius_km=30, count=nodes_per_city)
        
        for i, coord in enumerate(city_coordinates):
            node_type = random.choices(node_types, weights=node_type_weights)[0]
            status = random.choices(statuses, weights=status_weights)[0]
            
            # Generate realistic pressure and flow based on node type
            if node_type == "pump":
                base_pressure = random.uniform(3.0, 4.5)
                max_pressure = base_pressure + random.uniform(0.5, 1.0)
                flow_rate = random.uniform(1200, 2000)
            elif node_type == "junction":
                base_pressure = random.uniform(2.0, 3.5)
                max_pressure = base_pressure + random.uniform(0.3, 0.8)
                flow_rate = random.uniform(800, 1500)
            elif node_type == "valve":
                base_pressure = random.uniform(1.5, 3.0)
                max_pressure = base_pressure + random.uniform(0.2, 0.6)
                flow_rate = random.uniform(400, 1200)
            else:  # sensor
                base_pressure = random.uniform(1.0, 2.5)
                max_pressure = base_pressure + random.uniform(0.2, 0.5)
                flow_rate = random.uniform(200, 800)
            
            # Adjust values based on status
            if status == "offline":
                base_pressure = 0.0
                flow_rate = 0.0
            elif status == "demand":
                base_pressure *= 0.7
                flow_rate *= 1.2
            elif status == "leak":
                base_pressure *= 0.5
                flow_rate *= 0.6
            
            node_data = {
                "id": f"NODE-{node_counter:04d}",
                "name": f"{city['name']} {node_type.title()} {i+1}",
                "type": node_type,
                "pressure": round(base_pressure, 2) if status != "offline" else 0.0,
                "max_pressure": round(max_pressure, 2),
                "flow_rate": round(flow_rate, 1),
                "latitude": coord["lat"],
                "longitude": coord["lng"],
                "status": status
            }
            
            all_nodes.append(node_data)
            node_counter += 1
    
    # Create nodes in database
    for node_data in all_nodes:
        node = PipeNode(**node_data)
        db.add(node)
    
    db.commit()
    print(f"Created {len(all_nodes)} nodes across {len(INDIAN_CITIES)} cities")
    
    # Generate pipes connecting nearby nodes
    all_pipes = []
    pipe_counter = 1
    
    # Group nodes by city for better connectivity
    nodes_by_city = {}
    node_index = 0
    for city in INDIAN_CITIES:
        nodes_per_city = random.randint(8, 15)
        city_nodes = all_nodes[node_index:node_index + nodes_per_city]
        nodes_by_city[city["name"]] = city_nodes
        node_index += nodes_per_city
        if node_index >= len(all_nodes):
            break
    
    for city_name, city_nodes in nodes_by_city.items():
        if len(city_nodes) < 2:
            continue
            
        # Create connections within each city
        for i in range(len(city_nodes) - 1):
            source_node = city_nodes[i]
            target_node = city_nodes[i + 1]
            
            # Calculate distance between nodes
            lat_diff = abs(source_node["latitude"] - target_node["latitude"])
            lng_diff = abs(source_node["longitude"] - target_node["longitude"])
            distance_km = math.sqrt(lat_diff**2 + lng_diff**2) * 111  # Approximate km
            
            # Generate pipe specifications
            material = random.choice(materials)
            diameter = random.choice([150, 200, 250, 300, 400, 500])
            length = max(500, distance_km * 1000 + random.uniform(-200, 500))  # meters
            
            # Flow capacity based on diameter
            flow_capacity = (diameter / 100) ** 2 * random.uniform(800, 1200)
            current_flow = flow_capacity * random.uniform(0.3, 0.9)
            
            # Pressure loss based on length and flow
            pressure_loss = (length / 1000) * (current_flow / flow_capacity) * random.uniform(0.1, 0.3)
            
            # Status based on connected nodes
            if source_node["status"] == "offline" or target_node["status"] == "offline":
                pipe_status = "maintenance"
                current_flow = 0
            elif source_node["status"] == "leak" or target_node["status"] == "leak":
                pipe_status = "damaged"
                current_flow *= 0.5
            else:
                pipe_status = random.choices(
                    ["operational", "maintenance", "damaged"],
                    weights=[0.85, 0.1, 0.05]
                )[0]
            
            pipe_data = {
                "id": f"PIPE-{pipe_counter:04d}",
                "source_node_id": source_node["id"],
                "target_node_id": target_node["id"],
                "length": round(length, 1),
                "diameter": diameter,
                "material": material,
                "flow_capacity": round(flow_capacity, 1),
                "current_flow": round(current_flow, 1),
                "pressure_loss": round(pressure_loss, 2),
                "installation_date": datetime.now() - timedelta(days=random.randint(365, 3650)),
                "last_inspection": datetime.now() - timedelta(days=random.randint(30, 730)),
                "status": pipe_status
            }
            
            all_pipes.append(pipe_data)
            pipe_counter += 1
        
        # Add some random connections within the city
        for _ in range(random.randint(1, 3)):
            if len(city_nodes) >= 3:
                source_idx = random.randint(0, len(city_nodes) - 1)
                target_idx = random.randint(0, len(city_nodes) - 1)
                
                if source_idx != target_idx:
                    source_node = city_nodes[source_idx]
                    target_node = city_nodes[target_idx]
                    
                    # Skip if connection already exists
                    existing = any(
                        (p["source_node_id"] == source_node["id"] and p["target_node_id"] == target_node["id"]) or
                        (p["source_node_id"] == target_node["id"] and p["target_node_id"] == source_node["id"])
                        for p in all_pipes
                    )
                    
                    if not existing:
                        lat_diff = abs(source_node["latitude"] - target_node["latitude"])
                        lng_diff = abs(source_node["longitude"] - target_node["longitude"])
                        distance_km = math.sqrt(lat_diff**2 + lng_diff**2) * 111
                        
                        material = random.choice(materials)
                        diameter = random.choice([150, 200, 250, 300])
                        length = max(300, distance_km * 1000 + random.uniform(-100, 300))
                        
                        flow_capacity = (diameter / 100) ** 2 * random.uniform(600, 1000)
                        current_flow = flow_capacity * random.uniform(0.2, 0.8)
                        pressure_loss = (length / 1000) * (current_flow / flow_capacity) * random.uniform(0.05, 0.25)
                        
                        pipe_data = {
                            "id": f"PIPE-{pipe_counter:04d}",
                            "source_node_id": source_node["id"],
                            "target_node_id": target_node["id"],
                            "length": round(length, 1),
                            "diameter": diameter,
                            "material": material,
                            "flow_capacity": round(flow_capacity, 1),
                            "current_flow": round(current_flow, 1),
                            "pressure_loss": round(pressure_loss, 2),
                            "installation_date": datetime.now() - timedelta(days=random.randint(365, 3650)),
                            "last_inspection": datetime.now() - timedelta(days=random.randint(30, 730)),
                            "status": "operational"
                        }
                        
                        all_pipes.append(pipe_data)
                        pipe_counter += 1
    
    # Add some inter-city connections (major pipelines)
    major_cities = ["New Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"]
    for i in range(len(major_cities) - 1):
        city1_nodes = nodes_by_city.get(major_cities[i], [])
        city2_nodes = nodes_by_city.get(major_cities[i + 1], [])
        
        if city1_nodes and city2_nodes:
            # Connect main pumps/junctions between cities
            source_node = next((n for n in city1_nodes if n["type"] in ["pump", "junction"]), city1_nodes[0])
            target_node = next((n for n in city2_nodes if n["type"] in ["pump", "junction"]), city2_nodes[0])
            
            lat_diff = abs(source_node["latitude"] - target_node["latitude"])
            lng_diff = abs(source_node["longitude"] - target_node["longitude"])
            distance_km = math.sqrt(lat_diff**2 + lng_diff**2) * 111
            
            pipe_data = {
                "id": f"PIPE-{pipe_counter:04d}",
                "source_node_id": source_node["id"],
                "target_node_id": target_node["id"],
                "length": round(distance_km * 1000, 1),
                "diameter": random.choice([500, 600, 800]),  # Larger for inter-city
                "material": "steel",
                "flow_capacity": random.uniform(2000, 4000),
                "current_flow": random.uniform(1500, 3000),
                "pressure_loss": round(distance_km * 0.01, 2),
                "installation_date": datetime.now() - timedelta(days=random.randint(1825, 7300)),
                "last_inspection": datetime.now() - timedelta(days=random.randint(90, 365)),
                "status": "operational"
            }
            
            all_pipes.append(pipe_data)
            pipe_counter += 1
    
    # Create pipes in database
    for pipe_data in all_pipes:
        pipe = Pipe(**pipe_data)
        db.add(pipe)
    
    db.commit()
    print(f"Created {len(all_pipes)} pipes connecting the nodes")
    
    # Generate maintenance logs for random components
    maintenance_data = []
    maintenance_types = ["inspection", "repair", "replacement", "cleaning", "calibration"]
    technicians = ["John Smith", "Sarah Johnson", "Mike Wilson", "David Brown", "Lisa Davis", 
                  "Raj Patel", "Priya Sharma", "Amit Kumar", "Sneha Reddy", "Vikram Singh"]
    
    # Generate maintenance for random pipes
    sample_pipes = random.sample(all_pipes, min(50, len(all_pipes)))
    for pipe in sample_pipes:
        maintenance_data.append({
            "entity_type": "pipe",
            "entity_id": pipe["id"],
            "scheduled_date": datetime.now() + timedelta(days=random.randint(-30, 180)),
            "performed_date": datetime.now() - timedelta(days=random.randint(1, 30)) if random.random() < 0.3 else None,
            "notes": f"Routine {random.choice(maintenance_types)} for {pipe['material']} pipe",
            "status": random.choice(["scheduled", "in_progress", "completed"]),
            "maintenance_type": random.choice(maintenance_types),
            "technician": random.choice(technicians),
            "cost": random.uniform(800, 5000)
        })
    
    # Generate maintenance for random nodes
    sample_nodes = random.sample(all_nodes, min(30, len(all_nodes)))
    for node in sample_nodes:
        maintenance_data.append({
            "entity_type": "node",
            "entity_id": node["id"],
            "scheduled_date": datetime.now() + timedelta(days=random.randint(-15, 120)),
            "performed_date": datetime.now() - timedelta(days=random.randint(1, 20)) if random.random() < 0.4 else None,
            "notes": f"{node['type'].title()} {random.choice(maintenance_types)} and testing",
            "status": random.choice(["scheduled", "in_progress", "completed"]),
            "maintenance_type": random.choice(maintenance_types),
            "technician": random.choice(technicians),
            "cost": random.uniform(500, 3000)
        })
    
    # Create maintenance logs
    for maintenance in maintenance_data:
        log = MaintenanceLog(**maintenance)
        db.add(log)
    
    db.commit()
    
    # Generate sensor readings for a sample of nodes
    base_time = datetime.now() - timedelta(hours=24)
    sample_sensor_nodes = [n for n in all_nodes if n["status"] in ["active", "demand", "leak"]][:50]
    
    for node in sample_sensor_nodes:
        for i in range(24):  # 24 hours of hourly readings
            timestamp = base_time + timedelta(hours=i)
            
            # Add realistic variation to sensor data
            pressure_variation = random.uniform(-0.1, 0.1)
            flow_variation = random.uniform(-30.0, 30.0)
            
            reading = SensorReading(
                node_id=node["id"],
                pressure=max(0, node["pressure"] + pressure_variation) if node["pressure"] > 0 else 0,
                flow_rate=max(0, node["flow_rate"] + flow_variation) if node["flow_rate"] > 0 else 0,
                temperature=random.uniform(15.0, 35.0),
                timestamp=timestamp
            )
            db.add(reading)
    
    db.commit()
    
    # Generate some leak alerts
    alerts_data = []
    problem_nodes = [n for n in all_nodes if n["status"] in ["leak", "offline"]][:10]
    problem_pipes = [p for p in all_pipes if p["status"] in ["damaged", "maintenance"]][:8]
    
    for node in problem_nodes:
        alerts_data.append({
            "entity_type": "node",
            "entity_id": node["id"],
            "alert_type": "pressure_drop" if node["status"] == "leak" else "sensor_offline",
            "severity": "high" if node["status"] == "leak" else "medium",
            "description": f"Alert detected at {node['name']} - {node['status']} status",
            "is_resolved": random.random() < 0.3,
            "detected_at": datetime.now() - timedelta(hours=random.randint(1, 48))
        })
    
    for pipe in problem_pipes:
        alerts_data.append({
            "entity_type": "pipe",
            "entity_id": pipe["id"],
            "alert_type": "flow_anomaly" if pipe["status"] == "damaged" else "maintenance_required",
            "severity": "high" if pipe["status"] == "damaged" else "low",
            "description": f"Issue detected in {pipe['id']} - {pipe['status']} status",
            "is_resolved": random.random() < 0.4,
            "detected_at": datetime.now() - timedelta(hours=random.randint(1, 72))
        })
    
    # Create leak alerts
    for alert_data in alerts_data:
        alert = LeakAlert(**alert_data)
        if random.random() < 0.3 and not alert.is_resolved:
            alert.is_resolved = True
            alert.resolved_at = datetime.now() - timedelta(hours=random.randint(1, 24))
        db.add(alert)
    
    db.commit()
    
    print("Mock data populated successfully!")
    print(f"Created {len(all_nodes)} nodes across {len(INDIAN_CITIES)} cities")
    print(f"Created {len(all_pipes)} pipes connecting the nodes")
    print(f"Added {len(maintenance_data)} maintenance logs")
    print(f"Added sensor readings for {len(sample_sensor_nodes)} nodes")
    print(f"Created {len(alerts_data)} leak alerts")