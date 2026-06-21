package grpc_telemetry

import (
	"context"
	"io"
	"log"

	"flow-sentinel/internal/models"
	"flow-sentinel/internal/service"
)

type Server struct {
	UnimplementedTelemetryServiceServer
	svc *service.TelemetryService
}

func NewServer(svc *service.TelemetryService) *Server {
	return &Server{svc: svc}
}

func (s *Server) IngestTelemetry(ctx context.Context, req *TelemetryRequest) (*TelemetryResponse, error) {
	t := &models.Telemetry{
		NodeID:      req.NodeId,
		FlowRate:    req.FlowRate,
		Pressure:    req.Pressure,
		Temperature: req.Temperature,
		Timestamp:   req.Timestamp.AsTime(),
	}

	err := s.svc.ProcessTelemetry(ctx, t)
	if err != nil {
		return &TelemetryResponse{Success: false, Message: err.Error()}, nil
	}

	return &TelemetryResponse{Success: true, Message: "Telemetry received"}, nil
}

func (s *Server) StreamTelemetry(stream TelemetryService_StreamTelemetryServer) error {
	for {
		req, err := stream.Recv()
		if err == io.EOF {
			return stream.SendAndClose(&TelemetryResponse{
				Success: true,
				Message: "Stream completed",
			})
		}
		if err != nil {
			log.Printf("Error receiving from stream: %v", err)
			return err
		}

		t := &models.Telemetry{
			NodeID:      req.NodeId,
			FlowRate:    req.FlowRate,
			Pressure:    req.Pressure,
			Temperature: req.Temperature,
			Timestamp:   req.Timestamp.AsTime(),
		}

		err = s.svc.ProcessTelemetry(stream.Context(), t)
		if err != nil {
			log.Printf("Error processing telemetry: %v", err)
			// Decide whether to break or continue; usually continue on single record error
		}
	}
}
