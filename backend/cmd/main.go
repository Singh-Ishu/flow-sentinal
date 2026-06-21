package main

import (
	"log"
	"net"

	"flow-sentinel/internal/api/rest"
	grpc_telemetry "flow-sentinel/internal/api/grpc"
	"flow-sentinel/internal/db"
	"flow-sentinel/internal/service"
	"flow-sentinel/internal/websocket"
	"google.golang.org/grpc"
)

func main() {
	// Initialize database
	database := db.NewPostgres()
	defer database.Close()

	// Initialize services
	telemetryService := service.NewTelemetryService(database)
	alertService := service.NewAlertService(database)
	taskService := service.NewTaskService(database)
	userService := service.NewUserService(database)
	wsHub := websocket.NewHub()

	// Start gRPC server
	go func() {
		lis, err := net.Listen("tcp", ":50051")
		if err != nil {
			log.Fatalf("failed to listen on :50051: %v", err)
		}
		
		s := grpc.NewServer()
		grpcServer := grpc_telemetry.NewServer(telemetryService)
		grpc_telemetry.RegisterTelemetryServiceServer(s, grpcServer)
		
		log.Printf("gRPC server listening at %v", lis.Addr())
		if err := s.Serve(lis); err != nil {
			log.Fatalf("failed to serve gRPC: %v", err)
		}
	}()

	// Start REST API
	router := rest.SetupRoutes(telemetryService, alertService, taskService, userService, wsHub)
	log.Printf("REST API listening on :8080")
	log.Fatal(router.Run(":8080"))
}
