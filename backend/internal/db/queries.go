package db

import (
	"context"

	"flow-sentinel/internal/models"
)

// InsertTelemetry inserts a new telemetry record into the database
func (d *Database) InsertTelemetry(ctx context.Context, t *models.Telemetry) error {
	query := `
		INSERT INTO telemetry (node_id, flow_rate, pressure, temperature, timestamp)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`
	err := d.pool.QueryRow(ctx, query, t.NodeID, t.FlowRate, t.Pressure, t.Temperature, t.Timestamp).Scan(&t.ID, &t.CreatedAt)
	return err
}
