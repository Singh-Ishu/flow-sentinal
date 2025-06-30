import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Optional
import os

class UniversalMaintenancePredictionService:
    """Enhanced service to predict maintenance dates for any component type using AI model"""
    
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
    
    def predict_maintenance_date(self, component_data: Dict) -> Dict:
        """
        Predict next maintenance date for any component using the AI model
        
        Args:
            component_data: Dictionary containing component information
            
        Returns:
            Dictionary with prediction results
        """
        if not self.model:
            return self._fallback_prediction(component_data)
        
        try:
            # Prepare features for the model
            features = self._prepare_universal_features(component_data)
            
            print(f"Prepared {len(features)} features for prediction: {features}")
            
            # Make prediction (returns days until next maintenance)
            days_until_maintenance = self.model.predict([features])[0]
            
            # Ensure reasonable bounds
            days_until_maintenance = max(7, min(730, days_until_maintenance))
            
            # Calculate the actual date
            next_maintenance_date = datetime.now() + timedelta(days=int(days_until_maintenance))
            
            # Determine priority based on days until maintenance
            priority = self._calculate_priority(days_until_maintenance)
            
            # Get confidence score
            confidence = self._calculate_confidence(features, days_until_maintenance, component_data)
            
            return {
                "next_maintenance_date": next_maintenance_date.isoformat(),
                "days_until_maintenance": int(days_until_maintenance),
                "priority": priority,
                "confidence": confidence,
                "prediction_source": "ai_model",
                "maintenance_type": self._recommend_maintenance_type(component_data, days_until_maintenance),
                "estimated_cost": self._estimate_cost_inr(component_data, days_until_maintenance),
                "factors": self._identify_key_factors(features, component_data)
            }
            
        except Exception as e:
            print(f"Error in AI prediction: {e}")
            return self._fallback_prediction(component_data)
    
    def _prepare_universal_features(self, component_data: Dict) -> np.ndarray:
        """Prepare features for the AI model based on any component data"""
        
        # Calculate age in years
        age_years = self._calculate_age(component_data)
        
        # Calculate utilization ratio (works for both pipes and nodes)
        utilization_ratio = self._calculate_utilization(component_data)
        
        # Calculate days since last inspection/maintenance
        days_since_inspection = self._calculate_days_since_inspection(component_data)
        
        # Get component size/capacity metric
        size_metric = self._get_size_metric(component_data)
        
        # Get flow metrics
        current_flow, flow_capacity = self._get_flow_metrics(component_data)
        
        # Get pressure loss (or equivalent stress metric)
        pressure_loss = self._get_pressure_loss(component_data)
        
        # Base features (matching the training data structure - 15 features total)
        features = [
            age_years,                    # age_years
            size_metric,                  # length (or equivalent size)
            self._get_diameter_equivalent(component_data),  # diameter equivalent
            current_flow,                 # current_flow
            flow_capacity,                # flow_capacity  
            pressure_loss,                # pressure_loss
            utilization_ratio,            # utilization_ratio
            days_since_inspection,        # days_since_inspection
            self._get_maintenance_count(component_data)  # num_past_maintenances
        ]
        
        # Material encoding (one-hot encoded features) - 3 features
        material = self._get_material_equivalent(component_data)
        material_concrete = 1 if material == 'concrete' else 0
        material_pvc = 1 if material == 'pvc' else 0
        material_steel = 1 if material == 'steel' else 0
        
        # Status encoding - 2 features
        status = component_data.get('status', 'operational').lower()
        status_maintenance = 1 if status in ['maintenance', 'offline'] else 0
        status_operational = 1 if status in ['operational', 'active'] else 0
        
        # Add encoded features (total should be 15)
        features.extend([
            material_concrete,      # 10
            material_pvc,          # 11
            material_steel,        # 12
            status_maintenance,    # 13
            status_operational     # 14
        ])
        
        # Ensure we have exactly 15 features
        if len(features) != 15:
            print(f"Warning: Expected 15 features, got {len(features)}")
            # Pad or trim to 15 features
            while len(features) < 15:
                features.append(0.0)
            features = features[:15]
        
        return np.array(features, dtype=np.float64)
    
    def _calculate_age(self, component_data: Dict) -> float:
        """Calculate component age in years"""
        installation_date = component_data.get('installation_date')
        if installation_date:
            if isinstance(installation_date, str):
                installation_date = datetime.fromisoformat(installation_date.replace('Z', '+00:00'))
            age_years = (datetime.now() - installation_date.replace(tzinfo=None)).days / 365.25
            return max(0, age_years)
        
        # Default age based on component type
        component_type = component_data.get('type', 'unknown')
        default_ages = {
            'pump': 8.0,
            'valve': 12.0,
            'sensor': 5.0,
            'junction': 15.0,
            'pipe': 10.0
        }
        return default_ages.get(component_type, 10.0)
    
    def _calculate_utilization(self, component_data: Dict) -> float:
        """Calculate utilization ratio for any component"""
        # For pipes
        if component_data.get('current_flow') and component_data.get('flow_capacity'):
            return min(1.0, component_data['current_flow'] / component_data['flow_capacity'])
        
        # For nodes with pressure
        if component_data.get('pressure') and component_data.get('max_pressure'):
            return min(1.0, component_data['pressure'] / component_data['max_pressure'])
        
        # For nodes with flow rate
        if component_data.get('flow_rate'):
            # Estimate capacity based on component type
            component_type = component_data.get('type', 'unknown')
            estimated_capacity = {
                'pump': 2000,
                'junction': 1500,
                'valve': 1000,
                'sensor': 800
            }.get(component_type, 1000)
            return min(1.0, component_data['flow_rate'] / estimated_capacity)
        
        return 0.5  # Default moderate utilization
    
    def _calculate_days_since_inspection(self, component_data: Dict) -> float:
        """Calculate days since last inspection"""
        last_inspection = component_data.get('last_inspection') or component_data.get('last_updated')
        if last_inspection:
            if isinstance(last_inspection, str):
                last_inspection = datetime.fromisoformat(last_inspection.replace('Z', '+00:00'))
            days = (datetime.now() - last_inspection.replace(tzinfo=None)).days
            return max(0, days)
        
        # Default based on component type
        component_type = component_data.get('type', 'unknown')
        default_days = {
            'pump': 90,
            'valve': 180,
            'sensor': 365,
            'junction': 270,
            'pipe': 365
        }
        return default_days.get(component_type, 365)
    
    def _get_size_metric(self, component_data: Dict) -> float:
        """Get size metric (length for pipes, equivalent for nodes)"""
        if component_data.get('length'):
            return component_data['length']
        
        # For nodes, use a size equivalent based on type
        component_type = component_data.get('type', 'unknown')
        size_equivalents = {
            'pump': 5000,      # Large equipment
            'junction': 2000,   # Medium infrastructure
            'valve': 1000,      # Smaller equipment
            'sensor': 500       # Small equipment
        }
        return size_equivalents.get(component_type, 1000)
    
    def _get_flow_metrics(self, component_data: Dict) -> tuple:
        """Get current flow and flow capacity"""
        current_flow = component_data.get('current_flow', 0)
        flow_capacity = component_data.get('flow_capacity', 0)
        
        # For nodes, use flow_rate as current_flow and estimate capacity
        if not current_flow and component_data.get('flow_rate'):
            current_flow = component_data['flow_rate']
            
        if not flow_capacity and current_flow:
            # Estimate capacity based on current flow and component type
            component_type = component_data.get('type', 'unknown')
            capacity_multipliers = {
                'pump': 1.5,
                'junction': 1.3,
                'valve': 1.2,
                'sensor': 1.1
            }
            multiplier = capacity_multipliers.get(component_type, 1.2)
            flow_capacity = current_flow * multiplier
        
        return current_flow or 500, flow_capacity or 1000
    
    def _get_pressure_loss(self, component_data: Dict) -> float:
        """Get pressure loss or equivalent stress metric"""
        if component_data.get('pressure_loss'):
            return component_data['pressure_loss']
        
        # For nodes, calculate stress based on pressure utilization
        if component_data.get('pressure') and component_data.get('max_pressure'):
            utilization = component_data['pressure'] / component_data['max_pressure']
            return utilization * 0.3  # Convert to pressure loss equivalent
        
        return 0.1  # Default low pressure loss
    
    def _get_diameter_equivalent(self, component_data: Dict) -> float:
        """Get diameter or equivalent size metric"""
        if component_data.get('diameter'):
            return component_data['diameter']
        
        # For nodes, estimate diameter based on flow capacity
        flow_capacity = component_data.get('flow_capacity') or component_data.get('flow_rate', 500)
        # Rough estimation: larger flow = larger diameter
        return min(500, max(100, flow_capacity / 5))
    
    def _get_material_equivalent(self, component_data: Dict) -> str:
        """Get material or equivalent for nodes"""
        if component_data.get('material'):
            return component_data['material'].lower()
        
        # For nodes, assign material based on type
        component_type = component_data.get('type', 'unknown')
        type_materials = {
            'pump': 'steel',
            'valve': 'steel', 
            'sensor': 'pvc',
            'junction': 'concrete'
        }
        return type_materials.get(component_type, 'steel')
    
    def _get_maintenance_count(self, component_data: Dict) -> int:
        """Get or estimate past maintenance count"""
        # This would ideally come from maintenance history
        # For now, estimate based on age and component type
        age_years = self._calculate_age(component_data)
        component_type = component_data.get('type', 'unknown')
        
        # Estimate maintenance frequency per year by type
        annual_maintenance = {
            'pump': 2,      # High maintenance
            'valve': 1,     # Medium maintenance
            'sensor': 1.5,  # Medium-high maintenance
            'junction': 0.5, # Low maintenance
            'pipe': 0.3     # Very low maintenance
        }
        
        frequency = annual_maintenance.get(component_type, 1)
        return int(age_years * frequency)
    
    def _calculate_priority(self, days_until: float) -> str:
        """Calculate maintenance priority based on days until maintenance"""
        if days_until < 30:
            return "high"
        elif days_until < 90:
            return "medium"
        else:
            return "low"
    
    def _calculate_confidence(self, features: np.ndarray, prediction: float, component_data: Dict) -> float:
        """Calculate confidence score for the prediction"""
        confidence = 0.8
        
        # Adjust based on data completeness
        if len(features) == 15:  # All features present
            confidence += 0.1
        
        # Adjust based on prediction reasonableness
        if 30 <= prediction <= 365:  # Reasonable maintenance interval
            confidence += 0.05
        elif prediction < 30 or prediction > 730:  # Extreme values
            confidence -= 0.2
        
        # Adjust based on component type (some are more predictable)
        component_type = component_data.get('type', 'unknown')
        type_confidence = {
            'pump': 0.9,      # Very predictable
            'valve': 0.85,    # Quite predictable
            'pipe': 0.9,      # Very predictable (trained on pipes)
            'sensor': 0.75,   # Less predictable
            'junction': 0.8   # Moderately predictable
        }
        
        base_confidence = type_confidence.get(component_type, 0.8)
        confidence = (confidence + base_confidence) / 2
        
        return max(0.5, min(0.95, confidence))
    
    def _recommend_maintenance_type(self, component_data: Dict, days_until: float) -> str:
        """Recommend type of maintenance based on component data and urgency"""
        status = component_data.get('status', 'operational').lower()
        component_type = component_data.get('type', 'unknown')
        age_years = self._calculate_age(component_data)
        
        if status in ['damaged', 'offline']:
            return "repair"
        elif status == 'maintenance':
            return "replacement"
        elif days_until < 30:
            return "urgent_inspection"
        elif age_years > 15:
            return "replacement_assessment"
        else:
            # Type-specific maintenance
            type_maintenance = {
                'pump': "calibration",
                'valve': "inspection", 
                'sensor': "calibration",
                'junction': "inspection",
                'pipe': "routine_inspection"
            }
            return type_maintenance.get(component_type, "routine_inspection")
    
    def _estimate_cost_inr(self, component_data: Dict, days_until: float) -> float:
        """Estimate maintenance cost in Indian Rupees"""
        component_type = component_data.get('type', 'pipe')
        
        # Base costs by component type in INR
        base_costs = {
            'pump': 200000.0,      # ₹2,00,000
            'valve': 65000.0,      # ₹65,000
            'sensor': 32000.0,     # ₹32,000
            'junction': 95000.0,   # ₹95,000
            'pipe': 12000.0        # ₹12,000 per meter
        }
        
        base_cost = base_costs.get(component_type, 80000.0)
        
        # For pipes, multiply by length
        if component_type == 'pipe' and component_data.get('length'):
            base_cost *= (component_data['length'] / 1000.0)  # Cost per km
        
        # Adjust based on urgency
        if days_until < 30:
            urgency_multiplier = 1.5  # Emergency work costs more
        elif days_until < 90:
            urgency_multiplier = 1.2
        else:
            urgency_multiplier = 1.0
        
        # Adjust based on material/complexity
        material = self._get_material_equivalent(component_data)
        material_multiplier = {
            'steel': 1.0,
            'pvc': 0.8,
            'concrete': 1.3,
            'cast_iron': 1.4
        }.get(material, 1.0)
        
        total_cost = base_cost * urgency_multiplier * material_multiplier
        
        return round(total_cost, 2)
    
    def _identify_key_factors(self, features: np.ndarray, component_data: Dict) -> list:
        """Identify key factors influencing the maintenance prediction"""
        factors = []
        component_type = component_data.get('type', 'unknown')
        
        # Age factor
        if len(features) > 0:
            age_years = features[0]
            if age_years > 15:
                factors.append(f"High {component_type} age ({age_years:.1f} years)")
            elif age_years > 10:
                factors.append(f"Moderate {component_type} age ({age_years:.1f} years)")
        
        # Utilization factor
        if len(features) > 6:
            utilization = features[6]
            if utilization > 0.8:
                factors.append("High utilization stress")
            elif utilization < 0.3:
                factors.append("Low utilization efficiency")
        
        # Inspection factor
        if len(features) > 7:
            days_since_inspection = features[7]
            if days_since_inspection > 365:
                factors.append("Overdue inspection")
            elif days_since_inspection > 180:
                factors.append("Inspection due soon")
        
        # Material factor
        material = self._get_material_equivalent(component_data)
        if material in ['cast_iron', 'concrete']:
            factors.append("Material requires frequent maintenance")
        
        # Status factor
        status = component_data.get('status', 'operational').lower()
        if status in ['maintenance', 'damaged', 'offline']:
            factors.append("Current status requires attention")
        
        # Component-specific factors
        if component_type == 'pump':
            factors.append("Critical infrastructure component")
        elif component_type == 'sensor':
            factors.append("Precision equipment requiring calibration")
        elif component_type == 'valve':
            factors.append("Mechanical component with wear parts")
        
        return factors if factors else ["Normal operating conditions"]
    
    def _fallback_prediction(self, component_data: Dict) -> Dict:
        """Fallback prediction when AI model is not available"""
        component_type = component_data.get('type', 'pipe')
        age_years = self._calculate_age(component_data)
        
        # Base intervals by component type
        base_intervals = {
            'pump': 90,
            'valve': 180,
            'sensor': 365,
            'junction': 730,
            'pipe': 365
        }
        
        base_days = base_intervals.get(component_type, 365)
        
        # Adjust based on age
        if age_years > 15:
            base_days = int(base_days * 0.7)
        elif age_years > 10:
            base_days = int(base_days * 0.85)
        
        # Adjust based on status
        status = component_data.get('status', 'operational').lower()
        if status in ['maintenance', 'damaged', 'offline']:
            base_days = int(base_days * 0.5)
        
        next_maintenance_date = datetime.now() + timedelta(days=base_days)
        
        return {
            "next_maintenance_date": next_maintenance_date.isoformat(),
            "days_until_maintenance": base_days,
            "priority": self._calculate_priority(base_days),
            "confidence": 0.6,
            "prediction_source": "rule_based",
            "maintenance_type": self._recommend_maintenance_type(component_data, base_days),
            "estimated_cost": self._estimate_cost_inr(component_data, base_days),
            "factors": ["Rule-based prediction (AI model unavailable)"]
        }

# Global instance
maintenance_predictor = UniversalMaintenancePredictionService()