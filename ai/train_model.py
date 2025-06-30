import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

# Load dataset
data_path = os.path.join("data", "maintenance_prediction_data.csv")
df = pd.read_csv(data_path)

# Preprocess
df = pd.get_dummies(df, columns=["material", "status"], drop_first=True)

# Features and target
X = df.drop("next_maintenance_days", axis=1)
y = df["next_maintenance_days"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
preds = model.predict(X_test)
print("MAE:", mean_absolute_error(y_test, preds))
print("R²:", r2_score(y_test, preds))

# Save model
os.makedirs("model", exist_ok=True)
joblib.dump(model, os.path.join("model", "regressor.pkl"))
print("Model saved to model/regressor.pkl")
