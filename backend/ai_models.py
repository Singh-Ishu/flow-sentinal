"""
AI/ML Models for Flow-Sentinel
This module contains placeholder functions for AI models that can be integrated later.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import random

class LeakDetectionModel:
    """
    Placeholder for ML model that predicts leak probability based on sensor data
    """
    
    def __init__(self):
        self.model = None  # Placeholder for actual ML model
        self.is_trained = False
    
    def predict_leak_probability(self, pipe_data: Dict) -> Dict:
        """
        Predict leak probability for a given pipe
        
        Args:
            pipe_data: Dictionary containing pipe information and sensor readings
            
        Returns:
            Dictionary with prediction results
        """
        # Placeholder implementation - replace with actual ML model
        
        # Simulate feature extraction
        features = self._extract_features(pipe_data)
        
        # Simulate model prediction
        probability = self._simulate_prediction(features)
        
        risk_level = self._categorize_risk(probability)
        
        return {
            "leak_probability": probability,
            "risk_level": risk_level,
            "confidence": random.uniform(0.7, 0.95),
            "contributing_factors": self._identify_factors(features),
            "recommendation": self._generate_recommendation(risk_level)
        }
    
    def _extract_features(self, pipe_data: Dict) -> np.ndarray:
        """Extract features from pipe data for ML model"""
        # Placeholder feature extraction
        features = []
        
        # Age of pipe (years)
        if pipe_data.get('installation_date'):
            age = (datetime.now() - pipe_data['installation_date']).days / 365.25
            features.append(age)
        else:
            features.append(10.0)  # Default age
        
        # Pressure ratio (current/max)
        pressure_ratio = pipe_data.get('current_pressure', 2.0) / pipe_data.get('max_pressure', 3.0)
        features.append(pressure_ratio)
        
        # Flow ratio (current/capacity)
        flow_ratio = pipe_data.get('current_flow', 500) / pipe_data.get('flow_capacity', 1000)
        features.append(flow_ratio)
        
        # Material factor (encoded)
        material_factor = {
            'steel': 0.8,
            'pvc': 0.6,
            'concrete': 0.9,
            'cast_iron': 1.0
        }.get(pipe_data.get('material', 'steel'), 0.8)
        features.append(material_factor)
        
        # Diameter (normalized)
        diameter = pipe_data.get('diameter', 200) / 1000.0  # Convert to meters
        features.append(diameter)
        
        return np.array(features)
    
    def _simulate_prediction(self, features: np.ndarray) -> float:
        """Simulate ML model prediction"""
        # Simple heuristic-based simulation
        age_factor = min(features[0] / 20.0, 1.0)  # Age impact
        pressure_factor = abs(features[1] - 0.7)  # Optimal pressure ratio is ~0.7
        flow_factor = abs(features[2] - 0.6)  # Optimal flow ratio is ~0.6
        material_factor = features[3]
        
        # Combine factors with weights
        risk_score = (
            age_factor * 0.3 +
            pressure_factor * 0.25 +
            flow_factor * 0.25 +
            material_factor * 0.2
        )
        
        # Add some randomness
        risk_score += random.uniform(-0.1, 0.1)
        
        return max(0.0, min(1.0, risk_score))
    
    def _categorize_risk(self, probability: float) -> str:
        """Categorize risk level based on probability"""
        if probability < 0.3:
            return "low"
        elif probability < 0.6:
            return "medium"
        elif probability < 0.8:
            return "high"
        else:
            return "critical"
    
    def _identify_factors(self, features: np.ndarray) -> List[str]:
        """Identify contributing factors to leak risk"""
        factors = []
        
        if features[0] > 15:  # Age > 15 years
            factors.append("Pipe age exceeds recommended lifespan")
        
        if features[1] > 0.9:  # High pressure ratio
            factors.append("Operating near maximum pressure")
        elif features[1] < 0.4:  # Low pressure ratio
            factors.append("Unusually low pressure detected")
        
        if features[2] > 0.8:  # High flow ratio
            factors.append("High flow rate stress")
        
        if features[3] > 0.9:  # High material factor (cast iron)
            factors.append("Material susceptible to corrosion")
        
        return factors if factors else ["Normal operating conditions"]
    
    def _generate_recommendation(self, risk_level: str) -> str:
        """Generate maintenance recommendation based on risk level"""
        recommendations = {
            "low": "Continue regular monitoring schedule",
            "medium": "Schedule inspection within 30 days",
            "high": "Priority inspection required within 7 days",
            "critical": "Immediate inspection and potential shutdown required"
        }
        return recommendations.get(risk_level, "Monitor closely")

class MaintenancePredictionModel:
    """
    Placeholder for ML model that predicts optimal maintenance timing
    """
    
    def __init__(self):
        self.model = None
        self.is_trained = False
    
    def predict_maintenance_window(self, entity_data: Dict) -> Dict:
        """
        Predict optimal maintenance timing for pipes or nodes
        
        Args:
            entity_data: Dictionary containing entity information and history
            
        Returns:
            Dictionary with maintenance predictions
        """
        # Simulate maintenance prediction
        current_date = datetime.now()
        
        # Base maintenance interval based on entity type and age
        base_interval = self._get_base_interval(entity_data)
        
        # Adjust based on usage and condition
        adjusted_interval = self._adjust_interval(entity_data, base_interval)
        
        next_maintenance = current_date + timedelta(days=adjusted_interval)
        
        priority = self._calculate_priority(entity_data, adjusted_interval)
        
        return {
            "next_maintenance_date": next_maintenance,
            "days_until_maintenance": adjusted_interval,
            "priority": priority,
            "maintenance_type": self._recommend_maintenance_type(entity_data),
            "estimated_cost": self._estimate_cost(entity_data),
            "risk_if_delayed": self._assess_delay_risk(entity_data)
        }
    
    def _get_base_interval(self, entity_data: Dict) -> int:
        """Get base maintenance interval in days"""
        entity_type = entity_data.get('type', 'pipe')
        material = entity_data.get('material', 'steel')
        
        # Base intervals by type and material
        intervals = {
            'pump': 90,
            'valve': 180,
            'sensor': 365,
            'junction': 730,
            'pipe': {
                'steel': 365,
                'pvc': 730,
                'concrete': 1095,
                'cast_iron': 180
            }
        }
        
        if entity_type == 'pipe':
            return intervals['pipe'].get(material, 365)
        else:
            return intervals.get(entity_type, 365)
    
    def _adjust_interval(self, entity_data: Dict, base_interval: int) -> int:
        """Adjust maintenance interval based on usage and condition"""
        adjustment_factor = 1.0
        
        # Age factor
        if entity_data.get('installation_date'):
            age = (datetime.now() - entity_data['installation_date']).days / 365.25
            if age > 10:
                adjustment_factor *= 0.8  # More frequent maintenance for older equipment
        
        # Usage factor
        if entity_data.get('current_flow') and entity_data.get('flow_capacity'):
            usage_ratio = entity_data['current_flow'] / entity_data['flow_capacity']
            if usage_ratio > 0.8:
                adjustment_factor *= 0.9  # More frequent for high usage
        
        # Condition factor
        status = entity_data.get('status', 'operational')
        if status in ['demand', 'maintenance']:
            adjustment_factor *= 0.7
        elif status == 'damaged':
            adjustment_factor *= 0.3
        
        return max(30, int(base_interval * adjustment_factor))
    
    def _calculate_priority(self, entity_data: Dict, days_until: int) -> str:
        """Calculate maintenance priority"""
        if days_until < 30:
            return "high"
        elif days_until < 90:
            return "medium"
        else:
            return "low"
    
    def _recommend_maintenance_type(self, entity_data: Dict) -> str:
        """Recommend type of maintenance needed"""
        entity_type = entity_data.get('type', 'pipe')
        status = entity_data.get('status', 'operational')
        
        if status == 'damaged':
            return "repair"
        elif status == 'maintenance':
            return "replacement"
        elif entity_type == 'pump':
            return "calibration"
        elif entity_type == 'valve':
            return "inspection"
        else:
            return "inspection"
    
    def _estimate_cost(self, entity_data: Dict) -> float:
        """Estimate maintenance cost"""
        base_costs = {
            'pump': 2500.0,
            'valve': 800.0,
            'sensor': 400.0,
            'junction': 1200.0,
            'pipe': 150.0  # per meter
        }
        
        entity_type = entity_data.get('type', 'pipe')
        base_cost = base_costs.get(entity_type, 500.0)
        
        if entity_type == 'pipe':
            length = entity_data.get('length', 1000.0)
            base_cost *= (length / 1000.0)  # Cost per km
        
        # Add variation
        return base_cost * random.uniform(0.8, 1.3)
    
    def _assess_delay_risk(self, entity_data: Dict) -> str:
        """Assess risk of delaying maintenance"""
        status = entity_data.get('status', 'operational')
        
        if status in ['damaged', 'offline']:
            return "high"
        elif status in ['demand', 'maintenance']:
            return "medium"
        else:
            return "low"

# Anomaly Detection Model
class AnomalyDetectionModel:
    """
    Placeholder for real-time anomaly detection in sensor data
    """
    
    def __init__(self):
        self.baseline_data = {}
        self.thresholds = {}
    
    def detect_anomalies(self, sensor_readings: List[Dict]) -> List[Dict]:
        """
        Detect anomalies in sensor readings
        
        Args:
            sensor_readings: List of sensor reading dictionaries
            
        Returns:
            List of detected anomalies
        """
        anomalies = []
        
        for reading in sensor_readings:
            node_id = reading.get('node_id')
            
            # Check for pressure anomalies
            if self._is_pressure_anomaly(reading):
                anomalies.append({
                    "type": "pressure_anomaly",
                    "node_id": node_id,
                    "severity": "medium",
                    "description": f"Unusual pressure reading: {reading.get('pressure')} bar",
                    "timestamp": reading.get('timestamp', datetime.now())
                })
            
            # Check for flow anomalies
            if self._is_flow_anomaly(reading):
                anomalies.append({
                    "type": "flow_anomaly",
                    "node_id": node_id,
                    "severity": "high",
                    "description": f"Abnormal flow rate: {reading.get('flow_rate')} L/min",
                    "timestamp": reading.get('timestamp', datetime.now())
                })
        
        return anomalies
    
    def _is_pressure_anomaly(self, reading: Dict) -> bool:
        """Check if pressure reading is anomalous"""
        pressure = reading.get('pressure')
        if pressure is None:
            return False
        
        # Simple threshold-based detection
        return pressure < 0.5 or pressure > 4.0
    
    def _is_flow_anomaly(self, reading: Dict) -> bool:
        """Check if flow reading is anomalous"""
        flow_rate = reading.get('flow_rate')
        if flow_rate is None:
            return False
        
        # Simple threshold-based detection
        return flow_rate < 0 or flow_rate > 2000