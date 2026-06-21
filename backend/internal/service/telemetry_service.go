package service

import (
	"context"
	"log"

	"flow-sentinel/internal/db"
	"flow-sentinel/internal/models"
)

type TelemetryService struct {
	db *db.Database
}

func NewTelemetryService(db *db.Database) *TelemetryService {
	return &TelemetryService{db: db}
}

func (s *TelemetryService) ProcessTelemetry(ctx context.Context, t *models.Telemetry) error {
	err := s.db.InsertTelemetry(ctx, t)
	if err != nil {
		log.Printf("Failed to insert telemetry: %v", err)
		return err
	}

	
	return nil
}
