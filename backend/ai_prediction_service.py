import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Optional
import os

class MaintenancePredictionService:
    """Service to predict maintenance dates using the trained AI model"""
    
    def __init__(self):
        self.model = None
        self.model_path = os.path.join("..", "ai", "model", "regressor.pkl")
        self.load_model()
    
    def load_model(self):
        """Load the trained model"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print("AI maintenance prediction model loaded successfully")
            else:
                print(f"Model file not found at {self.model_path}")
                self.model = None
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    def predict_maintenance_date(self, pipe_data: Dict) -> Dict:
        """
        Predict next maintenance date for a pipe using the AI model
        
        Args:
            pipe_data: Dictionary containing pipe information
            
        Returns:
            Dictionary with prediction results
        """
        if not self.model:
            return self._fallback_prediction(pipe_data)
        
        try:
            # Prepare features for the model
            features = self._prepare_features(pipe_data)
            
            # Make prediction (returns days until next maintenance)
            days_until_maintenance = self.model.predict([features])[0]
            
            # Calculate the actual date
            next_maintenance_date = datetime.now() + timedelta(days=int(days_until_maintenance))
            
            # Determine priority based on days until maintenance
            priority = self._calculate_priority(days_until_maintenance)
            
            # Get confidence score (simplified)
            confidence = self._calculate_confidence(features, days_until_maintenance)
            
            return {
                "next_maintenance_date": next_maintenance_date.isoformat(),
                "days_until_maintenance": int(days_until_maintenance),
                "priority": priority,
                "confidence": confidence,
                "prediction_source": "ai_model",
                "maintenance_type": self._recommend_maintenance_type(pipe_data, days_until_maintenance),
                "estimated_cost": self._estimate_cost(pipe_data, days_until_maintenance),
                "factors": self._identify_key_factors(features, pipe_data)
            }
            
        except Exception as e:
            print(f"Error in AI prediction: {e}")
            return self._fallback_prediction(pipe_data)
    
    def _prepare_features(self, pipe_data: Dict) -> np.ndarray:
        """Prepare features for the AI model based on pipe data"""
        
        # Calculate age in years
        if pipe_data.get('installation_date'):
            if isinstance(pipe_data['installation_date'], str):
                installation_date = datetime.fromisoformat(pipe_data['installation_date'].replace('Z', '+00:00'))
            else:
                installation_date = pipe_data['installation_date']
            age_years = (datetime.now() - installation_date.replace(tzinfo=None)).days / 365.25
        else:
            age_years = 10.0  # Default age
        
        # Calculate utilization ratio
        utilization_ratio = 0.5  # Default
        if pipe_data.get('current_flow') and pipe_data.get('flow_capacity'):
            utilization_ratio = pipe_data['current_flow'] / pipe_data['flow_capacity']
        
        # Calculate days since last inspection
        days_since_inspection = 365  # Default
        if pipe_data.get('last_inspection'):
            if isinstance(pipe_data['last_inspection'], str):
                last_inspection = datetime.fromisoformat(pipe_data['last_inspection'].replace('Z', '+00:00'))
            else:
                last_inspection = pipe_data['last_inspection']
            days_since_inspection = (datetime.now() - last_inspection.replace(tzinfo=None)).days
        
        # Base features (matching the training data structure)
        features = [
            age_years,
            pipe_data.get('length', 1000.0),
            pipe_data.get('diameter', 200.0),
            pipe_data.get('current_flow', 500.0),
            pipe_data.get('flow_capacity', 1000.0),
            pipe_data.get('pressure_loss', 0.1),
            utilization_ratio,
            days_since_inspection,
            0  # num_past_maintenances - simplified for now
        ]
        
        # Material encoding (one-hot encoded features)
        material = pipe_data.get('material', 'steel').lower()
        material_concrete = 1 if material == 'concrete' else 0
        material_pvc = 1 if material == 'pvc' else 0
        material_steel = 1 if material == 'steel' else 0
        
        # Status encoding
        status = pipe_data.get('status', 'operational').lower()
        status_maintenance = 1 if status == 'maintenance' else 0
        status_operational = 1 if status == 'operational' else 0
        
        # Add encoded features
        features.extend([
            material_concrete,
            material_pvc, 
            material_steel,
            status_maintenance,
            status_operational
        ])
        
        return np.array(features)
    
    def _calculate_priority(self, days_until: float) -> str:
        """Calculate maintenance priority based on days until maintenance"""
        if days_until < 30:
            return "high"
        elif days_until < 90:
            return "medium"
        else:
            return "low"
    
    def _calculate_confidence(self, features: np.ndarray, prediction: float) -> float:
        """Calculate confidence score for the prediction"""
        # Simplified confidence calculation
        # In a real scenario, you might use model uncertainty or ensemble methods
        
        # Base confidence
        confidence = 0.8
        
        # Adjust based on data completeness
        if len(features) == 14:  # All features present
            confidence += 0.1
        
        # Adjust based on prediction reasonableness
        if 30 <= prediction <= 365:  # Reasonable maintenance interval
            confidence += 0.05
        elif prediction < 30 or prediction > 730:  # Extreme values
            confidence -= 0.2
        
        return max(0.5, min(0.95, confidence))
    
    def _recommend_maintenance_type(self, pipe_data: Dict, days_until: float) -> str:
        """Recommend type of maintenance based on pipe data and urgency"""
        status = pipe_data.get('status', 'operational').lower()
        age_years = 10  # Default
        
        if pipe_data.get('installation_date'):
            if isinstance(pipe_data['installation_date'], str):
                installation_date = datetime.fromisoformat(pipe_data['installation_date'].replace('Z', '+00:00'))
            else:
                installation_date = pipe_data['installation_date']
            age_years = (datetime.now() - installation_date.replace(tzinfo=None)).days / 365.25
        
        if status == 'damaged':
            return "repair"
        elif status == 'maintenance':
            return "replacement"
        elif days_until < 30:
            return "urgent_inspection"
        elif age_years > 15:
            return "replacement_assessment"
        else:
            return "routine_inspection"
    
    def _estimate_cost(self, pipe_data: Dict, days_until: float) -> float:
        """Estimate maintenance cost"""
        base_cost = 1000.0  # Base cost for pipe maintenance
        
        # Adjust based on pipe length
        length = pipe_data.get('length', 1000.0)
        cost_per_meter = 1.5
        length_cost = (length / 1000.0) * cost_per_meter * base_cost
        
        # Adjust based on urgency
        if days_until < 30:
            urgency_multiplier = 1.5  # Emergency work costs more
        elif days_until < 90:
            urgency_multiplier = 1.2
        else:
            urgency_multiplier = 1.0
        
        # Adjust based on material
        material = pipe_data.get('material', 'steel').lower()
        material_multiplier = {
            'steel': 1.0,
            'pvc': 0.8,
            'concrete': 1.3,
            'cast_iron': 1.4
        }.get(material, 1.0)
        
        total_cost = length_cost * urgency_multiplier * material_multiplier
        
        return round(total_cost, 2)
    
    def _identify_key_factors(self, features: np.ndarray, pipe_data: Dict) -> list:
        """Identify key factors influencing the maintenance prediction"""
        factors = []
        
        # Age factor
        if len(features) > 0:
            age_years = features[0]
            if age_years > 15:
                factors.append("High pipe age")
            elif age_years > 10:
                factors.append("Moderate pipe age")
        
        # Utilization factor
        if len(features) > 6:
            utilization = features[6]
            if utilization > 0.8:
                factors.append("High flow utilization")
            elif utilization < 0.3:
                factors.append("Low flow utilization")
        
        # Inspection factor
        if len(features) > 7:
            days_since_inspection = features[7]
            if days_since_inspection > 365:
                factors.append("Overdue inspection")
            elif days_since_inspection > 180:
                factors.append("Inspection due soon")
        
        # Material factor
        material = pipe_data.get('material', 'steel').lower()
        if material in ['cast_iron', 'concrete']:
            factors.append("Material requires frequent maintenance")
        
        # Status factor
        status = pipe_data.get('status', 'operational').lower()
        if status in ['maintenance', 'damaged']:
            factors.append("Current status requires attention")
        
        return factors if factors else ["Normal operating conditions"]
    
    def _fallback_prediction(self, pipe_data: Dict) -> Dict:
        """Fallback prediction when AI model is not available"""
        # Simple rule-based prediction
        age_years = 10
        if pipe_data.get('installation_date'):
            if isinstance(pipe_data['installation_date'], str):
                installation_date = datetime.fromisoformat(pipe_data['installation_date'].replace('Z', '+00:00'))
            else:
                installation_date = pipe_data['installation_date']
            age_years = (datetime.now() - installation_date.replace(tzinfo=None)).days / 365.25
        
        # Base interval based on age and material
        material = pipe_data.get('material', 'steel').lower()
        base_days = {
            'steel': 180,
            'pvc': 365,
            'concrete': 270,
            'cast_iron': 120
        }.get(material, 180)
        
        # Adjust based on age
        if age_years > 15:
            base_days = int(base_days * 0.7)
        elif age_years > 10:
            base_days = int(base_days * 0.85)
        
        # Adjust based on status
        status = pipe_data.get('status', 'operational').lower()
        if status in ['maintenance', 'damaged']:
            base_days = int(base_days * 0.5)
        
        next_maintenance_date = datetime.now() + timedelta(days=base_days)
        
        return {
            "next_maintenance_date": next_maintenance_date.isoformat(),
            "days_until_maintenance": base_days,
            "priority": self._calculate_priority(base_days),
            "confidence": 0.6,
            "prediction_source": "rule_based",
            "maintenance_type": self._recommend_maintenance_type(pipe_data, base_days),
            "estimated_cost": self._estimate_cost(pipe_data, base_days),
            "factors": ["Rule-based prediction (AI model unavailable)"]
        }

# Global instance
maintenance_predictor = MaintenancePredictionService()