package rest

import (
	"flow-sentinel/internal/api/rest/handlers"
	"flow-sentinel/internal/middleware"
	"flow-sentinel/internal/service"
	"flow-sentinel/internal/websocket"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	telemetryService *service.TelemetryService,
	alertService *service.AlertService,
	taskService *service.TaskService,
	userService *service.UserService,
	wsHub *websocket.Hub,
) *gin.Engine {
	router := gin.Default()

	// Global middleware
	router.Use(middleware.LoggingMiddleware())
	router.Use(middleware.CORSMiddleware())

	// ============ AUTH ============
	auth := router.Group("/api/auth")
	{
		auth.POST("/login", handlers.Login(userService))
		auth.POST("/logout", handlers.Logout())
		auth.GET("/me", middleware.AuthMiddleware(), handlers.GetCurrentUser())
	}

	// ============ PROTECTED ROUTES ============
	protected := router.Group("/api")
	protected.Use(middleware.AuthMiddleware())

	// Telemetry
	telemetry := protected.Group("/telemetry")
	{
		telemetry.GET("/latest", handlers.GetLatestTelemetry(telemetryService))
		telemetry.POST("/ingest", handlers.IngestTelemetry(telemetryService))
		telemetry.GET("/history", handlers.GetTelemetryHistory(telemetryService))
	}

	// Alerts
	alerts := protected.Group("/alerts")
	{
		alerts.GET("", handlers.GetAlerts(alertService))
		alerts.GET("/:id", handlers.GetAlert(alertService))
		alerts.POST("/:id/acknowledge", handlers.AcknowledgeAlert(alertService))
		alerts.POST("/:id/resolve", handlers.ResolveAlert(alertService))
	}

	// Tasks
	tasks := protected.Group("/tasks")
	{
		tasks.GET("", handlers.GetTasks(taskService))
		tasks.POST("", handlers.CreateTask(taskService))
		tasks.GET("/:id", handlers.GetTask(taskService))
		tasks.PUT("/:id", handlers.UpdateTask(taskService))
		tasks.DELETE("/:id", handlers.DeleteTask(taskService))
	}

	// Users (admin only)
	users := protected.Group("/users")
	users.Use(middleware.RoleMiddleware("admin"))
	{
		users.GET("", handlers.GetUsers(userService))
		users.POST("", handlers.CreateUser(userService))
		users.GET("/:id", handlers.GetUser(userService))
		users.PUT("/:id", handlers.UpdateUser(userService))
		users.DELETE("/:id", handlers.DeleteUser(userService))
	}

	// ============ WEBSOCKET ============
	router.GET("/ws", middleware.AuthMiddleware(), handlers.WebSocketUpgrade(wsHub))

	return router
}
